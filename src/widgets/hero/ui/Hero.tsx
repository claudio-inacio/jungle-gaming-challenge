import { ArrowRight } from 'lucide-react'
import { useMediaQuery } from '@/shared/lib/hooks'
import { Button } from '@/shared/ui/button'
import { Container } from '@/shared/ui/container'

const HERO_DOTS_COUNT = 3
const HERO_ACTIVE_DOT_INDEX = 0

function HeroDots() {
  return (
    <div aria-hidden="true" className="flex items-center gap-2">
      {Array.from({ length: HERO_DOTS_COUNT }).map((_, index) => (
        <span
          key={index}
          className={
            index === HERO_ACTIVE_DOT_INDEX
              ? 'h-2 w-6 rounded-full bg-primary'
              : 'size-2 rounded-full bg-border-soft'
          }
        />
      ))}
    </div>
  )
}

function HeroMobileBanner() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl bg-gradient-to-br from-card to-accent/40 p-4">
      <div className="flex w-full items-center gap-2">
        <div className="flex min-w-0 flex-1 flex-col items-start gap-1.5">
          <p className="text-xs font-medium text-foreground">Bem-vindo à Kurio</p>
          <h1 className="text-lg leading-[29px] font-bold text-foreground">
            SEJA DONO DA
            <br />
            CULTURA DIGITAL
          </h1>
          <p className="text-xs leading-[18px] text-muted-foreground">
            Descubra NFTs selecionados de criadores do mundo todo.
          </p>
          <Button
            variant="link"
            className="h-auto gap-1.5 p-0 text-xs font-bold tracking-wide text-accent-foreground no-underline"
          >
            EXPLORAR
            <ArrowRight aria-hidden="true" className="size-4" />
          </Button>
        </div>

        <div className="relative size-[138px] shrink-0">
          <img
            src="/img/mobile/mobile-nft-artwork-1.png"
            alt="Macaco ilustrado usando jaqueta verde, mascote da Kurio"
            width={138}
            height={138}
            fetchPriority="high"
            className="size-[138px] rounded-2xl object-cover"
          />
          <img
            src="/img/mobile/mobile-nft-artwork-2.png"
            alt=""
            width={58}
            height={58}
            className="absolute bottom-0 left-[14px] size-[58px] rounded-2xl border-2 border-card object-cover"
          />
        </div>
      </div>

      <HeroDots />
    </div>
  )
}

function Hero() {
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  return (
    <section aria-labelledby="hero-heading" className="w-full">
      <Container>
        {isDesktop ? (
          <div className="flex items-center justify-between gap-[110px]">
            <div className="flex w-[600px] flex-col items-start gap-[32px]">
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium tracking-[1.4px] text-foreground">
                  Bem-vindo à Kurio
                </p>
                <h1 className="text-[43px] leading-[70px] font-bold text-foreground">
                  SEJA DONO DO FUTURO DA ARTE DIGITAL
                </h1>
                <p className="max-w-[557px] text-sm leading-6 text-muted-foreground">
                  Descubra NFTs selecionados de criadores emergentes e consagrados. Colecione arte
                  digital rara, apoie artistas e tenha uma parte da cultura da internet.
                </p>
              </div>
              <Button variant="pill" size="lg">
                Explorar
              </Button>
            </div>

            <div className="flex w-[450px] flex-col items-center gap-4">
              <img
                src="/img/desktop/frame-136.webp"
                alt="Macaco ilustrado usando jaqueta verde e óculos escuros, mascote da Kurio"
                width={450}
                height={450}
                fetchPriority="high"
                className="aspect-square size-[450px] rounded-3xl border border-border-soft object-cover"
              />
              <HeroDots />
            </div>
          </div>
        ) : (
          <HeroMobileBanner />
        )}
      </Container>
    </section>
  )
}

export { Hero }
