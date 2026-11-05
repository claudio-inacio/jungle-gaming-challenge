import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { queryKeys } from '@/shared/api'
import { fetchSession, tokenStorage } from '@/entities/session'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ context, location }) => {
    const token = tokenStorage.get()
    if (!token) {
      throw redirect({ to: '/login', search: { redirect: location.href } })
    }
    try {
      await context.queryClient.ensureQueryData({
        queryKey: queryKeys.session(),
        queryFn: () => fetchSession(),
      })
    } catch {
      tokenStorage.clear()
      throw redirect({ to: '/login', search: { redirect: location.href } })
    }
  },
  component: Outlet,
})
