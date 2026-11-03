import { z } from 'zod'
import { userSchema } from './session'

export const profileSchema = userSchema

export const updateProfileRequestSchema = z.object({
  displayName: z.string().min(1).optional(),
  username: z.string().min(3).max(24).optional(),
  email: z.string().email().optional(),
  avatarUrl: z.string().url().nullable().optional(),
})
export type UpdateProfileRequest = z.infer<typeof updateProfileRequestSchema>

export const changePasswordRequestSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
})
export type ChangePasswordRequest = z.infer<typeof changePasswordRequestSchema>
