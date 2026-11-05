import { Link } from '@tanstack/react-router'
import { Text } from '@/shared/ui/Text'
import { formatEth } from '@/shared/lib/eth'
import type { NftSummary } from '@/shared/api'

export function NftCard({ nft }: { nft: NftSummary }) {
  return (
    <Link
      to="/nft/$nftId"
      params={{ nftId: nft.id }}
      className="flex min-w-0 flex-col gap-1 outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl lg:w-full lg:max-w-[258px] lg:p-[7px]"
    >
      <img
        src={nft.image}
        alt=""
        width={244}
        height={286}
        loading="lazy"
        className="aspect-[244/286] w-full shrink-0 rounded-xl object-cover"
      />
      <Text variant="body-bold" className="line-clamp-1">
        {nft.name}
      </Text>
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
