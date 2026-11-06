import { useId, useState } from 'react'
import { Controller, type UseFormReturn } from 'react-hook-form'
import type { CollectorProfile, Network, WalletType } from '@/shared/api'
import { Text } from '@/shared/ui/Text'
import { Label } from '@/shared/ui/label'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Checkbox } from '@/shared/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'

const NETWORK_OPTIONS: { value: Network; label: string }[] = [
  { value: 'ethereum', label: 'Ethereum' },
  { value: 'polygon', label: 'Polygon' },
  { value: 'solana', label: 'Solana' },
]

const WALLET_TYPE_OPTIONS: { value: WalletType; label: string }[] = [
  { value: 'primary', label: 'Principal' },
  { value: 'secondary', label: 'Secundária' },
]

const fieldClassName = 'h-10 w-full rounded-[3px]'
const selectFieldClassName =
  'w-full justify-between rounded-[3px] border border-input bg-transparent data-[size=default]:h-10'

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} role="alert" className="mt-1 text-sm text-destructive">
      {message}
    </p>
  )
}

function WalletDerivedHint({ id }: { id: string }) {
  return (
    <p id={id} className="mt-1 text-xs text-muted-foreground">
      Preenchido automaticamente pela carteira conectada
    </p>
  )
}

export function CollectorProfileForm({ form }: { form: UseFormReturn<CollectorProfile> }) {
  const { register, control, formState } = form
  const { errors } = formState
  const [observation, setObservation] = useState('')
  const [useOtherWallet, setUseOtherWallet] = useState(false)
  const observationId = useId()
  const otherWalletId = useId()

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-3 lg:max-w-[763px]">
      <Text variant="body-bold" className="text-base">
        Perfil do colecionador
      </Text>

      <fieldset
        disabled={formState.isSubmitting}
        className="flex flex-col gap-3 md:flex-row md:gap-6"
      >
        <div className="flex flex-1 flex-col gap-3">
          <div>
            <Label htmlFor="displayName">Nome de exibição*</Label>
            <Input
              id="displayName"
              autoComplete="name"
              aria-invalid={!!errors.displayName}
              aria-describedby="displayName-error"
              className={fieldClassName}
              {...register('displayName')}
            />
            <FieldError id="displayName-error" message={errors.displayName?.message} />
          </div>

          <div>
            <Label htmlFor="network">Rede*</Label>
            <Controller
              control={control}
              name="network"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled>
                  <SelectTrigger
                    id="network"
                    aria-invalid={!!errors.network}
                    aria-describedby="network-hint"
                    className={selectFieldClassName}
                  >
                    <SelectValue placeholder="Conecte uma carteira" />
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
            <FieldError id="network-error" message={errors.network?.message} />
            <WalletDerivedHint id="network-hint" />
          </div>

          <div>
            <Label htmlFor="walletAddress">Endereço da carteira*</Label>
            <Input
              id="walletAddress"
              placeholder="Conecte uma carteira"
              autoComplete="off"
              disabled
              aria-invalid={!!errors.walletAddress}
              aria-describedby="walletAddress-hint"
              className={fieldClassName}
              {...register('walletAddress')}
            />
            <FieldError id="walletAddress-error" message={errors.walletAddress?.message} />
            <WalletDerivedHint id="walletAddress-hint" />
          </div>

          <div>
            <Label htmlFor="walletType">Tipo de carteira*</Label>
            <Controller
              control={control}
              name="walletType"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled>
                  <SelectTrigger
                    id="walletType"
                    aria-invalid={!!errors.walletType}
                    aria-describedby="walletType-hint"
                    className={selectFieldClassName}
                  >
                    <SelectValue placeholder="Conecte uma carteira" />
                  </SelectTrigger>
                  <SelectContent>
                    {WALLET_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError id="walletType-error" message={errors.walletType?.message} />
            <WalletDerivedHint id="walletType-hint" />
          </div>

          <div>
            <Label htmlFor="email">E-mail*</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              aria-invalid={!!errors.email}
              aria-describedby="email-error"
              className={fieldClassName}
              {...register('email')}
            />
            <FieldError id="email-error" message={errors.email?.message} />
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3">
          <div>
            <Label htmlFor="username">Nome de usuário*</Label>
            <Input
              id="username"
              autoComplete="username"
              aria-invalid={!!errors.username}
              aria-describedby="username-error"
              className={fieldClassName}
              {...register('username')}
            />
            <FieldError id="username-error" message={errors.username?.message} />
          </div>

          <div>
            <Label htmlFor="ensName">ENS da carteira conectada (opcional)</Label>
            <Input
              id="ensName"
              placeholder="Conecte uma carteira"
              autoComplete="off"
              disabled
              aria-invalid={!!errors.ensName}
              aria-describedby="ensName-hint"
              className={fieldClassName}
              {...register('ensName')}
            />
            <FieldError id="ensName-error" message={errors.ensName?.message} />
            <WalletDerivedHint id="ensName-hint" />
          </div>

          <div>
            <Label htmlFor="referralCode">Código de indicação (opcional)</Label>
            <Input
              id="referralCode"
              autoComplete="off"
              aria-invalid={!!errors.referralCode}
              aria-describedby="referralCode-error"
              className={fieldClassName}
              {...register('referralCode')}
            />
            <FieldError id="referralCode-error" message={errors.referralCode?.message} />
          </div>
        </div>
      </fieldset>

      <div className="flex items-center gap-2">
        <Checkbox
          id={otherWalletId}
          checked={useOtherWallet}
          onCheckedChange={(checked) => setUseOtherWallet(checked === true)}
        />
        <Label htmlFor={otherWalletId}>Usar outra carteira?</Label>
      </div>

      <div className="flex flex-col gap-3">
        <Label htmlFor={observationId}>Observação do colecionador (opcional)</Label>
        <Textarea
          id={observationId}
          value={observation}
          onChange={(event) => setObservation(event.target.value)}
          className="h-[152px] w-full max-w-[350px] rounded-[3px]"
        />
      </div>
    </div>
  )
}
