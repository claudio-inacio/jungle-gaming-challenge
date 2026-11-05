import { createFileRoute } from '@tanstack/react-router'
import { catalogSearchSchema } from '@/entities/nft'
import { HomePage } from '@/pages/home'

export const Route = createFileRoute('/')({
  validateSearch: catalogSearchSchema,
  component: HomePage,
})
