import { test, expect } from '@playwright/test'

// `Hero.tsx` tem um texto próprio para mobile (abaixo de lg), diferente do
// desktop - ver `HeroMobileBanner`, que segue o nó `14:5226` do Figma.
test('app sobe com mocks ativos', async ({ page }) => {
  await page.goto('/')
  const viewport = page.viewportSize()
  const isMobile = Boolean(viewport && viewport.width < 1024)
  const heroHeadingName = isMobile
    ? 'SEJA DONO DA CULTURA DIGITAL'
    : 'SEJA DONO DO FUTURO DA ARTE DIGITAL'

  await expect(page.getByRole('heading', { level: 1, name: heroHeadingName })).toBeVisible()

  // O `h1` acima vem do `BootShell` (`src/app/layout/BootShell.tsx`), que é
  // renderizado IMEDIATAMENTE, antes do `enableMocking()` terminar de subir o
  // worker do MSW (`src/main.tsx`) - ou seja, ele aparece mesmo que o MSW
  // esteja quebrado. O card de NFT abaixo só existe depois que a árvore real
  // (`AppRoot`) substitui o `BootShell` e o catálogo busca dados de verdade
  // via `http` contra os handlers do MSW - é esta asserção que de fato
  // detecta um `worker.start()` quebrado. Mesmo locator usado em
  // `01-catalog.spec.ts` para esperar o grid carregar.
  await expect(page.locator('main a[href^="/nft/"]').first()).toBeVisible({ timeout: 15_000 })
})

test('rota inexistente mostra 404', async ({ page }) => {
  await page.goto('/rota-que-nao-existe')
  await expect(page.getByRole('heading', { level: 1, name: 'Página não encontrada' })).toBeVisible()
})
