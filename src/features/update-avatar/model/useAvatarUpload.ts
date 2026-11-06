import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { ApiError, AVATAR_ACCEPTED_TYPES, AVATAR_MAX_BYTES, type User } from '@/shared/api'
import { useRemoveAvatarMutation, useUploadAvatarMutation } from '../api/avatar'

function validateFile(file: File): string | null {
  if (!AVATAR_ACCEPTED_TYPES.includes(file.type as (typeof AVATAR_ACCEPTED_TYPES)[number])) {
    return 'Formato de imagem não suportado (use PNG, JPEG ou WebP)'
  }
  if (file.size > AVATAR_MAX_BYTES) {
    return 'Imagem muito grande (máximo 512 KB)'
  }
  return null
}

export function useAvatarUpload(user: User | null) {
  const uploadMutation = useUploadAvatarMutation(user?.id)
  const removeMutation = useRemoveAvatarMutation(user?.id)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const previewUrlRef = useRef<string | null>(null)

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
    }
  }, [])

  function setPreview(url: string | null) {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
    previewUrlRef.current = url
    setPreviewUrl(url)
  }

  function selectFile(file: File) {
    setFileError(null)
    const validationError = validateFile(file)
    if (validationError) {
      setFileError(validationError)
      return
    }

    setPreview(URL.createObjectURL(file))

    uploadMutation.mutate(file, {
      onSuccess: () => {
        setPreview(null)
        toast.success('Foto de perfil atualizada.')
      },
      onError: (error) => {
        setPreview(null)
        const message =
          error instanceof ApiError && error.fields?.file?.[0]
            ? error.fields.file[0]
            : 'Não foi possível atualizar a foto.'
        setFileError(message)
      },
    })
  }

  function removeAvatar() {
    setFileError(null)
    removeMutation.mutate(undefined, {
      onSuccess: () => {
        setPreview(null)
        toast.success('Foto de perfil removida.')
      },
      onError: () => {
        toast.error('Não foi possível remover a foto.')
      },
    })
  }

  return {
    previewUrl,
    fileError,
    selectFile,
    removeAvatar,
    isUploading: uploadMutation.isPending,
    isRemoving: removeMutation.isPending,
  }
}
