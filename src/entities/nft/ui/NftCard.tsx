import { Link } from '@tanstack/react-router'
import { Text } from '@/shared/ui/Text'
import { formatEth } from '@/shared/lib/eth'
import type { NftSummary } from '@/shared/api'

export function NftCard({ nft }: { nft: NftSummary }) {
  return (
    <Link
      to="/nft/$nftId"
      params={{ nftId: nft.id }}
      className="flex flex-col gap-3 outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
    >
      <img
        src={nft.image}
        alt={nft.name}
        width={258}
        height={300}
        loading="lazy"
        className="aspect-[258/300] w-full rounded-xl object-cover"
      />
      <Text variant="body-bold">{nft.name}</Text>
      <Text variant="body" className="text-accent-foreground">
        {formatEth(nft.price)}
        {nft.previousPrice && (
          <span className="ml-2 text-muted-foreground line-through">
            {formatEth(nft.previousPrice)}
          </span>
        )}
      </Text>
    </Link>
  )
}
