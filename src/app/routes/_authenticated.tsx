import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { sessionQuery, tokenStorage, endSession } from '@/entities/session'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ context, location }) => {
    const token = tokenStorage.get()
    if (!token) {
      throw redirect({ to: '/login', search: { redirect: location.href } })
    }
    try {
      await context.queryClient.ensureQueryData(sessionQuery())
    } catch {
      await endSession(context.queryClient)
      throw redirect({ to: '/login', search: { redirect: location.href } })
    }
  },
  component: Outlet,
})
