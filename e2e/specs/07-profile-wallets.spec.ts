import type { Page } from '@playwright/test'
import { expect, test } from '../fixtures/test'

// Dados dos usuários de demo (`src/mocks/fixtures/users.ts`) - usados para forçar
// conflito de e-mail/usuário na edição de perfil de `collector-a`.
const COLLECTOR_B_EMAIL = 'bruno.colecionador@kurio.test'
const COLLECTOR_B_USERNAME = 'bruno.kurio'

// Carteira primária pré-cadastrada de `collector-a` (`DEMO_WALLET_ADDRESSES['user-1']`
// em `src/mocks/db/store.ts`), mesmo endereço usado em `04-checkout.spec.ts`.
const PRIMARY_ADDRESS = '0x1a2b3c4d5e6f7890a1b2c3d4e5f6a7b8c9d0e1f2'
const NEW_PRIMARY_ADDRESS = '0x111111111111111111111111111111111111aaaa'
const SECONDARY_ADDRESS = '0x222222222222222222222222222222222222bbbb'
const INVALID_ADDRESS = '0xabc123'

const NEW_PASSWORD = 'NovaSenha@456'

// `src/shared/api/http.ts` aplica 3s de atraso simulado por request REST -
// qualquer mutation nesta suíte (perfil, senha, avatar, carteira) herda esse
// piso, daí os timeouts generosos (mesmo padrão de `04-checkout.spec.ts`).
test.describe.configure({ timeout: 60_000 })
const MUTATION_TIMEOUT = 15_000

function isMobileViewport(page: Page): boolean {
  const viewport = page.viewportSize()
  return Boolean(viewport && viewport.width < 1024)
}

function sidebar(page: Page) {
  return page.getByRole('complementary')
}

function breadcrumb(page: Page) {
  return page.getByRole('navigation', { name: 'Trilha de navegação' })
}

async function expectNoHorizontalOverflow(page: Page) {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }))
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth)
}

test.describe('Perfil e carteiras', () => {
  test('sidebar navega entre /profile e /wallets com item ativo indicado', async ({
    page,
    scenario,
    loginAs,
  }) => {
    await scenario.use('success')
    await loginAs('collector-a')
    await page.goto('/profile')

    await expect(breadcrumb(page).getByText('Perfil', { exact: true })).toBeVisible()
    const profileLink = sidebar(page).getByRole('link', { name: 'Dados do perfil' })
    const walletsLink = sidebar(page).getByRole('link', { name: 'Carteiras' })
    await expect(profileLink).toHaveClass(/border-primary/)
    await expect(walletsLink).not.toHaveClass(/border-primary/)

    await walletsLink.click()

    await expect(page).toHaveURL(/\/wallets$/)
    await expect(breadcrumb(page).getByText('Carteiras', { exact: true })).toBeVisible()
    await expect(walletsLink).toHaveClass(/border-primary/)
    await expect(profileLink).not.toHaveClass(/border-primary/)
  })

  test('"Sair" desloga de verdade e rota privada passa a redirecionar para o login', async ({
    page,
    scenario,
    loginAs,
  }) => {
    await scenario.use('success')
    await loginAs('collector-a')
    await page.goto('/profile')
    await expect(breadcrumb(page).getByText('Perfil', { exact: true })).toBeVisible()

    await sidebar(page).getByRole('button', { name: 'Sair' }).click()
    await page.waitForURL((url) => url.pathname === '/')

    await page.goto('/profile')
    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByRole('heading', { name: 'Entrar' })).toBeVisible()
  })

  test('edição de perfil persiste após reload', async ({ page, scenario, loginAs }) => {
    await scenario.use('success')
    await loginAs('collector-a')
    await page.goto('/profile')

    const displayNameField = page.getByLabel('Nome de exibição')
    await expect(displayNameField).toHaveValue('Ana Colecionadora', { timeout: MUTATION_TIMEOUT })
    await displayNameField.fill('Ana Colecionadora Editada')

    const saveButton = page.getByRole('button', { name: 'Salvar alterações' })
    await expect(saveButton).toBeEnabled()
    await saveButton.click()

    await expect(page.getByText('Perfil atualizado com sucesso.')).toBeVisible({
      timeout: MUTATION_TIMEOUT,
    })

    await page.reload()
    await expect(page.getByLabel('Nome de exibição')).toHaveValue('Ana Colecionadora Editada', {
      timeout: MUTATION_TIMEOUT,
    })
  })

  test('conflito de e-mail e usuário na edição do perfil aponta o campo certo', async ({
    page,
    scenario,
    loginAs,
  }) => {
    await scenario.use('success')
    await loginAs('collector-a')
    await page.goto('/profile')

    await expect(page.getByLabel('Nome de exibição')).toHaveValue('Ana Colecionadora', {
      timeout: MUTATION_TIMEOUT,
    })
    await page.getByLabel('Nome de usuário').fill(COLLECTOR_B_USERNAME)
    await page.getByLabel('E-mail', { exact: true }).fill(COLLECTOR_B_EMAIL)
    await page.getByRole('button', { name: 'Salvar alterações' }).click()

    await expect(page.getByText('E-mail já cadastrado')).toBeVisible({ timeout: MUTATION_TIMEOUT })
    await expect(page.getByText('Usuário já cadastrado')).toBeVisible()
    await expect(page).toHaveURL(/\/profile$/)
  })

  test('upload de avatar válido persiste como data URL após reload', async ({
    page,
    scenario,
    loginAs,
  }) => {
    await scenario.use('success')
    await loginAs('collector-a')
    await page.goto('/profile')

    await expect(page.getByLabel('Nome de exibição')).toHaveValue('Ana Colecionadora', {
      timeout: MUTATION_TIMEOUT,
    })
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles('e2e/fixtures/avatar.png')

    await expect(page.getByText('Foto de perfil atualizada.')).toBeVisible({
      timeout: MUTATION_TIMEOUT,
    })
    // Após o sucesso, o preview local (`URL.createObjectURL`) é descartado e o
    // `<img>` passa a usar o `data:` URL definitivo devolvido pela API (ver
    // `useAvatarUpload.ts`) - sem precisar de reload.
    await expect(page.getByAltText('', { exact: true }).first()).toHaveAttribute(
      'src',
      /^data:image\/png/,
      { timeout: MUTATION_TIMEOUT },
    )

    await page.reload()
    await expect(page.getByAltText('', { exact: true }).first()).toHaveAttribute(
      'src',
      /^data:image\/png/,
      { timeout: MUTATION_TIMEOUT },
    )

    await page.getByRole('button', { name: 'Remover' }).click()
    await expect(page.getByText('Foto de perfil removida.')).toBeVisible({
      timeout: MUTATION_TIMEOUT,
    })
    await expect(page.getByRole('button', { name: 'Remover' })).toHaveCount(0)
  })

  test('upload de arquivo que não é imagem mostra erro sem chamar a API', async ({
    page,
    scenario,
    loginAs,
  }) => {
    await scenario.use('success')
    await loginAs('collector-a')
    await page.goto('/profile')
    await expect(page.getByLabel('Nome de exibição')).toHaveValue('Ana Colecionadora', {
      timeout: MUTATION_TIMEOUT,
    })

    let avatarRequestFired = false
    page.on('request', (request) => {
      if (request.url().endsWith('/api/profile/avatar')) avatarRequestFired = true
    })

    await page.locator('input[type="file"]').setInputFiles('e2e/fixtures/not-an-image.txt')

    await expect(page.getByRole('alert').filter({ hasText: 'Formato de imagem' })).toBeVisible()
    expect(avatarRequestFired).toBe(false)
  })

  test('troca de senha: senha atual incorreta mostra erro no campo e não desloga', async ({
    page,
    scenario,
    loginAs,
  }) => {
    await scenario.use('success')
    await loginAs('collector-a')
    await page.goto('/profile')

    await page.getByLabel('Senha atual').fill('SenhaErrada@123')
    await page.getByLabel('Nova senha', { exact: true }).fill(NEW_PASSWORD)
    await page.getByLabel('Confirmar nova senha').fill(NEW_PASSWORD)
    await page.getByRole('button', { name: 'Alterar senha' }).click()

    await expect(page.getByText('Senha atual incorreta')).toBeVisible({
      timeout: MUTATION_TIMEOUT,
    })
    await expect(page).toHaveURL(/\/profile$/)
    await expect(page.getByLabel('Nome de exibição')).toBeVisible()
  })

  test('troca de senha: confirmação diferente é pega no cliente antes de enviar', async ({
    page,
    scenario,
    loginAs,
  }) => {
    await scenario.use('success')
    await loginAs('collector-a')
    await page.goto('/profile')

    let passwordRequestFired = false
    page.on('request', (request) => {
      if (request.url().endsWith('/api/profile/password')) passwordRequestFired = true
    })

    await page.getByLabel('Senha atual').fill('Kurio@123')
    await page.getByLabel('Nova senha', { exact: true }).fill(NEW_PASSWORD)
    await page.getByLabel('Confirmar nova senha').fill('OutraSenha@789')
    await page.getByRole('button', { name: 'Alterar senha' }).click()

    await expect(page.getByText('As senhas não coincidem')).toBeVisible()
    expect(passwordRequestFired).toBe(false)
  })

  test('troca de senha: sucesso muda a senha de verdade (confirmado via novo login)', async ({
    page,
    scenario,
    loginAs,
  }) => {
    await scenario.use('success')
    await loginAs('collector-a')
    await page.goto('/profile')

    await page.getByLabel('Senha atual').fill('Kurio@123')
    await page.getByLabel('Nova senha', { exact: true }).fill(NEW_PASSWORD)
    await page.getByLabel('Confirmar nova senha').fill(NEW_PASSWORD)
    await page.getByRole('button', { name: 'Alterar senha' }).click()

    await expect(page.getByText('Senha alterada com sucesso.')).toBeVisible({
      timeout: MUTATION_TIMEOUT,
    })

    await sidebar(page).getByRole('button', { name: 'Sair' }).click()
    await page.waitForURL((url) => url.pathname === '/')

    await page.goto('/login')
    await page.getByLabel('E-mail', { exact: true }).fill('ana.colecionadora@kurio.test')
    await page.getByLabel('Senha', { exact: true }).fill(NEW_PASSWORD)
    await page.getByRole('button', { name: 'Entrar' }).click()
    await page.waitForURL((url) => url.pathname === '/')
  })

  test('carteira principal: endereço inválido mostra erro de validação', async ({
    page,
    scenario,
    loginAs,
  }) => {
    await scenario.use('success')
    await loginAs('collector-a')
    await page.goto('/wallets')

    const addressField = page.getByLabel('Endereço da carteira')
    await expect(addressField).toHaveValue(PRIMARY_ADDRESS, { timeout: MUTATION_TIMEOUT })
    await addressField.fill(INVALID_ADDRESS)
    await page.getByRole('button', { name: 'Salvar carteira principal' }).click()

    await expect(page.getByText('Endereço de carteira inválido')).toBeVisible()
  })

  test('carteira principal: editar persiste o novo endereço após reload', async ({
    page,
    scenario,
    loginAs,
  }) => {
    await scenario.use('success')
    await loginAs('collector-a')
    await page.goto('/wallets')

    const addressField = page.getByLabel('Endereço da carteira')
    await expect(addressField).toHaveValue(PRIMARY_ADDRESS, { timeout: MUTATION_TIMEOUT })
    await addressField.fill(NEW_PRIMARY_ADDRESS)
    await page.getByRole('button', { name: 'Salvar carteira principal' }).click()

    await expect(page.getByText('Carteira atualizada com sucesso.')).toBeVisible({
      timeout: MUTATION_TIMEOUT,
    })

    await page.reload()
    await expect(page.getByLabel('Endereço da carteira')).toHaveValue(NEW_PRIMARY_ADDRESS, {
      timeout: MUTATION_TIMEOUT,
    })
  })

  test('carteira secundária: cadastro válido persiste após reload', async ({
    page,
    scenario,
    loginAs,
  }) => {
    await scenario.use('success')
    await loginAs('collector-a')
    await page.goto('/wallets')

    await expect(page.getByText('Você ainda não adicionou uma carteira secundária.')).toBeVisible({
      timeout: MUTATION_TIMEOUT,
    })
    await page.getByRole('button', { name: 'Adicionar' }).click()

    await page.getByLabel('Endereço da carteira').nth(1).fill(SECONDARY_ADDRESS)
    await page.getByRole('button', { name: 'Cadastrar carteira secundária' }).click()

    await expect(page.getByText('Carteira cadastrada com sucesso.')).toBeVisible({
      timeout: MUTATION_TIMEOUT,
    })

    await page.reload()
    await expect(page.getByLabel('Endereço da carteira').nth(1)).toHaveValue(SECONDARY_ADDRESS, {
      timeout: MUTATION_TIMEOUT,
    })
  })

  test('espelho da secundária reflete o endereço atual da principal sem reload', async ({
    page,
    scenario,
    loginAs,
  }) => {
    await scenario.use('success')
    await loginAs('collector-a')
    await page.goto('/wallets')

    await expect(page.getByText(PRIMARY_ADDRESS)).toBeVisible({ timeout: MUTATION_TIMEOUT })

    await page.getByLabel('Endereço da carteira').fill(NEW_PRIMARY_ADDRESS)
    await page.getByRole('button', { name: 'Salvar carteira principal' }).click()

    await expect(page.getByText('Carteira atualizada com sucesso.')).toBeVisible({
      timeout: MUTATION_TIMEOUT,
    })
    await expect(page.getByText(NEW_PRIMARY_ADDRESS)).toBeVisible()
    await expect(page.getByText(PRIMARY_ADDRESS)).toHaveCount(0)
  })

  test('carteira secundária: religar e remover volta ao estado de espelho', async ({
    page,
    scenario,
    loginAs,
  }) => {
    await scenario.use('success')
    await loginAs('collector-a')
    await page.goto('/wallets')

    await expect(page.getByText('Você ainda não adicionou uma carteira secundária.')).toBeVisible({
      timeout: MUTATION_TIMEOUT,
    })
    await page.getByRole('button', { name: 'Adicionar' }).click()
    await page.getByLabel('Endereço da carteira').nth(1).fill(SECONDARY_ADDRESS)
    await page.getByRole('button', { name: 'Cadastrar carteira secundária' }).click()
    await expect(page.getByText('Carteira cadastrada com sucesso.')).toBeVisible({
      timeout: MUTATION_TIMEOUT,
    })
    // `onSuccess` do form sai do modo "criando" antes da invalidação de
    // `walletsQuery` terminar de refazer o fetch - sem esperar o formulário
    // "Salvar carteira secundária" (só renderizado quando `secondaryWallet` já
    // reflete o dado novo), o checkbox pode aparecer momentaneamente marcado
    // como espelho (dado antigo em cache) e o clique seguinte não abre o
    // diálogo de remoção.
    await expect(page.getByRole('button', { name: 'Salvar carteira secundária' })).toBeVisible({
      timeout: MUTATION_TIMEOUT,
    })

    const mirrorCheckbox = page.getByRole('checkbox', { name: 'Igual à carteira principal' })
    await mirrorCheckbox.click()
    await expect(page.getByRole('heading', { name: 'Remover carteira secundária?' })).toBeVisible()
    await page.getByRole('button', { name: 'Remover' }).click()

    await expect(page.getByText('Carteira secundária removida.')).toBeVisible({
      timeout: MUTATION_TIMEOUT,
    })
    await expect(page.getByText('Você ainda não adicionou uma carteira secundária.')).toBeVisible()
    await expect(mirrorCheckbox).toBeChecked()
  })

  test('sem overflow horizontal em 390px', async ({ page, scenario, loginAs }) => {
    test.skip(!isMobileViewport(page), 'Específico do viewport mobile')
    await scenario.use('success')
    await loginAs('collector-a')

    await page.goto('/profile')
    await expect(page.getByLabel('Nome de exibição')).toHaveValue('Ana Colecionadora', {
      timeout: MUTATION_TIMEOUT,
    })
    await expectNoHorizontalOverflow(page)

    await page.goto('/wallets')
    await expect(page.getByLabel('Endereço da carteira')).toHaveValue(PRIMARY_ADDRESS, {
      timeout: MUTATION_TIMEOUT,
    })
    await expectNoHorizontalOverflow(page)
  })
})
