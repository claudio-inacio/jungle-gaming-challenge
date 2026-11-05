import { Container } from '@/shared/ui/container'
import { OutOfScopeButton, OutOfScopeInput, OutOfScopeLink } from '@/shared/ui/out-of-scope'
import { PendingLink } from '@/shared/ui/pending-link'
import { Separator } from '@/shared/ui/separator'
import { CompatibleWallets } from './CompatibleWallets'
import { FacebookIcon, InstagramIcon, LinkedinIcon, TwitterIcon, YoutubeIcon } from './social-icons'

type Highlight = {
  glyph: 'W' | 'C' | 'D'
  title: string
  description: string
}

const HIGHLIGHTS: Highlight[] = [
  {
    glyph: 'W',
    title: 'Segurança da carteira',
    description: 'Proteja sua carteira e colecione arte digital verificada com confiança.',
  },
  {
    glyph: 'C',
    title: 'Criadores em destaque',
    description: 'Conheça artistas, estúdios e comunidades que moldam a cultura digital na rede.',
  },
  {
    glyph: 'D',
    title: 'Alertas de lançamentos',
    description:
      'Receba calendários de cunhagem, novidades de listas de acesso e análises do mercado.',
  },
]

type FooterLink = {
  label: string
  kind: 'pending' | 'out-of-scope'
}

type LinkColumn = {
  title: string
  links: FooterLink[]
}

const LINK_COLUMNS: LinkColumn[] = [
  {
    title: 'Meu perfil',
    links: [
      { label: 'Meu perfil', kind: 'pending' },
      { label: 'Minha coleção', kind: 'out-of-scope' },
      { label: 'Atividade', kind: 'out-of-scope' },
      { label: 'Estúdio do criador', kind: 'out-of-scope' },
      { label: 'Lista de interesse', kind: 'pending' },
    ],
  },
  {
    title: 'Central de ajuda',
    links: [
      { label: 'Central de ajuda', kind: 'out-of-scope' },
      { label: 'Como comprar NFTs', kind: 'out-of-scope' },
      { label: 'Carteira e segurança', kind: 'out-of-scope' },
      { label: 'Política do mercado', kind: 'out-of-scope' },
      { label: 'Denunciar item', kind: 'out-of-scope' },
    ],
  },
  {
    title: 'Coleções',
    links: [
      { label: 'Arte digital', kind: 'out-of-scope' },
      { label: 'Fotografia', kind: 'out-of-scope' },
      { label: 'Música', kind: 'out-of-scope' },
      { label: 'Arte 3D', kind: 'out-of-scope' },
      { label: 'Utilidade', kind: 'out-of-scope' },
    ],
  },
]

const SOCIAL_LINKS = [
  { label: 'Facebook', icon: FacebookIcon },
  { label: 'Instagram', icon: InstagramIcon },
  { label: 'Twitter', icon: TwitterIcon },
  { label: 'LinkedIn', icon: LinkedinIcon },
  { label: 'YouTube', icon: YoutubeIcon },
]

const COMPATIBLE_WALLETS = ['MetaMask', 'WalletConnect', 'Coinbase']

function SiteFooter() {
  return (
    <footer className="w-full bg-background py-10">
      <Container>
        <div className="overflow-hidden rounded-1xl bg-card text-card-foreground">
          <div className="border-b border-border-soft px-4 py-8 lg:px-6">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-stretch">
              {HIGHLIGHTS.map((highlight, index) => (
                <div key={highlight.title} className="flex flex-1 items-stretch gap-8">
                  <div className="flex flex-1 items-center gap-4 lg:flex-col lg:items-start lg:gap-3">
                    <span
                      aria-hidden="true"
                      className="flex size-[74px] shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
                    >
                      <span aria-hidden="true" className="text-[28px] font-bold">
                        {highlight.glyph}
                      </span>
                    </span>
                    <div className="flex flex-col gap-1 lg:gap-3">
                      <h2 className="text-[17px] font-bold text-foreground">{highlight.title}</h2>
                      <p className="text-sm leading-[22px] text-muted-foreground lg:max-w-[23ch]">
                        {highlight.description}
                      </p>
                    </div>
                  </div>
                  {index < HIGHLIGHTS.length - 1 && (
                    <Separator
                      orientation="vertical"
                      className="hidden self-stretch bg-primary lg:block"
                    />
                  )}
                </div>
              ))}

              <Separator
                orientation="vertical"
                className="hidden self-stretch bg-primary lg:block"
              />
              <Separator orientation="horizontal" className="bg-primary lg:hidden" />

              <div className="flex flex-1 flex-col gap-4 lg:max-w-[357px] lg:pl-4">
                <h2 className="text-lg font-bold text-foreground">
                  Antecipe-se ao próximo lançamento
                </h2>
                <form
                  className="flex items-center overflow-hidden rounded-md bg-muted shadow-[0_0_10px_rgba(10,6,4,0.45)]"
                  onSubmit={(event) => event.preventDefault()}
                  aria-label="Inscrição na newsletter"
                >
                  <label htmlFor="footer-newsletter-email" className="sr-only">
                    Seu e-mail
                  </label>
                  <OutOfScopeInput
                    id="footer-newsletter-email"
                    type="email"
                    autoComplete="off"
                    placeholder="digite seu e-mail..."
                    className="h-10 flex-1 rounded-none border-none bg-transparent shadow-none focus-visible:ring-0"
                  />
                  <OutOfScopeButton type="submit" className="h-10 shrink-0 rounded-l-none">
                    Enviar
                  </OutOfScopeButton>
                </form>
                <p className="text-[13px] leading-[22px] text-muted-foreground">
                  Receba lançamentos selecionados, histórias de criadores e novidades do mercado.
                </p>
              </div>
            </div>
          </div>

          <div className="border-b border-border-soft bg-muted px-4 py-6 lg:px-6">
            <div className="flex flex-col gap-3 text-sm text-foreground lg:flex-row lg:items-center lg:justify-between lg:gap-8">
              <p className="text-sm font-bold tracking-[1.4px] text-foreground">KURIO</p>
              <p className="leading-[22px]">
                Feito para colecionadores,
                <br />
                criadores e cultura
              </p>
              <p className="leading-[22px]">contato@email.com</p>
              <p className="leading-[22px]">+55 11 4002 8922</p>
            </div>
          </div>

          <div className="px-4 py-8 lg:px-6">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {LINK_COLUMNS.map((column) => (
                <nav key={column.title} aria-label={column.title}>
                  <h2 className="mb-2 text-lg font-bold text-foreground">{column.title}</h2>
                  <ul className="flex flex-col gap-1">
                    {column.links.map((link) => {
                      const LinkComponent = link.kind === 'pending' ? PendingLink : OutOfScopeLink
                      return (
                        <li key={link.label}>
                          <LinkComponent className="block py-1 text-sm leading-[22px] text-foreground">
                            {link.label}
                          </LinkComponent>
                        </li>
                      )
                    })}
                  </ul>
                </nav>
              ))}

              <div className="flex flex-col gap-8">
                <div>
                  <h2 className="mb-3 text-lg font-bold text-foreground">Redes sociais</h2>
                  <ul className="flex flex-wrap items-center gap-2.5">
                    {SOCIAL_LINKS.map((social) => (
                      <li key={social.label}>
                        <OutOfScopeLink
                          aria-label={social.label}
                          className="flex size-[30px] items-center justify-center rounded-md border border-accent-foreground text-accent-foreground"
                        >
                          <social.icon className="size-4" />
                        </OutOfScopeLink>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h2 className="mb-3 text-lg font-bold text-foreground">Carteiras compatíveis</h2>
                  <CompatibleWallets wallets={COMPATIBLE_WALLETS} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <p className="mt-4 text-center text-sm leading-[30px] text-foreground">
          © 2026 Kurio. Propriedade digital para todos.
        </p>
      </Container>
    </footer>
  )
}

export { SiteFooter }
