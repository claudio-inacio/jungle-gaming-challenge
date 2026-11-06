import { Container } from '@/shared/ui/container'
import { PromoCard } from './PromoCard'

type PromoCardData = {
  id: string
  title: string
  description: string
  image: string
  imageAlt: string
}

const PROMO_CARDS: PromoCardData[] = [
  {
    id: 'genesis-drops',
    title: 'Lançamentos gênesis de edição limitada',
    description: 'Colecione edições escassas diretamente dos criadores antes da revelação pública.',
    image: '/img/desktop/nft-artwork-04.webp',
    imageAlt: 'Macaco ilustrado usando chapéu de pescador e moletom roxo, mascote da Kurio',
  },
  {
    id: 'curated-art',
    title: 'Arte digital selecionada e muito mais',
    description:
      'Explore novos artistas, coleções verificadas e obras digitais que definem a cultura.',
    image: '/img/desktop/nft-artwork-09.webp',
    imageAlt: 'Macaco ilustrado usando fones de ouvido, mascote da Kurio',
  },
]

function PromoCards() {
  return (
    <section aria-labelledby="promo-cards-heading" className="w-full">
      <Container>
        <h2 id="promo-cards-heading" className="sr-only">
          Destaques do mercado
        </h2>
        <div className="flex flex-col gap-6 lg:flex-row lg:justify-center lg:gap-[28px]">
          {PROMO_CARDS.map((card) => (
            <PromoCard
              key={card.id}
              title={card.title}
              description={card.description}
              image={card.image}
              imageAlt={card.imageAlt}
            />
          ))}
        </div>
      </Container>
    </section>
  )
}

export { PromoCards }
