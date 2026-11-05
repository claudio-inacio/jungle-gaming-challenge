import type { Order } from '@/shared/api/contracts/order'
import { fixtureUsers } from '../fixtures/users'
import { fixtureNfts } from '../fixtures/nfts'
import type { Wallet } from '@/shared/api/contracts/wallet'

// `password` existe só nas fixtures (credenciais de demo documentadas no README).
// `passwordHash` é o que usuários cadastrados em runtime recebem - nunca em claro.
export interface MockUser {
  id: string
  email: string
  username: string
  displayName: string
  createdAt: string
  password?: string
  passwordHash?: string
}

export interface DbState {
  users: MockUser[]
  sessions: Record<string, { userId: string; expiresAt: string }>
  nfts: typeof fixtureNfts
  favorites: Record<string, string[]> // userId -> nftId[]
  carts: Record<string, { nftId: string; editionId: string; quantity: number }[]> // userId -> itens
  orders: Record<string, Order[]>
  idempotencyKeys: Record<string, { userId: string; orderId: string; bodyHash: string }>
  profiles: Record<string, unknown>
  wallets: Record<string, Wallet[]>
}

// v2: fixtures passaram a usar imagens locais em vez de picsum.photos; o sufixo
// força sessões com DB persistido na v1 a reidratar a partir das novas fixtures.
// v3: `nftDetailSchema`/`nftSummarySchema` ganharam campos obrigatórios novos
// (contractAddress, editions, reviewCount, attributes, isFavorited) - sem esse
// bump, um DB v2 já persistido no localStorage falha o `zod.parse()` dos
// handlers (campos ausentes), derrubando o catálogo e o detalhe inteiros.
// v4: `nftDetailSchema` ganhou `longDescription`, `networkInfo` e `royaltyInfo`
// (texto da aba "Detalhes do NFT" no detalhe, distinto do `description` curto
// exibido em "Sobre este NFT") - mesmo motivo do bump v3: campos obrigatórios
// novos quebrariam o parse de um DB v3 já persistido.
// v5: linhas de `carts` passaram a guardar `editionId` (o carrinho agora é
// edition-aware; sem isso `cartItemSchema.editionId`/`editionLabel` nunca
// seriam resolvidos) - mesmo motivo dos bumps anteriores: um `carts` v4 já
// persistido não tem esse campo e quebraria o `buildCart()`/parse da resposta.
const STORAGE_KEY = 'kurio-mocks-db:v5'

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
    users: [...fixtureUsers],
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
