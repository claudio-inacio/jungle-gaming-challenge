import { z } from 'zod'

export const profileFormSchema = z.object({
  displayName: z.string().min(1, 'Informe seu nome'),
  username: z
    .string()
    .min(3, 'Usuário deve ter pelo menos 3 caracteres')
    .max(24, 'Usuário deve ter no máximo 24 caracteres'),
  email: z.string().min(1, 'Informe seu e-mail').email('E-mail inválido'),
})
export type ProfileFormValues = z.infer<typeof profileFormSchema>
