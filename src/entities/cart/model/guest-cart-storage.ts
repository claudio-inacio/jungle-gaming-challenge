const STORAGE_KEY = 'kurio-guest-cart'

export interface GuestCartItem {
  nftId: string
  editionId: string
  quantity: number
}

export const guestCartStorage = {
  get: (): GuestCartItem[] => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    } catch {
      return []
    }
  },
  set: (items: GuestCartItem[]) => localStorage.setItem(STORAGE_KEY, JSON.stringify(items)),
  clear: () => localStorage.removeItem(STORAGE_KEY),
}
