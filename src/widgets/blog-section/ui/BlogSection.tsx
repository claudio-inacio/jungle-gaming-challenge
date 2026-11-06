import { Container } from '@/shared/ui/container'
import { OutOfScopeLink } from '@/shared/ui/out-of-scope'

type BlogPost = {
  id: string
  meta: string
  title: string
  excerpt: string
  image: string
  imageAlt: string
}

const BLOG_POSTS: BlogPost[] = [
  {
    id: 'ownership',
    meta: '12 de setembro · Leitura de 6 min',
    title: 'Como funciona a propriedade de NFTs',
    excerpt: 'Aprenda a colecionar, negociar e verificar ativos digitais.',
    image: '/img/desktop/frame-136.webp',
    imageAlt: 'Macaco ilustrado usando jaqueta verde e óculos escuros, mascote da Kurio',
  },
  {
    id: 'artists',
    meta: '13 de setembro · Leitura de 2 min',
    title: '10 artistas digitais para acompanhar',
    excerpt: 'Conheça criadores que moldam a cultura digital.',
    image: '/img/desktop/nft-artwork-04.webp',
    imageAlt: 'Macaco ilustrado usando chapéu de pescador e moletom roxo, mascote da Kurio',
  },
  {
    id: 'rarity',
    meta: '15 de setembro · Leitura de 3 min',
    title: 'Raridade, atributos e procedência',
    excerpt: 'Entenda raridade, procedência, direitos autorais e utilidade.',
    image: '/img/mobile/mobile-nft-artwork-5.png',
    imageAlt: 'Macaco ilustrado usando blazer, mascote da Kurio',
  },
  {
    id: 'wallet-security',
    meta: '15 de setembro · Leitura de 2 min',
    title: 'Como proteger sua carteira',
    excerpt: 'Proteja sua carteira, seus ativos e sua identidade.',
    image: '/img/desktop/nft-artwork-09.webp',
    imageAlt: 'Macaco ilustrado usando fones de ouvido, mascote da Kurio',
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

        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-[repeat(4,minmax(0,268px))] lg:justify-center">
          {BLOG_POSTS.map((post) => (
            <li key={post.id} className="w-full min-w-0 lg:w-full lg:max-w-[268px]">
              <article className="flex h-full flex-col overflow-hidden rounded-md border border-border-soft bg-card lg:min-h-[369px]">
                <img
                  src={post.image}
                  alt={post.imageAlt}
                  width={268}
                  height={195}
                  loading="lazy"
                  className="aspect-[268/195] w-full shrink-0 object-cover"
                />
                <div className="flex flex-1 flex-col gap-2 p-3">
                  <p className="text-xs text-muted-foreground">{post.meta}</p>
                  <h3 className="line-clamp-2 text-base font-bold text-foreground">{post.title}</h3>
                  <p className="line-clamp-2 flex-1 text-sm text-muted-foreground">
                    {post.excerpt}
                  </p>
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
