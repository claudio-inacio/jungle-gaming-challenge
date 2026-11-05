import { useState } from 'react'
import { useApplyCoupon } from '../model/useApplyCoupon'
import { ApiError } from '@/shared/api'

export function CouponInput({ appliedCode }: { appliedCode: string | null }) {
  const [value, setValue] = useState('')
  const apply = useApplyCoupon()

  const errorMessage =
    apply.error instanceof ApiError
      ? apply.error.code === 'COUPON_EXPIRED'
        ? 'Este cupom expirou.'
        : apply.error.code === 'COUPON_INVALID'
          ? 'Cupom inválido.'
          : null
      : null

  return (
    <div>
      <label htmlFor="coupon" className="text-sm font-bold mb-2 block">
        Código promocional
      </label>
      {/* Mobile (16:360): pílula, borda color/border, h-50. Desktop (11:1278): cantos de 3px,
          borda color/primary, h-40 — confirmado no Figma. Botão colado na borda direita, sem seam. */}
      <div className="flex h-[50px] items-stretch overflow-hidden rounded-full border border-border md:h-10 md:rounded-[3px] md:border-primary">
        <input
          id="coupon"
          placeholder="Digite o código promocional…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-invalid={!!errorMessage}
          aria-describedby={errorMessage ? 'coupon-error' : undefined}
          className="flex-1 bg-transparent pl-4 text-xs outline-none md:pl-2"
        />
        <button
          type="button"
          onClick={() => apply.mutate(value)}
          disabled={apply.isPending || !value}
          className="bg-primary px-6 text-sm font-bold text-primary-foreground disabled:opacity-50"
        >
          Aplicar
        </button>
      </div>
      {errorMessage && (
        <p id="coupon-error" role="alert" className="text-sm text-destructive mt-1">
          {errorMessage}
        </p>
      )}
      {appliedCode && (
        <div className="flex items-center justify-between mt-2 text-sm">
          <span>
            Cupom <strong>{appliedCode}</strong> aplicado
          </span>
          <button type="button" onClick={() => apply.mutate(null)} className="underline">
            Remover
          </button>
        </div>
      )}
    </div>
  )
}
