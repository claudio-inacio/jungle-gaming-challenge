import { cva } from 'class-variance-authority'

export const textVariants = cva('font-sans', {
  variants: {
    variant: {
      display: 'text-[43px] font-bold leading-[1.63]',
      heading: 'text-2xl font-bold leading-tight',
      'body-lg': 'text-lg font-medium leading-6',
      'body-lg-bold': 'text-lg font-bold leading-6',
      body: 'text-sm font-normal leading-6',
      'body-bold': 'text-sm font-bold leading-5',
      caption: 'text-[13px] font-normal leading-[22px] text-muted-foreground',
      tiny: 'text-[10px] font-medium uppercase tracking-wide text-muted-foreground',
    },
  },
  defaultVariants: { variant: 'body' },
})
