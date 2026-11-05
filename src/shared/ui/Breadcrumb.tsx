import { Link } from '@tanstack/react-router'
import { Text } from '@/shared/ui/Text'

type BreadcrumbItem = {
  label: string
  to?: '/'
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Trilha de navegação" className="flex items-center gap-1.5">
      {items.map((item, index) => (
        <span key={item.label} className="flex items-center gap-1.5">
          {index > 0 && (
            <Text
              as="span"
              className="text-[15px] leading-4 font-bold text-foreground"
              aria-hidden="true"
            >
              /
            </Text>
          )}
          {item.to ? (
            <Link
              to={item.to}
              className="text-[15px] leading-4 font-bold text-foreground hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {item.label}
            </Link>
          ) : (
            <Text as="span" className="text-[15px] leading-4 font-bold text-foreground">
              {item.label}
            </Text>
          )}
        </span>
      ))}
    </nav>
  )
}
