import { useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { toast } from 'sonner'
import { useSession } from '@/entities/session'
import { ApiError, http, queryKeys, walletSchema, type Wallet } from '@/shared/api'
import { walletsQuery } from '../api/wallets'

export type ConnectWalletStatus = 'idle' | 'connecting' | 'connected' | 'refused'

export function useConnectWallet() {
  const { user } = useSession()
  const queryClient = useQueryClient()
  const walletsResult = useQuery(walletsQuery(user?.id))
  const [pendingWalletId, setPendingWalletId] = useState<string | null>(null)
  const [refusedMessage, setRefusedMessage] = useState<string | null>(null)
  const connectAbortRef = useRef<AbortController | null>(null)
  const wasCancelledRef = useRef(false)

  const wallets = walletsResult.data ?? []
  const hasNoWallets = !walletsResult.isLoading && wallets.length === 0
  const connectedWallet = wallets.find((wallet) => wallet.isConnected) ?? null

  function setWalletInCache(updatedWallet: Wallet) {
    if (!user) return
    queryClient.setQueryData(queryKeys.wallets(user.id), (current: Wallet[] | undefined) =>
      (current ?? []).map((wallet) =>
        wallet.id === updatedWallet.id
          ? updatedWallet
          : updatedWallet.isConnected
            ? { ...wallet, isConnected: false }
            : wallet,
      ),
    )
  }

  const connectMutation = useMutation({
    mutationFn: async (selectedWalletId: string) => {
      const controller = new AbortController()
      connectAbortRef.current = controller
      const { data } = await http.post(`/wallets/${selectedWalletId}/connect`, undefined, {
        signal: controller.signal,
      })
      return walletSchema.parse(data)
    },
  })

  const disconnectMutation = useMutation({
    mutationFn: async (selectedWalletId: string) => {
      const { data } = await http.post(`/wallets/${selectedWalletId}/disconnect`)
      return walletSchema.parse(data)
    },
  })

  // Abortar a request no cliente não garante que o servidor não processou o
  // connect - por isso o /disconnect de desfazer roda tanto se a resposta de
  // sucesso chega depois do cancelamento quanto se a request foi abortada.
  async function revertCancelledConnection(walletId: string) {
    try {
      const revertedWallet = await disconnectMutation.mutateAsync(walletId)
      setWalletInCache(revertedWallet)
      toast.info('Conexão cancelada')
    } catch {
      toast.error('Não foi possível cancelar a conexão. Tente desconectar manualmente.')
    }
  }

  async function connect(selectedWalletId: string) {
    if (connectMutation.isPending) return
    wasCancelledRef.current = false
    setPendingWalletId(selectedWalletId)
    setRefusedMessage(null)
    try {
      const connectedWalletResponse = await connectMutation.mutateAsync(selectedWalletId)
      connectAbortRef.current = null

      if (wasCancelledRef.current) {
        wasCancelledRef.current = false
        await revertCancelledConnection(connectedWalletResponse.id)
        return
      }

      setWalletInCache(connectedWalletResponse)
      toast.success('Carteira conectada')
    } catch (caughtError) {
      connectAbortRef.current = null
      const wasCancelled = wasCancelledRef.current
      wasCancelledRef.current = false
      if (axios.isCancel(caughtError) || wasCancelled) {
        await revertCancelledConnection(selectedWalletId)
        return
      }
      const message =
        caughtError instanceof ApiError
          ? caughtError.message
          : 'Não foi possível conectar a carteira.'
      setRefusedMessage(message)
      toast.error(message)
    } finally {
      setPendingWalletId(null)
    }
  }

  function refuse() {
    wasCancelledRef.current = true
    connectAbortRef.current?.abort()
  }

  async function disconnect() {
    if (!connectedWallet || disconnectMutation.isPending) return
    try {
      const disconnectedWallet = await disconnectMutation.mutateAsync(connectedWallet.id)
      setWalletInCache(disconnectedWallet)
      toast.info('Carteira desconectada')
    } catch (caughtError) {
      const message =
        caughtError instanceof ApiError
          ? caughtError.message
          : 'Não foi possível desconectar a carteira.'
      toast.error(message)
    }
  }

  const status: ConnectWalletStatus = connectMutation.isPending
    ? 'connecting'
    : connectedWallet
      ? 'connected'
      : refusedMessage
        ? 'refused'
        : 'idle'

  return {
    status,
    wallets,
    hasNoWallets,
    isLoadingWallets: walletsResult.isLoading,
    walletsError: walletsResult.error,
    connectedWallet,
    pendingWalletId,
    refusedMessage,
    connect,
    refuse,
    disconnect,
  }
}
