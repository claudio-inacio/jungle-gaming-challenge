import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  http,
  queryKeys,
  walletSchema,
  type CreateWalletRequest,
  type UpdateWalletRequest,
  type Wallet,
} from '@/shared/api'

async function createWalletRequest(body: CreateWalletRequest): Promise<Wallet> {
  const { data } = await http.post('/wallets', body)
  return walletSchema.parse(data)
}

async function updateWalletRequest({
  id,
  body,
}: {
  id: string
  body: UpdateWalletRequest
}): Promise<Wallet> {
  const { data } = await http.patch(`/wallets/${id}`, body)
  return walletSchema.parse(data)
}

async function deleteWalletRequest(id: string): Promise<void> {
  await http.delete(`/wallets/${id}`)
}

export function useCreateWalletMutation(userId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createWalletRequest,
    onSuccess: () => {
      if (!userId) return undefined
      return queryClient.invalidateQueries({ queryKey: queryKeys.wallets(userId) })
    },
  })
}

export function useUpdateWalletMutation(userId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateWalletRequest,
    onSuccess: () => {
      if (!userId) return undefined
      return queryClient.invalidateQueries({ queryKey: queryKeys.wallets(userId) })
    },
  })
}

export function useDeleteWalletMutation(userId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteWalletRequest,
    onSuccess: () => {
      if (!userId) return undefined
      return queryClient.invalidateQueries({ queryKey: queryKeys.wallets(userId) })
    },
  })
}
