import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/nft/$nftId')({
  component: () => <p>Detalhe do NFT </p>,
})
