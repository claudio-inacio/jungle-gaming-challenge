import { Bell, Globe, Mail, MessageCircle, Rss, Share2, Shield, Users } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { OutOfScopeButton, OutOfScopeInput, OutOfScopeLink } from '@/shared/ui/out-of-scope'
import { Separator } from '@/shared/ui/separator'

type Highlight = {
  icon: typeof Shield
  title: string
  description: string
}

const HIGHLIGHTS: Highlight[] = [
  {
    icon: Shield,
    title: 'Segurança da carteira',
    description: 'Proteja sua carteira e colecione arte digital verificada com confiança.',
  },
  {
    icon: Users,
    title: 'Criadores em destaque',
    description: 'Conheça artistas, estúdios e comunidades que moldam a cultura digital na rede.',
  },
  {
    icon: Bell,
    title: 'Alertas de lançamentos',
    description:
      'Receba calendários de cunhagem, novidades de listas de acesso e análises do mercado.',
  },
]

type LinkColumn = {
  title: string
  links: string[]
}

const LINK_COLUMNS: LinkColumn[] = [
  {
    title: 'Meu perfil',
    links: ['Meu perfil', 'Minha coleção', 'Atividade', 'Estúdio do criador', 'Lista de interesse'],
  },
  {
    title: 'Central de ajuda',
    links: [
      'Central de ajuda',
      'Como comprar NFTs',
      'Carteira e segurança',
      'Política do mercado',
      'Denunciar item',
    ],
  },
  {
    title: 'Coleções',
    links: ['Arte digital', 'Fotografia', 'Música', 'Arte 3D', 'Utilidade'],
  },
]

const SOCIAL_LINKS = [
  { label: 'Facebook', icon: Globe },
  { label: 'Instagram', icon: Share2 },
  { label: 'Twitter', icon: MessageCircle },
  { label: 'LinkedIn', icon: Rss },
  { label: 'YouTube', icon: Mail },
]

const COMPATIBLE_WALLETS = ['MetaMask', 'WalletConnect', 'Coinbase Wallet']

function SiteFooter() {
  return (
    <footer className="w-full border-t border-border-soft bg-card text-card-foreground">
      <div className="border-b border-border-soft px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-8 lg:flex-row lg:items-stretch">
          {HIGHLIGHTS.map((highlight, index) => (
            <div key={highlight.title} className="flex flex-1 items-stretch gap-8">
              <div className="flex flex-1 flex-col items-start gap-3">
                <span
                  aria-hidden="true"
                  className="flex size-[74px] shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
                >
                  <highlight.icon className="size-7" strokeWidth={2} />
                </span>
                <h2 className="text-[17px] font-bold text-foreground">{highlight.title}</h2>
                <p className="max-w-[220px] text-sm leading-[22px] text-muted-foreground">
                  {highlight.description}
                </p>
              </div>
              {index < HIGHLIGHTS.length - 1 && (
                <Separator
                  orientation="vertical"
                  className="hidden self-stretch bg-primary lg:block"
                />
              )}
            </div>
          ))}

          <Separator orientation="horizontal" className="bg-primary lg:hidden" />

          <div className="flex flex-1 flex-col gap-4 lg:max-w-[357px] lg:pl-4">
            <h2 className="text-lg font-bold text-foreground">Antecipe-se ao próximo lançamento</h2>
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

      <div className="border-b border-border-soft bg-muted px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-3 text-sm text-foreground lg:flex-row lg:items-center lg:justify-between lg:gap-8">
          <p className="text-sm font-bold tracking-[1.4px] text-foreground">KURIO</p>
          <p className="leading-[22px]">Feito para colecionadores, criadores e cultura</p>
          <p className="leading-[22px]">contato@email.com</p>
          <p className="leading-[22px]">+55 11 4002 8922</p>
        </div>
      </div>

      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {LINK_COLUMNS.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="mb-2 text-lg font-bold text-foreground">{column.title}</h2>
              <ul className="flex flex-col gap-1">
                {column.links.map((link) => (
                  <li key={link}>
                    <OutOfScopeLink className="block py-1 text-sm leading-[22px] text-foreground">
                      {link}
                    </OutOfScopeLink>
                  </li>
                ))}
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
                      className="flex size-[30px] items-center justify-center rounded-full border border-border-soft text-foreground hover:text-accent-foreground"
                    >
                      <social.icon className="size-4" aria-hidden="true" />
                    </OutOfScopeLink>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="mb-3 text-lg font-bold text-foreground">Carteiras compatíveis</h2>
              <ul className="flex flex-wrap gap-1.5" aria-label="Carteiras compatíveis">
                {COMPATIBLE_WALLETS.map((wallet) => (
                  <li key={wallet}>
                    <Badge
                      variant="outline"
                      className="h-auto border-border-soft bg-muted px-2 py-1 text-[9px] font-bold tracking-[0.1px] text-accent-foreground uppercase"
                    >
                      {wallet}
                    </Badge>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <p className="mx-auto mt-8 max-w-[1200px] text-center text-sm leading-[30px] text-foreground">
          © 2026 Kurio. Propriedade digital para todos.
        </p>
      </div>
    </footer>
  )
}

export { SiteFooter }
