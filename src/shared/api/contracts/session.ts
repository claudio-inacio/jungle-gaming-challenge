import { z } from 'zod'
import { idSchema, isoDateSchema } from './common'

export const userSchema = z.object({
  id: idSchema,
  displayName: z.string(),
  username: z.string(),
  email: z.string().email(),
  avatarUrl: z.string().url().nullable(),
  ensName: z.string().nullable(),
  createdAt: isoDateSchema,
})
export type User = z.infer<typeof userSchema>

export const sessionSchema = z.object({
  user: userSchema,
  accessToken: z.string(),
  expiresAt: isoDateSchema,
})
export type Session = z.infer<typeof sessionSchema>

export const loginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const registerRequestSchema = z.object({
  username: z.string().min(3).max(24),
  email: z.string().email(),
  password: z.string().min(8),
})
