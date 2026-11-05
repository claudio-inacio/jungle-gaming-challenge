import { z } from 'zod'

export const catalogSearchSchema = z.object({
  q: z.string().optional(),
  collections: z.array(z.string()).optional().default([]),
  network: z
    .array(z.enum(['ethereum', 'polygon', 'solana']))
    .optional()
    .default([]),
  priceMin: z.coerce.number().min(0).optional(),
  priceMax: z.coerce.number().min(0).optional(),
  tab: z.enum(['all', 'new', 'trending']).optional().default('all'),
  sort: z.enum(['recent', 'price-asc', 'price-desc']).optional().default('recent'),
  page: z.coerce.number().int().min(1).optional().default(1),
})
export type CatalogSearch = z.infer<typeof catalogSearchSchema>
