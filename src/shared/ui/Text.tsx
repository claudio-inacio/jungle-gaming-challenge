import type { ComponentPropsWithoutRef, ElementType } from 'react'
import { cn } from '@/shared/lib/utils'
import { textVariants } from './typography'
import type { VariantProps } from 'class-variance-authority'

type TextProps<T extends ElementType> = {
  as?: T
  className?: string
} & VariantProps<typeof textVariants> &
  Omit<ComponentPropsWithoutRef<T>, 'as' | 'className'>

export function Text<T extends ElementType = 'p'>({
  as,
  variant,
  className,
  ...props
}: TextProps<T>) {
  const Component = as ?? 'p'
  return <Component className={cn(textVariants({ variant }), className)} {...props} />
}
