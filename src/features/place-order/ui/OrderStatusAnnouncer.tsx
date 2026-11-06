export function OrderStatusAnnouncer({ message }: { message: string }) {
  if (!message) return null
  return (
    <p role="status" aria-live="polite" className="sr-only">
      {message}
    </p>
  )
}
