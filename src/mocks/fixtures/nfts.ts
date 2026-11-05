import { faker } from '@faker-js/faker'
import Big from 'big.js'
import {
  nftDetailSchema,
  type NftDetail,
  type NftEdition,
  type NftEditionType,
} from '@/shared/api/contracts/nft'
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
// para os 40 NFTs fake — evita dependência de serviço externo (picsum). `nft-artwork-18`
// e `mobile-nft-artwork-4/6` são a mesma foto que `nft-artwork-04`/`nft-artwork-09` em
// outra resolução — ficam de fora para não exibir "duplicatas" lado a lado no grid.
const ARTWORK_POOL = [
  '/img/desktop/nft-artwork-04.png',
  '/img/desktop/nft-artwork-09.png',
  '/img/mobile/mobile-nft-artwork-5.png',
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

// Embaralha o pool a cada volta completa (faker.helpers.shuffle respeita a seed ativa
// dentro de withSeed) e concatena as voltas até cobrir `length` itens — evita o ciclo
// visualmente idêntico que `pickCyclic` produziria em um grid de 3 colunas.
function buildShuffledArtworkSequence(length: number): string[] {
  const sequence: string[] = []
  while (sequence.length < length) {
    sequence.push(...faker.helpers.shuffle([...ARTWORK_POOL]))
  }
  return sequence.slice(0, length)
}

function pickFromSequence(sequence: readonly string[], index: number): string {
  const item = sequence[index]
  if (item === undefined) throw new Error('pickFromSequence: index out of bounds')
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

// Multiplicadores sobre o preço base do NFT: edição única (1/1) é a mais cara,
// edição aberta a mais barata — reflete escassez sem precisar de outro gerador aleatório.
const EDITION_PRICE_MULTIPLIER: Record<NftEdition['label'], number> = {
  '1/1': 1.5,
  '1/10': 1.2,
  '1/50': 1,
  open: 0.7,
}

const EDITION_TOTAL_SUPPLY: Record<NftEdition['label'], number | null> = {
  '1/1': 1,
  '1/10': 10,
  '1/50': 50,
  open: null,
}

// nft_001 (índice 0), edição "1/10", nasce esgotada de propósito: caso determinístico
// e estável entre execuções para testes E2E de "edição esgotada" sem depender de ação do usuário.
const SOLD_OUT_EDITION_NFT_INDEX = 0
const SOLD_OUT_EDITION_LABEL: NftEdition['label'] = '1/10'

function buildEditionAvailability(
  label: NftEdition['label'],
  totalSupply: number | null,
  forceSoldOut: boolean,
): number {
  if (forceSoldOut) return 0
  if (label === '1/1') return 1
  if (label === 'open') return faker.number.int({ min: 20, max: 500 })
  return faker.number.int({ min: 1, max: totalSupply ?? 1 })
}

function buildEditions(nftId: string, basePrice: string, nftIndex: number): NftEdition[] {
  return (['1/1', '1/10', '1/50', 'open'] as const).map((label) => {
    const totalSupply = EDITION_TOTAL_SUPPLY[label]
    const forceSoldOut = nftIndex === SOLD_OUT_EDITION_NFT_INDEX && label === SOLD_OUT_EDITION_LABEL

    return {
      id: `${nftId}-edition-${label.replace('/', '-')}`,
      label,
      price: new Big(basePrice).times(EDITION_PRICE_MULTIPLIER[label]).toFixed(3),
      totalSupply,
      available: buildEditionAvailability(label, totalSupply, forceSoldOut),
    }
  })
}

const NFT_COUNT = 40
const MAX_GALLERY_SIZE = ARTWORK_POOL.length

export const fixtureNfts: NftDetail[] = withSeed(42, () => {
  const coverSequence = buildShuffledArtworkSequence(NFT_COUNT)
  const gallerySequence = buildShuffledArtworkSequence(NFT_COUNT + MAX_GALLERY_SIZE)

  return Array.from({ length: NFT_COUNT }, (_, index) => {
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

    const id = `nft_${String(index + 1).padStart(3, '0')}`
    const reviewCount = faker.number.int({ min: 0, max: 400 })
    const attributes = buildAttributes()
    const editions = buildEditions(id, price, index)

    const nft: NftDetail = {
      id,
      tokenId: `#${String(faker.number.int({ min: 1, max: 9999 })).padStart(4, '0')}`,
      name: buildName(),
      collectionId: collection.id,
      collectionName: collection.name,
      image: pickFromSequence(coverSequence, index),
      editions,
      reviewCount,
      attributes,
      price,
      previousPrice,
      network,
      isRare: index % 5 === 0,
      isFavorited: false,
      favorited: false,
      available: buildAvailability(edition.editionType, edition.totalSupply, soldOut),
      description: faker.lorem.paragraph(),
      contractAddress: faker.finance.ethereumAddress(),
      images: Array.from(
        { length: faker.number.int({ min: 1, max: MAX_GALLERY_SIZE }) },
        (_, imgIndex) => pickFromSequence(gallerySequence, index + imgIndex),
      ),
      rating: {
        average: faker.number.float({ min: 3, max: 5, fractionDigits: 1 }),
        count: reviewCount,
      },
      editionType: edition.editionType,
      totalSupply: edition.totalSupply,
      isNew: index % 7 === 0,
      isTrending: index % 6 === 0,
      createdAt,
    }

    return nft
  })
})

// Garante que a fixture nunca diverge do contrato (falha rápido se algum campo ficar fora do schema).
nftDetailSchema.array().parse(fixtureNfts)
