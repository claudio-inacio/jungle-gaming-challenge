import { OutOfScopeButton } from '@/shared/ui/out-of-scope'

type PromoCardProps = {
  title: string
  description: string
  image: string
  imageAlt: string
}

function PromoCard({ title, description, image, imageAlt }: PromoCardProps) {
  return (
    <article className="flex w-full min-w-0 flex-1 flex-col overflow-hidden rounded-md border border-border-soft bg-card lg:min-h-[250px] lg:w-full lg:max-w-[586px] lg:flex-row">
      <img
        src={image}
        alt={imageAlt}
        width={292}
        height={250}
        loading="lazy"
        className="aspect-[586/250] w-full object-cover lg:aspect-auto lg:w-1/2 lg:shrink-0"
      />
      <div className="flex flex-1 flex-col items-start justify-between gap-3 p-6 lg:items-end lg:text-right">
        <div className="flex flex-col items-start gap-3 lg:items-end">
          <h3 className="text-lg font-bold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <OutOfScopeButton size="sm">
          Explorar <span aria-hidden="true">→</span>
        </OutOfScopeButton>
      </div>
    </article>
  )
}

export { PromoCard }
export type { PromoCardProps }
