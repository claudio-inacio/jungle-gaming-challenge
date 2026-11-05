import { Link } from '@tanstack/react-router'
import { cn } from 'cn'
import { Text } from '@/shared/ui/Text'
import { formatEth } from '@/shared/lib/eth'
import type { NftSummary } from '@/shared/api'

type NftCardSize = 'default' | 'cart-related'

type Props = {
  nft: NftSummary
  size?: NftCardSize
}

const sizeClasses: Record<NftCardSize, { link: string; image: string }> = {
  default: {
    link: 'gap-1 lg:w-full lg:max-w-[258px] lg:p-[7px]',
    image: 'aspect-[244/286]',
  },
  'cart-related': {
    link: 'gap-2 w-[219px]',
    image: 'h-[255px]',
  },
}

export function NftCard({ nft, size = 'default' }: Props) {
  const classes = sizeClasses[size]

  return (
    <Link
      to="/nft/$nftId"
      params={{ nftId: nft.id }}
      className={cn(
        'flex min-w-0 flex-col outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl',
        classes.link,
      )}
    >
      <img
        src={nft.image}
        alt=""
        width={244}
        height={size === 'cart-related' ? 255 : 286}
        loading="lazy"
        className={cn('w-full shrink-0 rounded-xl object-cover', classes.image)}
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
