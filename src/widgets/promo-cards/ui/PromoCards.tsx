import { Container } from '@/shared/ui/container'
import { PromoCard } from './PromoCard'

type PromoCardData = {
  id: string
  title: string
  description: string
}

const PROMO_CARDS: PromoCardData[] = [
  {
    id: 'genesis-drops',
    title: 'Lançamentos gênesis de edição limitada',
    description: 'Colecione edições escassas diretamente dos criadores antes da revelação pública.',
  },
  {
    id: 'curated-art',
    title: 'Arte digital selecionada e muito mais',
    description:
      'Explore novos artistas, coleções verificadas e obras digitais que definem a cultura.',
  },
]

function PromoCards() {
  return (
    <section aria-labelledby="promo-cards-heading" className="w-full">
      <Container>
        <h2 id="promo-cards-heading" className="sr-only">
          Destaques do mercado
        </h2>
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-[28px]">
          {PROMO_CARDS.map((card) => (
            <PromoCard key={card.id} title={card.title} description={card.description} />
          ))}
        </div>
      </Container>
    </section>
  )
}

export { PromoCards }
