import { test, expect } from '@playwright/test'

test('app sobe com mocks ativos', async ({ page }) => {
  await page.goto('/')
  await expect(
    page.getByRole('heading', { level: 1, name: 'SEJA DONO DO FUTURO DA ARTE DIGITAL' }),
  ).toBeVisible()
})

test('rota inexistente mostra 404', async ({ page }) => {
  await page.goto('/rota-que-nao-existe')
  await expect(page.getByRole('heading', { level: 1, name: 'Página não encontrada' })).toBeVisible()
})
