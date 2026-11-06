import { createFileRoute } from '@tanstack/react-router'
import { CheckoutPage } from '@/pages/checkout'

export const Route = createFileRoute('/_authenticated/checkout')({
  component: CheckoutPage,
})
