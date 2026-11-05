import { useParams, useSearch } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { nftDetailQuery } from '@/entities/nft'
import { ApiError } from '@/shared/api/contracts/error'
import { NotFoundPage } from '@/pages/not-found'
import { ErrorState } from '@/shared/ui/QueryState'
import { NftGallery } from '@/widgets/nft-gallery'
import { NftDetailTabs } from '@/widgets/nft-detail-tabs'
import { RelatedNfts } from '@/widgets/related-nfts'
import { NftDetailSkeleton } from '@/shared/ui/NftDetailSkeleton'
import { NftPurchasePanel } from '@/features/add-to-cart/ui/NftPurchasePanel'

export function NftDetailPage() {
  const { nftId } = useParams({ from: '/nft/$nftId' })
  const { edition } = useSearch({ from: '/nft/$nftId' })
  const query = useQuery(nftDetailQuery(nftId))

  if (query.isPending) return <NftDetailSkeleton />

  if (query.isError) {
    if (query.error instanceof ApiError && query.error.code === 'NOT_FOUND') {
      return <NotFoundPage />
    }
    return <ErrorState description="Não foi possível carregar este NFT." onRetry={query.refetch} />
  }

  const nft = query.data

  return (
    <main className="flex flex-col gap-12">
      <div className="flex gap-10">
        <NftGallery images={nft.images} alt={nft.name} />
        <NftPurchasePanel nft={nft} initialEditionId={edition} />
      </div>
      <NftDetailTabs nft={nft} />
      <RelatedNfts collectionId={nft.collectionId} currentNftId={nft.id} />
    </main>
  )
}

// import { Link } from '@tanstack/react-router'
// import { useQuery } from '@tanstack/react-query'
// import { Minus, Plus, Share2, Star } from 'lucide-react'
// import { ApiError } from '@/shared/api'
// import { formatEth } from '@/shared/lib/eth'
// import { cn } from '@/shared/lib/utils'
// import { Badge } from '@/shared/ui/badge'
// import { Button } from '@/shared/ui/button'
// import { Container } from '@/shared/ui/container'
// import { NftDetailSkeleton } from '@/shared/ui/NftDetailSkeleton'
// import { OutOfScopeButton } from '@/shared/ui/out-of-scope'
// import { PendingLink } from '@/shared/ui/pending-link'
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
// import { Text } from '@/shared/ui/Text'
// import { NftCard, nftListQuery } from '@/entities/nft'
// import { NftGallery } from '@/widgets/nft-gallery'
// import { useNftDetailPage } from '../model/useNftDetailPage'

// function StarRating({ average, count }: { average: number; count: number }) {
//   const rounded = Math.round(average)
//   return (
//     <div
//       className="flex items-center gap-1.5"
//       role="img"
//       aria-label={`${average.toFixed(1)} de 5 estrelas, ${count} avaliações`}
//     >
//       <div className="flex gap-0.5" aria-hidden="true">
//         {Array.from({ length: 5 }, (_, index) => (
//           <Star
//             key={index}
//             className={cn(
//               'size-4',
//               index < rounded ? 'fill-primary text-primary' : 'text-muted-foreground',
//             )}
//           />
//         ))}
//       </div>
//       <Text variant="caption">
//         {average.toFixed(1)} ({count})
//       </Text>
//     </div>
//   )
// }

// function RelatedFromCollection({
//   collectionId,
//   excludeNftId,
// }: {
//   collectionId: string
//   excludeNftId: string
// }) {
//   const query = useQuery(
//     nftListQuery({
//       collections: [collectionId],
//       network: [],
//       tab: 'all',
//       sort: 'recent',
//       page: 1,
//     }),
//   )

//   const related = (query.data?.items ?? []).filter((item) => item.id !== excludeNftId).slice(0, 4)

//   if (related.length === 0) return null

//   return (
//     <section className="flex flex-col gap-4">
//       <Text as="h2" variant="heading">
//         Mais desta coleção
//       </Text>
//       <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
//         {related.map((item) => (
//           <NftCard key={item.id} nft={item} />
//         ))}
//       </div>
//     </section>
//   )
// }

// export function NftDetailPage() {
//   const { query, nft, selectedEdition, selectEdition, quantity, setQuantity, canPurchase } =
//     useNftDetailPage()

//   if (query.isPending) {
//     return (
//       <main>
//         <Container className="py-8">
//           <NftDetailSkeleton />
//         </Container>
//       </main>
//     )
//   }

//   if (query.isError) {
//     const isNotFound = query.error instanceof ApiError && query.error.code === 'NOT_FOUND'
//     return (
//       <main>
//         <Container className="flex flex-col items-center justify-center gap-4 py-16 text-center">
//           <h1 className="text-2xl font-bold">
//             {isNotFound ? 'NFT não encontrado' : 'Não foi possível carregar este NFT'}
//           </h1>
//           <p className="text-muted-foreground">
//             {isNotFound
//               ? 'O item que você procura não existe ou foi removido.'
//               : 'Ocorreu um erro ao buscar os dados. Tente novamente.'}
//           </p>
//           {isNotFound ? (
//             <Button nativeButton={false} render={<Link to="/" />}>
//               Voltar para o início
//             </Button>
//           ) : (
//             <Button onClick={() => query.refetch()}>Tentar novamente</Button>
//           )}
//         </Container>
//       </main>
//     )
//   }

//   if (!nft || !selectedEdition) return null

//   return (
//     <main>
//       <Container className="flex flex-col gap-10 py-8">
//         <div className="flex flex-col gap-4 lg:flex-row lg:gap-12">
//           <div className="lg:w-1/2">
//             <NftGallery images={nft.images} alt={nft.name} />
//           </div>

//           <div className="flex min-w-0 flex-1 flex-col gap-4">
//             <div className="flex flex-col gap-1">
//               <Text variant="caption">{nft.collectionName}</Text>
//               <Text as="h1" variant="heading">
//                 {nft.name}
//               </Text>
//             </div>

//             <StarRating average={nft.rating.average} count={nft.rating.count} />

//             <Text variant="body-lg-bold" className="text-accent-foreground">
//               {formatEth(selectedEdition.price)}
//             </Text>

//             <div className="flex flex-col gap-2">
//               <Text variant="body-bold">Sobre este NFT</Text>
//               <Text variant="body">{nft.description}</Text>
//             </div>

//             <div className="flex flex-col gap-2">
//               <Text variant="body-bold" as="span" id="nft-edition-label">
//                 Edição
//               </Text>
//               <div
//                 className="flex flex-wrap gap-2"
//                 role="group"
//                 aria-labelledby="nft-edition-label"
//               >
//                 {nft.editions.map((edition) => {
//                   const isSoldOut = edition.available === 0
//                   const isSelected = edition.id === selectedEdition.id
//                   return (
//                     <Button
//                       key={edition.id}
//                       type="button"
//                       variant={isSelected ? 'default' : 'outline'}
//                       aria-pressed={isSelected}
//                       onClick={() => selectEdition(edition.id)}
//                       className={cn(isSoldOut && 'opacity-60')}
//                     >
//                       {edition.label === 'open' ? 'ABERTA' : edition.label}
//                       {isSoldOut && <span className="ml-1.5 text-xs">(esgotado)</span>}
//                     </Button>
//                   )
//                 })}
//               </div>
//             </div>

//             <div className="flex flex-col gap-2">
//               <Text variant="body-bold" as="span" id="nft-quantity-label">
//                 Quantidade
//               </Text>
//               <div
//                 className="flex h-10 w-fit items-center gap-3 rounded-lg border border-border px-2"
//                 role="group"
//                 aria-labelledby="nft-quantity-label"
//               >
//                 <Button
//                   type="button"
//                   variant="ghost"
//                   size="icon-sm"
//                   aria-label="Diminuir quantidade"
//                   disabled={quantity <= 1}
//                   onClick={() => setQuantity(quantity - 1)}
//                 >
//                   <Minus aria-hidden="true" />
//                 </Button>
//                 <Text variant="body-bold" as="span" aria-live="polite" className="w-6 text-center">
//                   {quantity}
//                 </Text>
//                 <Button
//                   type="button"
//                   variant="ghost"
//                   size="icon-sm"
//                   aria-label="Aumentar quantidade"
//                   disabled={quantity >= selectedEdition.available}
//                   onClick={() => setQuantity(quantity + 1)}
//                 >
//                   <Plus aria-hidden="true" />
//                 </Button>
//               </div>
//             </div>

//             <div className="flex flex-col gap-3 pt-2 sm:flex-row">
//               <PendingLink
//                 className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-primary text-primary-foreground sm:w-48 disabled:opacity-50"
//                 disabled={!canPurchase}
//               >
//                 {canPurchase ? 'Comprar' : 'Esgotado'}
//               </PendingLink>
//               <OutOfScopeButton variant="outline" size="icon-lg" aria-label="Compartilhar este NFT">
//                 <Share2 aria-hidden="true" />
//               </OutOfScopeButton>
//             </div>
//           </div>
//         </div>

//         <Tabs defaultValue="details">
//           <TabsList>
//             <TabsTrigger value="details">Detalhes</TabsTrigger>
//             <TabsTrigger value="reviews">Avaliações</TabsTrigger>
//           </TabsList>

//           <TabsContent value="details" className="flex flex-col gap-6 pt-4">
//             <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
//               <div className="flex flex-col gap-1">
//                 <dt>
//                   <Text variant="caption">Token</Text>
//                 </dt>
//                 <dd>
//                   <Text variant="body-bold">{nft.tokenId}</Text>
//                 </dd>
//               </div>
//               <div className="flex flex-col gap-1">
//                 <dt>
//                   <Text variant="caption">Coleção</Text>
//                 </dt>
//                 <dd>
//                   <Text variant="body-bold">{nft.collectionName}</Text>
//                 </dd>
//               </div>
//               <div className="flex flex-col gap-1">
//                 <dt>
//                   <Text variant="caption">Rede</Text>
//                 </dt>
//                 <dd>
//                   <Text variant="body-bold" className="capitalize">
//                     {nft.network}
//                   </Text>
//                 </dd>
//               </div>
//             </dl>

//             {nft.attributes.length > 0 && (
//               <div className="flex flex-col gap-2">
//                 <Text variant="body-bold">Atributos</Text>
//                 <div className="flex flex-wrap gap-2">
//                   {nft.attributes.map((attribute) => (
//                     <Badge key={`${attribute.trait}-${attribute.value}`} variant="edition">
//                       {attribute.trait}: {attribute.value}
//                     </Badge>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </TabsContent>

//           <TabsContent value="reviews" className="flex flex-col gap-3 pt-4">
//             <StarRating average={nft.rating.average} count={nft.rating.count} />
//             <PendingLink className="text-left text-sm text-muted-foreground underline underline-offset-4">
//               Ver avaliações detalhadas
//             </PendingLink>
//           </TabsContent>
//         </Tabs>

//         <RelatedFromCollection collectionId={nft.collectionId} excludeNftId={nft.id} />
//       </Container>
//     </main>
//   )
// }
