import { z } from 'zod'
import { idSchema, isoDateSchema } from './common'
import { nftSummarySchema } from './nft'

export const favoriteSchema = z.object({
  nftId: idSchema,
  createdAt: isoDateSchema,
})
export type Favorite = z.infer<typeof favoriteSchema>

export const favoriteListResponseSchema = z.object({
  items: z.array(nftSummarySchema),
})
export type FavoriteListResponse = z.infer<typeof favoriteListResponseSchema>

export const addFavoriteRequestSchema = z.object({
  nftId: idSchema,
})
export type AddFavoriteRequest = z.infer<typeof addFavoriteRequestSchema>
