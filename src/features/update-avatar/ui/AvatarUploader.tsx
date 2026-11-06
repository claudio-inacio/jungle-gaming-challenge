import { useId, useRef } from 'react'
import { Loader2, ImageIcon } from 'lucide-react'
import { useAvatarUpload } from '../model/useAvatarUpload'
import type { User } from '@/shared/api'
import { Text } from '@/shared/ui/Text'
import { cn } from '@/shared/lib/utils'

export function AvatarUploader({ user }: { user: User | null }) {
  const { previewUrl, fileError, selectFile, removeAvatar, isUploading, isRemoving } =
    useAvatarUpload(user)
  const inputId = useId()
  const errorId = useId()
  const inputRef = useRef<HTMLInputElement>(null)

  const avatarUrl = previewUrl ?? user?.avatarUrl ?? null
  const isPending = isUploading || isRemoving
  const canRemove = Boolean(user?.avatarUrl) && !previewUrl

  return (
    <div className="flex flex-col gap-3">
      <Text as="span" className="text-[15px] text-foreground">
        Avatar
      </Text>

      <div className="flex items-center gap-6">
        <span
          aria-hidden="true"
          className="flex size-[50px] shrink-0 items-center justify-center overflow-hidden rounded-full border border-input bg-muted text-sm font-bold text-muted-foreground"
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="size-full object-cover" width={50} height={50} />
          ) : (
            <ImageIcon aria-hidden="true" className="size-6" />
          )}
        </span>

        <div className="flex items-center gap-5">
          <label
            htmlFor={inputId}
            className={cn(
              'flex h-10 w-[98px] cursor-pointer items-center justify-center gap-1.5 rounded-[3px] bg-primary text-sm font-bold text-primary-foreground outline-none hover:bg-primary/80 focus-visible:ring-3 focus-visible:ring-ring/50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50',
            )}
            aria-disabled={isPending}
          >
            {isUploading ? (
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
            ) : user?.avatarUrl ? (
              'Alterar'
            ) : (
              'Adicionar'
            )}
          </label>
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            disabled={isPending}
            aria-describedby={fileError ? errorId : undefined}
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) selectFile(file)
              event.target.value = ''
            }}
          />

          {canRemove && (
            <button
              type="button"
              disabled={isPending}
              onClick={removeAvatar}
              className="flex items-center gap-1.5 text-sm text-foreground underline-offset-4 outline-none hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isRemoving && <Loader2 aria-hidden="true" className="size-4 animate-spin" />}
              Remover
            </button>
          )}
        </div>
      </div>

      {fileError && (
        <Text id={errorId} role="alert" variant="caption" className="text-destructive">
          {fileError}
        </Text>
      )}
    </div>
  )
}
