import { z } from 'zod'
import { ethAmountSchema, idSchema, isoDateSchema, networkSchema, paginatedSchema } from './common'

export const nftEditionTypeSchema = z.enum(['unique', 'limited', 'open'])
export type NftEditionType = z.infer<typeof nftEditionTypeSchema>

export const nftAttributeSchema = z.object({
  trait: z.string(),
  value: z.string(),
})
export type NftAttribute = z.infer<typeof nftAttributeSchema>
export const nftEditionSchema = z.object({
  id: idSchema,
  label: z.enum(['1/1', '1/10', '1/50', 'open']),
  price: ethAmountSchema,
  totalSupply: z.number().int().positive().nullable(),
  available: z.number().int().min(0),
})
export type NftEdition = z.infer<typeof nftEditionSchema>

export const nftSummarySchema = z.object({
  id: idSchema,
  tokenId: z.string(),
  name: z.string(),
  collectionId: idSchema,
  collectionName: z.string(),
  image: z.string().min(1),
  editions: z.array(nftEditionSchema).min(1),
  reviewCount: z.number().int().min(0),
  attributes: z.array(z.object({ trait: z.string(), value: z.string() })),
  price: ethAmountSchema,
  previousPrice: ethAmountSchema.nullable(),
  network: networkSchema,
  isFavorited: z.boolean(),
  isRare: z.boolean(),
  favorited: z.boolean(),
  available: z.number().int().min(0),
})
export type NftSummary = z.infer<typeof nftSummarySchema>

export const nftDetailSchema = nftSummarySchema.extend({
  description: z.string(),
  contractAddress: z.string().min(1),
  images: z.array(z.string().min(1)).min(1),
  rating: z.object({
    average: z.number().min(0).max(5),
    count: z.number().int().min(0),
  }),
  attributes: z.array(nftAttributeSchema),
  editionType: nftEditionTypeSchema,
  totalSupply: z.number().int().min(1).nullable(),
  editions: z.array(nftEditionSchema).min(1),
  isNew: z.boolean(),
  isTrending: z.boolean(),
  createdAt: isoDateSchema,
})
export type NftDetail = z.infer<typeof nftDetailSchema>

export const nftListSortSchema = z.enum(['relevance', 'price_asc', 'price_desc', 'newest'])
export type NftListSort = z.infer<typeof nftListSortSchema>

export const nftListTabSchema = z.enum(['all', 'new', 'trending'])
export type NftListTab = z.infer<typeof nftListTabSchema>

export const nftListQuerySchema = z.object({
  q: z.string().optional(),
  collections: z.array(idSchema).optional(),
  priceMin: ethAmountSchema.optional(),
  priceMax: ethAmountSchema.optional(),
  network: z.array(networkSchema).optional(),
  tab: nftListTabSchema.default('all'),
  sortBy: nftListSortSchema.default('relevance'),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(12),
})
export type NftListQuery = z.infer<typeof nftListQuerySchema>

export const nftListResponseSchema = paginatedSchema(nftSummarySchema)
export type NftListResponse = z.infer<typeof nftListResponseSchema>

export const nftCollectionSchema = z.object({
  id: idSchema,
  name: z.string(),
  count: z.number().int().min(0),
})
export type NftCollection = z.infer<typeof nftCollectionSchema>

export const nftCollectionListResponseSchema = z.array(nftCollectionSchema)
