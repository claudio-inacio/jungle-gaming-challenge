import type { NftDetail } from '@/shared/api'
import { OutOfScopeButton } from '@/shared/ui/out-of-scope'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { StarRating } from '@/shared/ui/StarRating'
import { Text } from '@/shared/ui/Text'

type Props = {
  nft: NftDetail
}

const TAB_TRIGGER_CLASS =
  'h-auto flex-none rounded-none border-none bg-transparent p-0 text-sm font-medium text-muted-foreground after:bg-accent-foreground data-active:border-none data-active:bg-transparent data-active:font-bold data-active:text-accent-foreground'

function truncateAddress(address: string): string {
  if (address.length <= 12) return address
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

export function NftDetailTabs({ nft }: Props) {
  const [firstParagraph, secondParagraph] = nft.longDescription.split('\n\n')

  return (
    <Tabs defaultValue="details">
      <TabsList variant="line" className="h-auto gap-6 border-b border-border p-0">
        <TabsTrigger value="details" className={TAB_TRIGGER_CLASS}>
          Detalhes do NFT
        </TabsTrigger>
        <TabsTrigger value="reviews" className={TAB_TRIGGER_CLASS}>
          Avaliações de colecionadores ({nft.rating.count})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="details" className="flex flex-col gap-6 pt-6">
        <div className="flex flex-col gap-4">
          <Text variant="body">{firstParagraph}</Text>
          {secondParagraph && <Text variant="body">{secondParagraph}</Text>}
        </div>

        <div className="flex flex-col gap-1">
          <Text variant="body-bold">Rede:</Text>
          <Text variant="body" className="text-muted-foreground">
            {nft.networkInfo}
          </Text>
        </div>

        <div className="flex flex-col gap-1">
          <Text variant="body-bold">Contrato:</Text>
          <Text variant="body" className="text-muted-foreground">
            {nft.royaltyInfo}
          </Text>
        </div>

        <div className="flex flex-col gap-1">
          <Text variant="body-bold">Direitos autorais:</Text>
          <Text variant="body" className="text-muted-foreground">
            <abbr
              title={nft.contractAddress}
              aria-label={nft.contractAddress}
              className="no-underline"
            >
              {truncateAddress(nft.contractAddress)}
            </abbr>{' '}
            · Contrato inteligente ERC-721 verificado.
          </Text>
        </div>
      </TabsContent>

      <TabsContent value="reviews" className="flex flex-col gap-3 pt-6">
        <StarRating average={nft.rating.average} count={nft.rating.count} />
        <OutOfScopeButton
          variant="outline"
          className="w-fit"
          aria-label="Ver avaliações detalhadas"
        >
          Ver avaliações detalhadas
        </OutOfScopeButton>
      </TabsContent>
    </Tabs>
  )
}
