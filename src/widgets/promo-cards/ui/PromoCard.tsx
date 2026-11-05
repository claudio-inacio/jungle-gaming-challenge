import { OutOfScopeButton } from '@/shared/ui/out-of-scope'

type PromoCardProps = {
  title: string
  description: string
  image: string
  imageAlt: string
}

function PromoCard({ title, description, image, imageAlt }: PromoCardProps) {
  return (
    <article className="flex w-full flex-col rounded-md border border-border-soft bg-card lg:h-[250px] lg:w-[586px] lg:flex-row">
      <div className="p-3 lg:h-full lg:w-[292px] lg:shrink-0">
        <img
          src={image}
          alt={imageAlt}
          width={292}
          height={250}
          loading="lazy"
          className="aspect-[586/250] w-full rounded-md object-cover lg:aspect-auto lg:h-full"
        />
      </div>
      <div className="flex flex-1 flex-col items-start gap-3 p-6 pt-0 lg:items-end lg:pt-6 lg:text-right">
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
