import { Loader2 } from 'lucide-react'
import { Controller } from 'react-hook-form'
import { useWalletForm } from '../model/useWalletForm'
import type { Network, Wallet, WalletProvider, WalletType } from '@/shared/api'
import { Label } from '@/shared/ui/label'
import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'

const PROVIDER_OPTIONS: { value: WalletProvider; label: string }[] = [
  { value: 'metamask', label: 'MetaMask' },
  { value: 'wallet_connect', label: 'WalletConnect' },
  { value: 'coinbase', label: 'Coinbase Wallet' },
]

const NETWORK_OPTIONS: { value: Network; label: string }[] = [
  { value: 'ethereum', label: 'Ethereum' },
  { value: 'polygon', label: 'Polygon' },
  { value: 'solana', label: 'Solana' },
]

const fieldClassName = 'h-10 w-full rounded-[3px]'
const selectFieldClassName =
  'w-full justify-between rounded-[3px] border border-input bg-transparent data-[size=default]:h-10'

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} role="alert" className="text-sm text-destructive">
      {message}
    </p>
  )
}

export function WalletForm({
  type,
  wallet,
  userId,
  onSuccess,
  submitLabel,
}: {
  type: WalletType
  wallet?: Wallet
  userId: string | undefined
  onSuccess?: () => void
  submitLabel: string
}) {
  const { form, onSubmit, isPending } = useWalletForm({ type, wallet, userId, onSuccess })
  const { register, control, formState } = form
  const fieldId = (name: string) => `${type}-wallet-${name}`

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <fieldset
        disabled={isPending}
        className="grid grid-cols-1 gap-x-7 gap-y-6 lg:grid-cols-2 lg:[&>*]:max-w-[417px]"
      >
        <div className="flex flex-col gap-2.5">
          <Label htmlFor={fieldId('label')} className="text-[15px]">
            Apelido (opcional)
          </Label>
          <Input
            id={fieldId('label')}
            aria-invalid={!!formState.errors.label}
            aria-describedby={`${fieldId('label')}-error`}
            className={fieldClassName}
            {...register('label')}
          />
          <FieldError id={`${fieldId('label')}-error`} message={formState.errors.label?.message} />
        </div>

        <div className="flex flex-col gap-2.5">
          <Label htmlFor={fieldId('provider')} className="text-[15px]">
            Provedor
          </Label>
          <Controller
            control={control}
            name="provider"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  id={fieldId('provider')}
                  className={selectFieldClassName}
                  aria-invalid={!!formState.errors.provider}
                >
                  <SelectValue placeholder="Selecione o provedor" />
                </SelectTrigger>
                <SelectContent>
                  {PROVIDER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="flex flex-col gap-2.5">
          <Label htmlFor={fieldId('network')} className="text-[15px]">
            Rede
          </Label>
          <Controller
            control={control}
            name="network"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  id={fieldId('network')}
                  className={selectFieldClassName}
                  aria-invalid={!!formState.errors.network}
                >
                  <SelectValue placeholder="Selecione a rede" />
                </SelectTrigger>
                <SelectContent>
                  {NETWORK_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="flex flex-col gap-2.5">
          <Label htmlFor={fieldId('address')} className="text-[15px]">
            Endereço da carteira
          </Label>
          <Input
            id={fieldId('address')}
            placeholder="0x..."
            autoComplete="off"
            aria-invalid={!!formState.errors.address}
            aria-describedby={`${fieldId('address')}-error`}
            className={fieldClassName}
            {...register('address')}
          />
          <FieldError
            id={`${fieldId('address')}-error`}
            message={formState.errors.address?.message}
          />
        </div>

        <div className="flex flex-col gap-2.5">
          <Label htmlFor={fieldId('ensName')} className="text-[15px]">
            Nome ENS (opcional)
          </Label>
          <Input
            id={fieldId('ensName')}
            placeholder="nome.eth"
            autoComplete="off"
            aria-invalid={!!formState.errors.ensName}
            aria-describedby={`${fieldId('ensName')}-error`}
            className={fieldClassName}
            {...register('ensName')}
          />
          <FieldError
            id={`${fieldId('ensName')}-error`}
            message={formState.errors.ensName?.message}
          />
        </div>
      </fieldset>

      <Button
        type="submit"
        variant="default"
        disabled={isPending || (Boolean(wallet) && !formState.isDirty)}
        aria-busy={isPending}
        className="h-10 w-fit min-w-[131px] self-end rounded-[3px] font-bold"
      >
        {isPending && <Loader2 aria-hidden="true" className="size-4 animate-spin" />}
        {submitLabel}
      </Button>
    </form>
  )
}
