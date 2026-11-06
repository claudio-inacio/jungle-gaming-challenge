import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { toast } from 'sonner'
import { endSession } from '@/entities/session'

export function SessionExpiryListener() {
  const queryClient = useQueryClient()
  const router = useRouter()

  useEffect(() => {
    async function handleExpired() {
      const current = router.state.location.href
      await endSession(queryClient)
      toast.error('Sua sessão expirou. Entre novamente para continuar.')
      router.navigate({ to: '/login', search: { redirect: current } })
    }
    window.addEventListener('session:expired', handleExpired)
    return () => window.removeEventListener('session:expired', handleExpired)
  }, [queryClient, router])

  return null
}
