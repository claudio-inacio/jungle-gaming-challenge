import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import type { CreateWalletRequest, UpdateWalletRequest, Wallet, WalletType } from '@/shared/api'
import { applyApiFieldErrors } from '@/shared/lib/form'
import { useCreateWalletMutation, useUpdateWalletMutation } from '../api/wallets'
import { walletFormSchema, type WalletFormValues } from './wallet-form-schema'

function toDefaultValues(wallet?: Wallet): WalletFormValues {
  return {
    label: wallet?.label ?? '',
    provider: wallet?.provider ?? 'metamask',
    network: wallet?.network ?? 'ethereum',
    address: wallet?.address ?? '',
    ensName: wallet?.ensName ?? '',
  }
}

export function useWalletForm({
  type,
  wallet,
  userId,
  onSuccess,
}: {
  type: WalletType
  wallet?: Wallet
  userId: string | undefined
  onSuccess?: () => void
}) {
  const createMutation = useCreateWalletMutation(userId)
  const updateMutation = useUpdateWalletMutation(userId)
  const isPending = createMutation.isPending || updateMutation.isPending

  const form = useForm<WalletFormValues>({
    resolver: zodResolver(walletFormSchema),
    defaultValues: toDefaultValues(wallet),
  })

  function handleSuccess() {
    toast.success(wallet ? 'Carteira atualizada com sucesso.' : 'Carteira cadastrada com sucesso.')
    onSuccess?.()
  }

  function handleError(error: unknown) {
    const mapped = applyApiFieldErrors(error, form.setError)
    if (!mapped) {
      toast.error(
        wallet
          ? 'Não foi possível atualizar a carteira.'
          : 'Não foi possível cadastrar a carteira.',
      )
    }
  }

  const onSubmit = form.handleSubmit((values) => {
    if (wallet) {
      const dirtyFields = form.formState.dirtyFields
      const body: UpdateWalletRequest = {}
      if (dirtyFields.label) body.label = values.label || null
      if (dirtyFields.provider) body.provider = values.provider
      if (dirtyFields.network) body.network = values.network
      if (dirtyFields.address) body.address = values.address
      if (dirtyFields.ensName) body.ensName = values.ensName || null

      updateMutation.mutate(
        { id: wallet.id, body },
        { onSuccess: handleSuccess, onError: handleError },
      )
      return
    }

    const body: CreateWalletRequest = {
      type,
      provider: values.provider,
      network: values.network,
      address: values.address,
      label: values.label || null,
      ensName: values.ensName || null,
    }
    createMutation.mutate(body, {
      onSuccess: handleSuccess,
      onError: handleError,
    })
  })

  return { form, onSubmit, isPending }
}
