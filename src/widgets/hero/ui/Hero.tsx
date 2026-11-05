import { Button } from '@/shared/ui/button'
import { Container } from '@/shared/ui/container'

const HERO_DOTS_COUNT = 3
const HERO_ACTIVE_DOT_INDEX = 0

function Hero() {
  return (
    <section aria-labelledby="hero-heading" className="w-full">
      <Container>
        <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-center lg:justify-between lg:gap-[110px]">
          <div className="flex w-full flex-col items-start gap-[32px] lg:w-[600px]">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium tracking-[1.4px] text-foreground">
                Bem-vindo à Kurio
              </p>
              <h1 className="text-[28px] leading-tight font-bold text-foreground lg:text-[43px] lg:leading-[70px]">
                SEJA DONO DO FUTURO DA ARTE DIGITAL
              </h1>
              <p className="text-sm leading-6 text-muted-foreground lg:max-w-[557px]">
                Descubra NFTs selecionados de criadores emergentes e consagrados. Colecione arte
                digital rara, apoie artistas e tenha uma parte da cultura da internet.
              </p>
            </div>
            <Button variant="pill" size="lg">
              Explorar
            </Button>
          </div>

          <div className="flex w-full flex-col items-center gap-4 lg:w-[450px]">
            <div
              aria-hidden="true"
              className="aspect-square w-full rounded-3xl border border-border-soft bg-card lg:size-[450px]"
            />
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
          </div>
        </div>
      </Container>
    </section>
  )
}

export { Hero }
