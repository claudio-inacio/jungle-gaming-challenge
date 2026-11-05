import { useState } from 'react'
import { ZoomIn } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Dialog, DialogContent, DialogTitle } from '@/shared/ui/dialog'

type Props = {
  images: string[]
  alt: string
}

export function NftGallery({ images, alt }: Props) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isZoomOpen, setIsZoomOpen] = useState(false)
  const thumbnails = images.slice(0, 4)
  const activeImage = images[activeIndex] ?? images[0]

  return (
    <div className="relative flex items-start gap-7">
      {thumbnails.length > 1 && (
        <div
          role="group"
          aria-label="Miniaturas do NFT"
          className="flex w-25 shrink-0 flex-col gap-4"
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
                  'size-[100px] shrink-0 overflow-hidden rounded-lg border outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50',
                  isActive ? 'border-primary' : 'border-transparent hover:border-border-soft',
                )}
              >
                <img
                  src={image}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  width={100}
                  height={100}
                  className="size-full object-cover"
                />
              </button>
            )
          })}
        </div>
      )}

      <div className="flex size-[444px] shrink-0 items-center justify-center rounded-md bg-card p-4">
        <img
          src={activeImage}
          alt={`Imagem principal de ${alt}`}
          fetchPriority="high"
          width={404}
          height={404}
          className="size-[404px] rounded-[24px] object-cover"
        />
      </div>

      <Dialog open={isZoomOpen} onOpenChange={setIsZoomOpen}>
        <button
          type="button"
          aria-label="Ampliar imagem"
          onClick={() => setIsZoomOpen(true)}
          className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <ZoomIn aria-hidden="true" className="size-4" />
        </button>
        <DialogContent className="sm:max-w-2xl">
          <DialogTitle className="sr-only">{alt}</DialogTitle>
          <img
            src={activeImage}
            alt={`Imagem ampliada de ${alt}`}
            width={960}
            height={960}
            className="aspect-square w-full rounded-lg object-cover"
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
