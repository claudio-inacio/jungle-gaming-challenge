import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { collectorProfileSchema, type CollectorProfile, type User, type Wallet } from '@/shared/api'

export function useCollectorProfileForm(user: User | null, connectedWallet: Wallet | null) {
  const form = useForm<CollectorProfile>({
    resolver: zodResolver(collectorProfileSchema),
    mode: 'onBlur',
    defaultValues: {
      displayName: '',
      username: '',
      network: 'ethereum',
      walletAddress: '',
      ensName: '',
      walletType: 'primary',
      referralCode: '',
      email: '',
    },
  })

  const appliedUserDefaults = useRef(false)
  useEffect(() => {
    if (appliedUserDefaults.current || !user) return
    appliedUserDefaults.current = true
    form.setValue('displayName', user.displayName)
    form.setValue('username', user.username)
    form.setValue('email', user.email)
  }, [user, form])

  const lastSyncedWalletId = useRef<string | null>(null)
  useEffect(() => {
    if (!connectedWallet || lastSyncedWalletId.current === connectedWallet.id) return
    lastSyncedWalletId.current = connectedWallet.id
    form.setValue('network', connectedWallet.network, { shouldValidate: true })
    form.setValue('walletAddress', connectedWallet.address, { shouldValidate: true })
    form.setValue('walletType', connectedWallet.type, { shouldValidate: true })
    form.setValue('ensName', connectedWallet.ensName ?? '', { shouldValidate: true })
  }, [connectedWallet, form])

  return form
}
