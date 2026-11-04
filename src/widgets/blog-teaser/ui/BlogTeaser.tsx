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

function BlogTeaser() {
  return (
    <section
      aria-labelledby="blog-teaser-heading"
      className="w-full bg-background px-4 py-10 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-6 flex flex-col gap-1">
          <h2 id="blog-teaser-heading" className="text-2xl font-bold text-foreground">
            Diário da Cunhagem
          </h2>
          <p className="text-sm text-muted-foreground">
            Histórias, guias e insights para colecionadores sobre o universo da propriedade digital.
          </p>
        </div>

        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {BLOG_POSTS.map((post) => (
            <li key={post.id}>
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
      </div>
    </section>
  )
}

export { BlogTeaser }
