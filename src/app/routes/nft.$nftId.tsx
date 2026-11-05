import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { NftDetailPage } from '@/pages/nft-detail'
import { NotFoundPage } from '@/pages/not-found'

export const Route = createFileRoute('/nft/$nftId')({
  validateSearch: z.object({ edition: z.string().optional() }),
  component: NftDetailPage,
  notFoundComponent: NotFoundPage,
})
