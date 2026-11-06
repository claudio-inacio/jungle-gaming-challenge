export const queryKeys = {
  session: () => ['session'] as const,

  nfts: {
    list: (params: Record<string, unknown>) => ['nfts', 'list', params] as const,
    detail: (id: string) => ['nfts', 'detail', id] as const,
    collections: () => ['nfts', 'collections'] as const,
  },

  favorites: (userId: string) => ['favorites', userId] as const,
  cart: (userId: string) => ['cart', userId] as const,
  quote: {
    // Sem `hash`: usado para invalidar todas as cotações do usuário quando um
    // `nft.updated` chega - invalidar com a chave completa (`detail`) nunca
    // casaria com o hash real em cache (hash nunca é string vazia).
    scope: (userId: string) => ['quote', userId] as const,
    detail: (userId: string, hash: string) => ['quote', userId, hash] as const,
  },
  orders: {
    list: (userId: string) => ['orders', userId] as const,
    detail: (userId: string, orderId: string) => ['orders', userId, orderId] as const,
  },
  profile: (userId: string) => ['profile', userId] as const,
  wallets: (userId: string) => ['wallets', userId] as const,
} as const
