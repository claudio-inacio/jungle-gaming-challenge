import { useState } from 'react'
import { Heart } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { OutOfScopeButton } from '@/shared/ui/out-of-scope'

type Props = {
  images: string[]
  alt: string
}

export function NftGallery({ images, alt }: Props) {
  const [activeIndex, setActiveIndex] = useState(0)
  const thumbnails = images.slice(0, 4)
  const activeImage = images[activeIndex] ?? images[0]

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:gap-4">
      {thumbnails.length > 1 && (
        <div
          role="group"
          aria-label="Miniaturas do NFT"
          className="order-2 flex flex-row gap-3 overflow-x-auto lg:order-1 lg:w-20 lg:shrink-0 lg:flex-col lg:overflow-visible"
        >
          {thumbnails.map((image, index) => {
            const isActive = index === activeIndex
            return (
              <button
                key={image}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-pressed={isActive}
                aria-label={`Ver imagem ${index + 1} de ${alt}`}
                className={cn(
                  'size-16 shrink-0 overflow-hidden rounded-lg border-2 outline-none transition-colors lg:size-20 focus-visible:ring-3 focus-visible:ring-ring/50',
                  isActive ? 'border-primary' : 'border-transparent hover:border-border-soft',
                )}
              >
                <img
                  src={image}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  width={80}
                  height={80}
                  className="size-full object-cover"
                />
              </button>
            )
          })}
        </div>
      )}

      <div className="relative order-1 w-full lg:order-2 lg:flex-1">
        <img
          src={activeImage}
          alt={`Imagem principal de ${alt}`}
          fetchPriority="high"
          width={600}
          height={600}
          className="aspect-square w-full rounded-xl object-cover"
        />
        <OutOfScopeButton
          variant="outline"
          size="icon-lg"
          aria-label="Favoritar este NFT"
          className="absolute top-3 right-3 rounded-full border-border bg-card/80 backdrop-blur-sm hover:bg-card"
        >
          <Heart aria-hidden="true" />
        </OutOfScopeButton>
      </div>
    </div>
  )
}
