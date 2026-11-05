import { useState } from 'react'
import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'
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
      <div className="flex gap-2">
        <Input
          aria-label="Código promocional"
          placeholder="Tem um código promocional? Aplique aqui"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-invalid={!!errorMessage}
          aria-describedby={errorMessage ? 'coupon-error' : undefined}
        />
        <Button
          variant="outline"
          onClick={() => apply.mutate(value)}
          disabled={apply.isPending || !value}
        >
          Aplicar
        </Button>
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
