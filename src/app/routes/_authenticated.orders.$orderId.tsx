import { createFileRoute } from '@tanstack/react-router'
import { OrderConfirmationPage } from '@/pages/order-confirmation'
import { NotFoundPage } from '@/pages/not-found'

export const Route = createFileRoute('/_authenticated/orders/$orderId')({
  component: OrderConfirmationPage,
  notFoundComponent: NotFoundPage,
})
