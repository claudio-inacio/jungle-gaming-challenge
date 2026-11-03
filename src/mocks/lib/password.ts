/**
 * Hash de senha para o db simulado pelo MSW: SHA-256 puro via `crypto.subtle`,
 * sem salt e sem custo computacional ajustável. Suficiente apenas para nunca
 * guardar senha em texto puro na fixture/mock. NÃO É SEGURO PARA PRODUÇÃO —
 * um backend real deve usar bcrypt/argon2/scrypt com salt por usuário.
 */
export async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return (await hashPassword(password)) === hash
}
