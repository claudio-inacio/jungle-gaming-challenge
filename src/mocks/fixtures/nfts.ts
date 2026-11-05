import { faker } from '@faker-js/faker'
import Big from 'big.js'
import { nftDetailSchema, type NftDetail, type NftEditionType } from '@/shared/api/contracts/nft'
import { withSeed } from './seed'

const COLLECTIONS = [
  { id: 'col_violet_nomads', name: 'Violet Nomads' },
  { id: 'col_crypto_punks_kurio', name: 'Crypto Punks Kurio' },
  { id: 'col_neon_beasts', name: 'Neon Beasts' },
  { id: 'col_pixel_dreams', name: 'Pixel Dreams' },
  { id: 'col_cosmic_cats', name: 'Cosmic Cats' },
  { id: 'col_retro_waves', name: 'Retro Waves' },
] as const

const NETWORKS = ['ethereum', 'polygon', 'solana'] as const

// Pool fixo de artes reais exportadas do Figma (public/img), reaproveitadas em ciclo
// para os 40 NFTs fake — evita dependência de serviço externo (picsum).
const ARTWORK_POOL = [
  '/img/desktop/nft-artwork-04.png',
  '/img/desktop/nft-artwork-09.png',
  '/img/desktop/nft-artwork-18.png',
  '/img/mobile/mobile-nft-artwork-4.png',
  '/img/mobile/mobile-nft-artwork-5.png',
  '/img/mobile/mobile-nft-artwork-6.png',
] as const

const EDITIONS: Array<{ label: string; editionType: NftEditionType; totalSupply: number | null }> =
  [
    { label: '1/1', editionType: 'unique', totalSupply: 1 },
    { label: '1/10', editionType: 'limited', totalSupply: 10 },
    { label: '1/50', editionType: 'limited', totalSupply: 50 },
    { label: 'aberta', editionType: 'open', totalSupply: null },
  ]

const ATTRIBUTE_TRAITS = ['Background', 'Eyes', 'Mouth', 'Accessory', 'Fur', 'Headwear'] as const

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1)
}

function buildName(): string {
  return `${capitalize(faker.word.adjective())} ${capitalize(faker.word.noun())}`
}

function buildAttributes(): NftDetail['attributes'] {
  const count = faker.number.int({ min: 2, max: 4 })
  return faker.helpers
    .arrayElements(ATTRIBUTE_TRAITS, count)
    .map((trait) => ({ trait, value: capitalize(faker.word.sample()) }))
}

function buildPrice(): string {
  return new Big(faker.number.float({ min: 0.05, max: 32, fractionDigits: 3 })).toFixed(
    faker.helpers.arrayElement([2, 3]),
  )
}

function pickCyclic<T>(arr: readonly T[], index: number): T {
  const item = arr[index % arr.length]
  if (item === undefined) throw new Error('pickCyclic: empty array')
  return item
}

function buildAvailability(
  editionType: NftEditionType,
  totalSupply: number | null,
  soldOut: boolean,
): number {
  if (soldOut) return 0
  if (editionType === 'unique') return 1
  if (editionType === 'open') return faker.number.int({ min: 20, max: 500 })
  // limitada: parte do supply ainda disponível
  return faker.number.int({ min: 1, max: totalSupply ?? 1 })
}

export const fixtureNfts: NftDetail[] = withSeed(42, () =>
  Array.from({ length: 40 }, (_, index) => {
    const collection = pickCyclic(COLLECTIONS, index)
    const network = pickCyclic(NETWORKS, index)
    const edition = pickCyclic(EDITIONS, index)
    const soldOut = index % 9 === 0 // ~4-5 itens esgotados, espalhados
    const hasDiscount = index % 3 === 0 // ~13 itens com preço riscado

    const price = buildPrice()
    const previousPrice = hasDiscount
      ? new Big(price)
          .times(faker.number.float({ min: 1.1, max: 1.6, fractionDigits: 2 }))
          .toFixed(2)
      : null

    const createdAt = faker.date
      .between({ from: '2025-06-01T00:00:00.000Z', to: '2026-01-01T00:00:00.000Z' })
      .toISOString()

    const nft: NftDetail = {
      id: `nft_${String(index + 1).padStart(3, '0')}`,
      tokenId: `#${String(faker.number.int({ min: 1, max: 9999 })).padStart(4, '0')}`,
      name: buildName(),
      collectionId: collection.id,
      collectionName: collection.name,
      image: pickCyclic(ARTWORK_POOL, index),
      price,
      previousPrice,
      network,
      isRare: index % 5 === 0,
      favorited: false,
      available: buildAvailability(edition.editionType, edition.totalSupply, soldOut),
      description: faker.lorem.paragraph(),
      images: Array.from({ length: faker.number.int({ min: 1, max: 4 }) }, (_, imgIndex) =>
        pickCyclic(ARTWORK_POOL, index + imgIndex),
      ),
      rating: {
        average: faker.number.float({ min: 3, max: 5, fractionDigits: 1 }),
        count: faker.number.int({ min: 0, max: 400 }),
      },
      attributes: buildAttributes(),
      editionType: edition.editionType,
      totalSupply: edition.totalSupply,
      isNew: index % 7 === 0,
      isTrending: index % 6 === 0,
      createdAt,
    }

    return nft
  }),
)

// Garante que a fixture nunca diverge do contrato (falha rápido se algum campo ficar fora do schema).
nftDetailSchema.array().parse(fixtureNfts)
