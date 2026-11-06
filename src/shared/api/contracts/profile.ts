import { z } from 'zod'
import { userSchema } from './session'

export const profileSchema = userSchema

export const updateProfileRequestSchema = z.object({
  displayName: z.string().min(1, 'Informe seu nome').optional(),
  username: z
    .string()
    .min(3, 'Usuário deve ter pelo menos 3 caracteres')
    .max(24, 'Usuário deve ter no máximo 24 caracteres')
    .optional(),
  email: z.string().min(1, 'Informe seu e-mail').email('E-mail inválido').optional(),
  avatarUrl: z.string().url('URL de avatar inválida').nullable().optional(),
})
export type UpdateProfileRequest = z.infer<typeof updateProfileRequestSchema>

export const changePasswordRequestSchema = z.object({
  currentPassword: z.string().min(1, 'Informe sua senha atual'),
  newPassword: z.string().min(8, 'Nova senha deve ter pelo menos 8 caracteres'),
})
export type ChangePasswordRequest = z.infer<typeof changePasswordRequestSchema>

export const AVATAR_MAX_BYTES = 512 * 1024
export const AVATAR_ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const
