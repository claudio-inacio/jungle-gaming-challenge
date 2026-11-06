import { test, expect } from '../fixtures/test'

// Chave real usada por `src/entities/session/model/token-storage.ts`. Mesma
// ressalva do `DB_STORAGE_KEY` em `e2e/fixtures/test.ts`: não dá pra importar
// o valor direto do projeto da app no projeto TS do Playwright, então é uma
// cópia manual - se `TOKEN_KEY` mudar lá, atualize aqui também.
const TOKEN_STORAGE_KEY = 'kurio-access-token'

const RESTORE_OVERLAY_TEXT = /Restaurando sua sessão/i
const OVERLAY_TIMEOUT = 10_000

// `role="status"` não suporta "name from content" na árvore de acessibilidade
// (diferente de `button`/`link`) - `getByRole('status', { name: ... })` nunca
// casa com o texto do `<p>` interno, mesmo com o elemento visível. Por isso o
// filtro é por conteúdo (`hasText`), não por nome acessível.
function restoreOverlay(page: import('@playwright/test').Page) {
  return page.getByRole('status').filter({ hasText: RESTORE_OVERLAY_TEXT })
}

function isMobileViewport(page: import('@playwright/test').Page): boolean {
  const viewport = page.viewportSize()
  return Boolean(viewport && viewport.width < 1024)
}

async function expectCatalogLoaded(page: import('@playwright/test').Page) {
  await expect(page.locator('main a[href^="/nft/"]').first()).toBeVisible({ timeout: 15_000 })
}

async function expectLoggedInUi(page: import('@playwright/test').Page) {
  if (isMobileViewport(page)) {
    await expect(page.getByRole('navigation', { name: 'Navegação principal' })).toBeVisible()
    await expect(page.getByRole('navigation', { name: 'Conta' })).not.toBeVisible()
  } else {
    await expect(page.getByRole('button', { name: 'Sair' })).toBeVisible()
  }
}

test.describe('Restauração de sessão no boot', () => {
  test('sessão válida: overlay aparece e some, UI final fica logada', async ({
    page,
    scenario,
    loginAs,
  }) => {
    await scenario.use('success')
    await loginAs('collector-a')

    await page.reload()

    await expect(restoreOverlay(page)).toBeVisible({ timeout: OVERLAY_TIMEOUT })
    await expect(restoreOverlay(page)).toHaveCount(0, { timeout: OVERLAY_TIMEOUT })

    await expectLoggedInUi(page)
  })

  test('token inválido: overlay aparece e some, UI final fica deslogada', async ({
    page,
    scenario,
    context,
  }) => {
    await scenario.use('success')
    await context.addInitScript(
      (args: { tokenKey: string }) => {
        window.localStorage.setItem(args.tokenKey, 'token-invalido-forjado-pelo-teste')
      },
      { tokenKey: TOKEN_STORAGE_KEY },
    )

    await page.goto('/')

    await expect(restoreOverlay(page)).toBeVisible({ timeout: OVERLAY_TIMEOUT })
    await expect(restoreOverlay(page)).toHaveCount(0, { timeout: OVERLAY_TIMEOUT })

    // Um token inválido no boot expira a sessão, que redireciona para
    // `/login` - no desktop como Dialog sobre a Home, no mobile como página
    // cheia (ver `fsd-architecture`/`tanstack-router` rules). Por isso a
    // verificação aqui é o formulário de login, não `expectLoggedOutUi`
    // (que assume a Home deslogada, não a rota `/login`).
    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByRole('heading', { name: 'Entrar' })).toBeVisible()
  })

  test('refresh numa rota protegida com sessão válida renderiza a página final', async ({
    page,
    scenario,
    loginAs,
  }) => {
    await scenario.use('success')
    await loginAs('collector-a')

    await page.goto('/profile')

    await expect(restoreOverlay(page)).toBeVisible({ timeout: OVERLAY_TIMEOUT })
    await expect(restoreOverlay(page)).toHaveCount(0, { timeout: OVERLAY_TIMEOUT })

    // `AccountSidebar` ("Meu perfil") só existe no desktop - o conteúdo real da
    // rota (`_authenticated.profile.tsx`) é o único elemento garantido nos dois
    // viewports para confirmar que a página terminou de renderizar.
    await expect(page.getByText('Perfil', { exact: true })).toBeVisible()
    await expect(page).toHaveURL(/\/profile$/)
  })

  test('sem token salvo: overlay nunca aparece', async ({ page, scenario }) => {
    await scenario.use('success')

    await page.goto('/')

    await expectCatalogLoaded(page)
    await expect(restoreOverlay(page)).toHaveCount(0)
  })
})
