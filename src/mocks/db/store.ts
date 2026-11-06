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
  cartCoupons: Record<string, string | null> // userId -> código aplicado ao carrinho (ou ausente/null)
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
// v6: cupom passou a ser do carrinho (novo campo `cartCoupons`), não de cada
// item - um DB v5 persistido não tem esse campo; sem o bump, `buildCart()`
// leria `undefined` indefinidamente em vez do estado inicial `{}`.
// v7: `orderItemSchema` ganhou `editionId`/`editionLabel` (pedido agora é
// edition-aware, mesmo motivo do carrinho na v5) e `orderSchema` ganhou
// `declinedAt` - um pedido v6 já persistido não tem esses campos e quebraria
// o `orderSchema.parse()` em `GET /api/orders/:id` e na resposta idempotente
// do `POST /api/orders`.
// v8: `walletSchema` ganhou `isConnected` (suporta `POST /api/wallets/:id/connect`
// e `/disconnect`) - uma carteira v7 já persistida não tem esse campo e
// quebraria o `walletSchema.parse()` em todo handler de carteira.
// v9: cada usuário de demo passou a nascer com uma carteira primária
// pré-cadastrada (cadastro de novas carteiras ainda não tem UI, ver
// `NoWalletsNotice`) - sem o bump, quem já tinha um DB v8 persistido (sem
// nenhuma carteira) ficaria sem conseguir testar o checkout.
const STORAGE_KEY = 'kurio-mocks-db:v9'

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

const DEMO_WALLET_ADDRESSES: Record<string, string> = {
  'user-1': '0x1a2b3c4d5e6f7890a1b2c3d4e5f6a7b8c9d0e1f2',
  'user-2': '0x9f8e7d6c5b4a39281f0e1d2c3b4a59687d6e5f4a',
}

function createInitialState(): DbState {
  return {
    users: [...fixtureUsers],
    sessions: {},
    nfts: fixtureNfts,
    favorites: {},
    carts: {},
    cartCoupons: {},
    orders: {},
    idempotencyKeys: {},
    profiles: {},
    wallets: Object.fromEntries(
      fixtureUsers.map((user) => [
        user.id,
        [
          {
            id: `wallet-${user.id}`,
            type: 'primary' as const,
            provider: 'metamask' as const,
            address: DEMO_WALLET_ADDRESSES[user.id] ?? DEMO_WALLET_ADDRESSES['user-1']!,
            network: 'ethereum' as const,
            ensName: null,
            createdAt: user.createdAt,
            isConnected: false,
          },
        ],
      ]),
    ),
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
