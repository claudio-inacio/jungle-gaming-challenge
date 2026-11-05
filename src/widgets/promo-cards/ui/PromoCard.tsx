import { OutOfScopeButton } from '@/shared/ui/out-of-scope'

type PromoCardProps = {
  title: string
  description: string
}

function PromoCard({ title, description }: PromoCardProps) {
  return (
    <article className="flex w-full flex-col overflow-hidden rounded-md border border-border-soft bg-card lg:h-[250px] lg:w-[586px] lg:flex-row">
      <div
        aria-hidden="true"
        className="aspect-[586/250] w-full bg-muted lg:aspect-auto lg:h-full lg:w-[292px] lg:shrink-0"
      />
      <div className="flex flex-1 flex-col items-start gap-3 p-6 lg:items-end lg:text-right">
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
        <OutOfScopeButton size="sm">
          Explorar <span aria-hidden="true">→</span>
        </OutOfScopeButton>
      </div>
    </article>
  )
}

export { PromoCard }
export type { PromoCardProps }
