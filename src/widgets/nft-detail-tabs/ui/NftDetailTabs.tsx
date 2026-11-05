import { Link2, Share2, Star, X } from 'lucide-react'
import { toast } from 'sonner'
import type { NftDetail } from '@/shared/api'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { OutOfScopeButton } from '@/shared/ui/out-of-scope'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { Text } from '@/shared/ui/Text'

type Props = {
  nft: NftDetail
}

function truncateAddress(address: string): string {
  if (address.length <= 12) return address
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

function StarRating({ average, count }: { average: number; count: number }) {
  const rounded = Math.round(average)
  return (
    <div
      className="flex items-center gap-1.5"
      role="img"
      aria-label={`${average.toFixed(1)} de 5 estrelas, ${count} avaliações`}
    >
      <div className="flex gap-0.5" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (
          <Star
            key={index}
            className={cn(
              'size-4',
              index < rounded ? 'fill-primary text-primary' : 'text-muted-foreground',
            )}
          />
        ))}
      </div>
      <Text variant="caption">
        {average.toFixed(1)} ({count})
      </Text>
    </div>
  )
}

function ShareBar({ name }: { name: string }) {
  const shareUrl = typeof window === 'undefined' ? '' : window.location.href
  const encodedUrl = encodeURIComponent(shareUrl)
  const encodedName = encodeURIComponent(name)

  async function copyLink() {
    await navigator.clipboard.writeText(shareUrl)
    toast.success('Link copiado')
  }

  return (
    <div className="flex items-center gap-2" role="group" aria-label="Compartilhar este NFT">
      <Button
        variant="outline"
        size="icon-sm"
        nativeButton={false}
        render={
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Compartilhar no LinkedIn"
          />
        }
      >
        <Share2 aria-hidden="true" />
      </Button>
      <Button
        variant="outline"
        size="icon-sm"
        nativeButton={false}
        render={
          <a
            href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedName}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Compartilhar no X (Twitter)"
          />
        }
      >
        <X aria-hidden="true" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label="Copiar link"
        onClick={copyLink}
      >
        <Link2 aria-hidden="true" />
      </Button>
    </div>
  )
}

export function NftDetailTabs({ nft }: Props) {
  const createdYear = new Date(nft.createdAt).getFullYear()

  return (
    <Tabs defaultValue="details">
      <TabsList>
        <TabsTrigger value="details">Detalhes do NFT</TabsTrigger>
        <TabsTrigger value="reviews">Avaliações de colecionadores ({nft.rating.count})</TabsTrigger>
      </TabsList>

      <TabsContent value="details" className="flex flex-col gap-6 pt-4">
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-1">
            <dt>
              <Text variant="caption">Token</Text>
            </dt>
            <dd>
              <Text variant="body-bold">{nft.tokenId}</Text>
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt>
              <Text variant="caption">Coleção</Text>
            </dt>
            <dd>
              <Text variant="body-bold">{nft.collectionName}</Text>
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt>
              <Text variant="caption">Rede</Text>
            </dt>
            <dd>
              <Text variant="body-bold" className="capitalize">
                {nft.network}
              </Text>
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt>
              <Text variant="caption">Contrato</Text>
            </dt>
            <dd>
              <Text variant="body-bold" title={nft.contractAddress}>
                <abbr
                  title={nft.contractAddress}
                  aria-label={nft.contractAddress}
                  className="no-underline"
                >
                  {truncateAddress(nft.contractAddress)}
                </abbr>
              </Text>
            </dd>
          </div>
        </dl>

        {nft.attributes.length > 0 && (
          <div className="flex flex-col gap-2">
            <Text variant="body-bold">Atributos</Text>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {nft.attributes.map((attribute) => (
                <Badge key={`${attribute.trait}-${attribute.value}`} variant="edition">
                  {attribute.trait}: {attribute.value}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Text variant="caption">
          © {createdYear} {nft.collectionName}. Todos os direitos reservados ao criador original.
        </Text>

        <ShareBar name={nft.name} />
      </TabsContent>

      <TabsContent value="reviews" className="flex flex-col gap-3 pt-4">
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
