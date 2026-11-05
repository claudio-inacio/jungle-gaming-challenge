import { Container } from '@/shared/ui/container'
import { OutOfScopeLink } from '@/shared/ui/out-of-scope'

type BlogPost = {
  id: string
  meta: string
  title: string
  excerpt: string
}

const BLOG_POSTS: BlogPost[] = [
  {
    id: 'ownership',
    meta: '12 de setembro · Leitura de 6 min',
    title: 'Como funciona a propriedade de NFTs',
    excerpt: 'Aprenda a colecionar, negociar e verificar ativos digitais.',
  },
  {
    id: 'artists',
    meta: '13 de setembro · Leitura de 2 min',
    title: '10 artistas digitais para acompanhar',
    excerpt: 'Conheça criadores que moldam a cultura digital.',
  },
  {
    id: 'rarity',
    meta: '15 de setembro · Leitura de 3 min',
    title: 'Raridade, atributos e procedência',
    excerpt: 'Entenda raridade, procedência, direitos autorais e utilidade.',
  },
  {
    id: 'wallet-security',
    meta: '15 de setembro · Leitura de 2 min',
    title: 'Como proteger sua carteira',
    excerpt: 'Proteja sua carteira, seus ativos e sua identidade.',
  },
]

function BlogSection() {
  return (
    <section aria-labelledby="blog-section-heading" className="w-full">
      <Container>
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <h2 id="blog-section-heading" className="text-2xl font-bold text-foreground">
            Diário da Cunhagem
          </h2>
          <p className="text-sm text-muted-foreground">
            Histórias, guias e insights para colecionadores sobre o universo da propriedade digital.
          </p>
        </div>

        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 2xl:grid-cols-4 2xl:justify-center 2xl:gap-[24px]">
          {BLOG_POSTS.map((post) => (
            <li key={post.id} className="w-full 2xl:w-[268px]">
              <article className="flex h-full flex-col overflow-hidden rounded-md border border-border-soft bg-card">
                <div aria-hidden="true" className="aspect-[268/195] w-full bg-muted" />
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <p className="text-xs text-muted-foreground">{post.meta}</p>
                  <h3 className="text-base font-bold text-foreground">{post.title}</h3>
                  <p className="flex-1 text-sm text-muted-foreground">{post.excerpt}</p>
                  <OutOfScopeLink className="self-start text-sm font-bold text-accent-foreground">
                    Ler mais →
                  </OutOfScopeLink>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}

export { BlogSection }
