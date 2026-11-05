import { test as base, expect } from '@playwright/test'

// Ids válidos de `src/mocks/scenarios/registry.ts`.
type ScenarioId =
  | 'success'
  | 'slow-network'
  | 'offline'
  | 'coupon-invalid'
  | 'coupon-expired'
  | 'payment-declined'
  | 'order-timeout'
  | 'quote-changed'
  | 'edition-sold-out'
  | 'mutation-failure'

// Chaves de `localStorage` reais usadas pela camada de mocks
// (`src/mocks/db/store.ts` e `src/mocks/scenarios/registry.ts`).
const DB_STORAGE_KEY = 'kurio-mocks-db:v3'
const SCENARIO_STORAGE_KEY = 'kurio-mocks-scenario'

type ScenarioFixture = {
  /**
   * Garante estado limpo (reset do db simulado) e ativa o cenário informado
   * *antes* da primeira navegação do teste. Chame antes de `page.goto`.
   */
  use: (id: ScenarioId) => Promise<void>
}

// Credenciais fictícias de demonstração documentadas no README (não existe
// backend real; a senha só é comparada em texto nas fixtures).
const DEMO_USERS = {
  'collector-a': { email: 'ana.colecionadora@kurio.test', password: 'Kurio@123' },
  'collector-b': { email: 'bruno.colecionador@kurio.test', password: 'Kurio@123' },
} as const

type DemoUserKey = keyof typeof DEMO_USERS

type LoginAsFixture = (user: DemoUserKey) => Promise<void>

type Fixtures = {
  scenario: ScenarioFixture
  loginAs: LoginAsFixture
}

export const test = base.extend<Fixtures>({
  // Renomeado de `use` para `provideFixture`: o eslint-plugin-react-hooks trata
  // qualquer identificador chamado `use` como um React Hook (falso positivo aqui,
  // é só a convenção de fixtures do Playwright).
  scenario: async ({ context }, provideFixture) => {
    const scenarioFixture: ScenarioFixture = {
      use: async (id) => {
        await context.addInitScript(
          (args: { dbKey: string; scenarioKey: string; scenarioId: ScenarioId }) => {
            window.localStorage.removeItem(args.dbKey)
            window.localStorage.setItem(args.scenarioKey, args.scenarioId)
          },
          { dbKey: DB_STORAGE_KEY, scenarioKey: SCENARIO_STORAGE_KEY, scenarioId: id },
        )
      },
    }
    await provideFixture(scenarioFixture)
  },

  loginAs: async ({ page }, provideFixture) => {
    const loginAs: LoginAsFixture = async (userKey) => {
      const { email, password } = DEMO_USERS[userKey]
      await page.goto('/login')
      await page.getByLabel('E-mail', { exact: true }).fill(email)
      await page.getByLabel('Senha', { exact: true }).fill(password)
      await page.getByRole('button', { name: 'Entrar' }).click()
      // O botão "Sair" só existe no cabeçalho desktop (`SiteHeader.tsx`, bloco
      // `hidden ... lg:flex`) - no viewport mobile não há nenhum indicador de sessão
      // no cabeçalho, então o sinal confiável nos dois projetos é a navegação
      // client-side de volta para a Home que o `useLoginForm` dispara em `onSuccess`.
      await page.waitForURL((url) => url.pathname === '/')
    }
    await provideFixture(loginAs)
  },
})

export { expect }
