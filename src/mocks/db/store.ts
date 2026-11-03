import { fixtureUsers } from '../fixtures/users'
import { fixtureNfts } from '../fixtures/nfts'

export interface DbState {
  users: typeof fixtureUsers
  sessions: Record<string, { userId: string; expiresAt: string }>
  nfts: typeof fixtureNfts
  favorites: Record<string, string[]> // userId -> nftId[]
  carts: Record<string, { nftId: string; quantity: number }[]> // userId -> itens
  orders: Record<string, unknown[]>
  idempotencyKeys: Record<string, { userId: string; orderId: string; bodyHash: string }>
  profiles: Record<string, unknown>
  wallets: Record<string, unknown[]>
}

const STORAGE_KEY = 'kurio-mocks-db'

// Em Node (testes de integração, SSR) não há `window`/`localStorage`; cai para
// um Map em memória para o processo continuar funcionando sem persistência real.
const memoryStorage = new Map<string, string>()

function getStorageItem(key: string): string | null {
  if (typeof window === 'undefined') return memoryStorage.get(key) ?? null
  return window.localStorage.getItem(key)
}

function setStorageItem(key: string, value: string): void {
  if (typeof window === 'undefined') {
    memoryStorage.set(key, value)
    return
  }
  window.localStorage.setItem(key, value)
}

function createInitialState(): DbState {
  return {
    users: fixtureUsers,
    sessions: {},
    nfts: fixtureNfts,
    favorites: {},
    carts: {},
    orders: {},
    idempotencyKeys: {},
    profiles: {},
    wallets: {},
  }
}

let state: DbState = load() ?? createInitialState()

function load(): DbState | null {
  try {
    const raw = getStorageItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as DbState) : null
  } catch {
    return null
  }
}

function persist() {
  try {
    setStorageItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore
  }
}

export const db = {
  get: () => state,
  update: (mutator: (draft: DbState) => void) => {
    mutator(state)
    persist()
  },
  reset: () => {
    state = createInitialState()
    persist()
  },
}
