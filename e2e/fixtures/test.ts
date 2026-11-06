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
  | 'wallet-connect-refused'
  | 'mutation-failure'

// Chaves de `localStorage` reais usadas pela camada de mocks
// (`src/mocks/db/store.ts` e `src/mocks/scenarios/registry.ts`).
// IMPORTANTE: `DB_STORAGE_KEY` é uma cópia manual de `STORAGE_KEY` em
// `src/mocks/db/store.ts` (não dá pra importar o valor direto - o projeto
// TS do Playwright não referencia o projeto da app, então um import cross-
// project quebra a resolução do alias `@/` nesse arquivo). Já ficou
// desatualizada uma vez (v3 vs v4) e quebrou o reset de estado entre testes
// sem erro visível - sempre que o bump de versão em `db/store.ts` mudar,
// atualize aqui também.
const DB_STORAGE_KEY = 'kurio-mocks-db:v9'
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
          (args: {
            dbKey: string
            scenarioKey: string
            scenarioId: ScenarioId
            resetMarkerKey: string
          }) => {
            // `context.addInitScript` roda de novo em TODA navegação de documento
            // (não só na primeira), inclusive `page.reload()` e um segundo
            // `page.goto` depois de login - sem essa guarda, o reset apagaria o db
            // simulado (sessões e carrinhos criados durante o teste inclusive) a
            // cada navegação, quebrando qualquer fluxo que precise sobreviver a um
            // refresh real. `sessionStorage` sobrevive a reloads/navegações da
            // mesma aba mas não existe numa aba nova - então o marcador garante
            // "reset só uma vez por teste", sem vazar estado entre testes (cada
            // teste ganha página/contexto novos do Playwright).
            if (window.sessionStorage.getItem(args.resetMarkerKey)) return
            window.sessionStorage.setItem(args.resetMarkerKey, '1')
            window.localStorage.removeItem(args.dbKey)
            window.localStorage.setItem(args.scenarioKey, args.scenarioId)
          },
          {
            dbKey: DB_STORAGE_KEY,
            scenarioKey: SCENARIO_STORAGE_KEY,
            scenarioId: id,
            resetMarkerKey: 'kurio-e2e-scenario-reset-done',
          },
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
