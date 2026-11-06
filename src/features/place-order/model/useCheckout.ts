import { useCallback, useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ApiError,
  http,
  queryKeys,
  realtimeEventSchema,
  socket,
  orderSchema,
  type CartItem,
  type Network,
  type Order,
} from '@/shared/api'
import { useSession } from '@/entities/session'
import { quoteQuery } from '@/entities/quote'
import { compareEth } from '@/shared/lib/eth'
import { idempotency } from '@/shared/lib/idempotency'

export type CheckoutStep =
  'form' | 'review' | 'revalidating-quote' | 'confirming' | 'pending' | 'confirmed' | 'declined'

type UseCheckoutArgs = {
  items: CartItem[]
  couponCode: string | null
  walletAddress: string | null
  network: Network | null
}

type LastAppliedEvent = { eventId: string; version: number }

function statusMessageFor(step: CheckoutStep): string {
  switch (step) {
    case 'revalidating-quote':
      return 'Revalidando valores antes de confirmar o pedido.'
    case 'confirming':
      return 'Enviando seu pedido.'
    case 'pending':
      return 'Pagamento em processamento. Aguarde a confirmação.'
    case 'confirmed':
      return 'Pedido confirmado.'
    case 'declined':
      return 'Pedido recusado.'
    default:
      return ''
  }
}

export function useCheckout({ items, couponCode, walletAddress, network }: UseCheckoutArgs) {
  const { user } = useSession()
  const queryClient = useQueryClient()

  const [step, setStep] = useState<CheckoutStep>('form')
  const [order, setOrder] = useState<Order | null>(null)
  const [lastSeenTotal, setLastSeenTotal] = useState<string | null>(null)
  const [quoteChanged, setQuoteChanged] = useState(false)
  const [isRecoveringOrder, setIsRecoveringOrder] = useState(true)
  const [confirmError, setConfirmError] = useState<string | null>(null)

  const isSubmittingRef = useRef(false)
  const lastAppliedEventRef = useRef<LastAppliedEvent | null>(null)
  const orderRef = useRef<Order | null>(null)
  const reconciledOrderIdsRef = useRef<Set<string>>(new Set())

  const quoteResult = useQuery(quoteQuery({ items, couponCode, userId: user?.id }))

  const placeOrderMutation = useMutation({
    mutationFn: async (idempotencyKey: string) => {
      if (!walletAddress || !network) throw new Error('missing-wallet')
      const { data } = await http.post(
        '/orders',
        {
          items: items.map((item) => ({
            nftId: item.nftId,
            editionId: item.editionId,
            quantity: item.quantity,
          })),
          couponCode,
          walletAddress,
          network,
        },
        { headers: { 'Idempotency-Key': idempotencyKey } },
      )
      return orderSchema.parse(data)
    },
  })

  const applyOrder = useCallback(
    (nextOrder: Order) => {
      const currentOrder = orderRef.current
      const isLeavingTerminalStatus =
        currentOrder !== null &&
        (currentOrder.status === 'confirmed' || currentOrder.status === 'declined') &&
        nextOrder.status !== currentOrder.status
      if (isLeavingTerminalStatus) return

      orderRef.current = nextOrder
      setOrder(nextOrder)
      if (user) queryClient.setQueryData(queryKeys.orders.detail(user.id, nextOrder.id), nextOrder)
      if (nextOrder.status === 'pending') {
        setStep('pending')
        return
      }
      setStep(nextOrder.status)
      if (user) {
        idempotency.clear(user.id)
        if (nextOrder.status === 'confirmed') {
          queryClient.invalidateQueries({ queryKey: queryKeys.cart(user.id) })
          queryClient.invalidateQueries({ queryKey: queryKeys.orders.list(user.id) })
        }
      }
    },
    [user, queryClient],
  )

  useEffect(() => {
    lastAppliedEventRef.current = null
  }, [order?.id])

  useEffect(() => {
    let active = true

    async function recoverPendingOrder() {
      if (!user) {
        setIsRecoveringOrder(false)
        return
      }
      const pendingKey = idempotency.get(user.id)
      if (!pendingKey) {
        setIsRecoveringOrder(false)
        return
      }
      try {
        const { data } = await http.get('/orders', { params: { idempotencyKey: pendingKey } })
        const recoveredOrder = orderSchema.parse(data)
        if (!active) return
        applyOrder(recoveredOrder)
      } catch (caughtError) {
        if (!active) return
        if (caughtError instanceof ApiError && caughtError.code === 'NOT_FOUND') {
          idempotency.clear(user.id)
        }
      } finally {
        if (active) setIsRecoveringOrder(false)
      }
    }

    recoverPendingOrder()
    return () => {
      active = false
    }
  }, [user, applyOrder])

  useEffect(() => {
    if (step !== 'pending' || !order || !user) return

    function handleEvent(raw: unknown) {
      const parsed = realtimeEventSchema.safeParse(raw)
      if (!parsed.success || parsed.data.type !== 'order.updated') return
      const event = parsed.data
      if (!order || event.resource.id !== order.id || event.userId !== user?.id) return

      const lastApplied = lastAppliedEventRef.current
      if (
        lastApplied &&
        (lastApplied.eventId === event.eventId || event.version <= lastApplied.version)
      )
        return
      lastAppliedEventRef.current = { eventId: event.eventId, version: event.version }

      applyOrder(event.data)
    }

    socket.on('event', handleEvent)
    return () => {
      socket.off('event', handleEvent)
    }
  }, [step, order, user, applyOrder])

  useEffect(() => {
    if (step !== 'pending' || !order || !user) return

    // A resposta do POST que leva o pedido a `pending` já demora os mesmos
    // 3s simulados de toda request, mas o servidor resolve o pedido pra
    // `confirmed`/`declined` bem antes disso: o `order.updated` do caminho
    // feliz é emitido antes de existir qualquer listener pra ele. Por isso
    // reconciliamos direto pelo REST assim que entramos em `pending` (sem
    // esperar nenhum evento), e também na reconexão do socket, que cobre a
    // desconexão entre a emissão e a entrega de um `order.updated` futuro -
    // esse evento perdido nunca será reenviado. `reconciledOrderIdsRef` só
    // marca o pedido como reconciliado quando a resposta chega de fato, pra
    // um unmount antes da resposta (ex.: double-invoke do StrictMode em
    // desenvolvimento) tentar de novo em vez de ficar sem nenhuma chamada
    // imediata.
    const orderId = order.id
    let active = true
    const controller = new AbortController()

    function reconcile() {
      http
        .get(`/orders/${orderId}`, { signal: controller.signal })
        .then(({ data }) => orderSchema.parse(data))
        .then((reconciledOrder) => {
          if (!active) return
          reconciledOrderIdsRef.current.add(orderId)
          applyOrder(reconciledOrder)
        })
        .catch(() => undefined)
    }

    if (!reconciledOrderIdsRef.current.has(orderId)) reconcile()
    socket.on('connect', reconcile)
    return () => {
      active = false
      controller.abort()
      socket.off('connect', reconcile)
    }
  }, [step, order, user, applyOrder])

  function enterReview() {
    if (!user || !walletAddress || !network || items.length === 0) return
    // A chave de idempotência nasce aqui, na entrada da revisão - uma única
    // vez por tentativa de compra - e não a cada clique em "confirmar", para
    // que retomadas (refresh/timeout) do mesmo pedido reusem a mesma chave.
    idempotency.ensure(user.id)
    if (quoteResult.data) setLastSeenTotal(quoteResult.data.total)
    setQuoteChanged(false)
    setConfirmError(null)
    setStep('review')
  }

  function acceptNewQuote() {
    if (!quoteChanged) return
    if (quoteResult.data) setLastSeenTotal(quoteResult.data.total)
    setQuoteChanged(false)
    setConfirmError(null)
  }

  async function confirm() {
    if (!user || !walletAddress || !network) return
    if (step !== 'review') return
    if (isSubmittingRef.current || placeOrderMutation.isPending) return

    isSubmittingRef.current = true
    setStep('revalidating-quote')
    setConfirmError(null)
    try {
      const revalidated = await quoteResult.refetch()
      const freshQuote = revalidated.data
      if (!freshQuote) {
        setStep('review')
        return
      }

      const changed = lastSeenTotal !== null && compareEth(freshQuote.total, lastSeenTotal) !== 0
      if (changed) {
        setLastSeenTotal(freshQuote.total)
        setQuoteChanged(true)
        setStep('review')
        return
      }

      setQuoteChanged(false)
      setStep('confirming')
      const key = idempotency.ensure(user.id)
      const placedOrder = await placeOrderMutation.mutateAsync(key)
      applyOrder(placedOrder)
    } catch (caughtError) {
      // `QUOTE_CHANGED` significa que o servidor recusou o pedido porque a
      // cotação mudou entre a revisão e a confirmação - a UI precisa mostrar
      // o valor mais recente e exigir "Aceitar novo valor" antes de permitir
      // confirmar de novo, igual ao caminho detectado antes do POST acima.
      if (caughtError instanceof ApiError && caughtError.code === 'QUOTE_CHANGED') {
        const refetched = await quoteResult.refetch()
        if (refetched.data) setLastSeenTotal(refetched.data.total)
        setQuoteChanged(true)
      } else if (caughtError instanceof ApiError) {
        setConfirmError(caughtError.message)
      } else {
        setConfirmError('Não foi possível concluir o pedido. Tente novamente.')
      }
      setStep('review')
    } finally {
      isSubmittingRef.current = false
    }
  }

  function cancel() {
    if (user) idempotency.clear(user.id)
    isSubmittingRef.current = false
    lastAppliedEventRef.current = null
    orderRef.current = null
    reconciledOrderIdsRef.current.clear()
    setOrder(null)
    setLastSeenTotal(null)
    setQuoteChanged(false)
    setConfirmError(null)
    setStep('form')
  }

  const isConfirmDisabled =
    quoteChanged ||
    placeOrderMutation.isPending ||
    step === 'revalidating-quote' ||
    step === 'confirming' ||
    !walletAddress ||
    !network

  return {
    step,
    order,
    quote: quoteResult.data ?? null,
    isQuoteLoading: quoteResult.isLoading,
    quoteError: quoteResult.error,
    quoteChanged,
    confirmError,
    isRecoveringOrder,
    isConfirmDisabled,
    placeOrderError: placeOrderMutation.error,
    statusMessage: statusMessageFor(step),
    enterReview,
    acceptNewQuote,
    confirm,
    cancel,
  }
}
