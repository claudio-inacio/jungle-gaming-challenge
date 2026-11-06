const STORAGE_KEY_PREFIX = 'kurio-pending-order-key:'

function storageKey(userId: string): string {
  return `${STORAGE_KEY_PREFIX}${userId}`
}

export const idempotency = {
  get(userId: string): string | null {
    return localStorage.getItem(storageKey(userId))
  },
  ensure(userId: string): string {
    const existing = idempotency.get(userId)
    if (existing) return existing
    const key = crypto.randomUUID()
    localStorage.setItem(storageKey(userId), key)
    return key
  },
  clear(userId: string): void {
    localStorage.removeItem(storageKey(userId))
  },
}
