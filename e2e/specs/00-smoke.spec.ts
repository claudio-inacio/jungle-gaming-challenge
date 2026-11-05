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
})

test('rota inexistente mostra 404', async ({ page }) => {
  await page.goto('/rota-que-nao-existe')
  await expect(page.getByRole('heading', { level: 1, name: 'Página não encontrada' })).toBeVisible()
})
