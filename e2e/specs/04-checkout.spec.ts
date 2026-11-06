import type { Page } from '@playwright/test'
import { expect, test } from '../fixtures/test'

// `nft_001` ("Spirited Councilman", seed 42) - mesmos dados determinísticos usados
// em `02-nft-detail.spec.ts`/`03-cart.spec.ts`. A edição '1/50' (15 disponíveis,
// 12.016 ETH) é a usada tanto por `POST /api/quote` quanto por `POST /api/orders`
// (ambos calculam pelo preço da própria edição, `edition.price`), mantendo o
// total previsível: 12.016 ETH (subtotal) + 0.01 ETH (taxa de rede fixa,
// `NETWORK_FEE` em `src/mocks/handlers/order.ts`/`quote.ts`) = 12.026 ETH, sem
// cupom.
const NFT_ID = 'nft_001'
const NFT_NAME = 'Spirited Councilman'
const EDITION_ID = 'nft_001-edition-1-50'
const TOTAL_ETH_TEXT = '12.026 ETH'

// Endereço fictício só precisa bater com `walletAddressSchema`
// (`/^0x[a-fA-F0-9]{40}$/`, `src/shared/api/contracts/common.ts`). O recibo mostra
// a versão abreviada (`shortenAddress`, igual em `OrderConfirmationPage.tsx`).
// Carteira primária pré-cadastrada para cada usuário de demo (`createInitialState`
// em `src/mocks/db/store.ts`) - endereço de `collector-a`/`user-1`.
const WALLET_ADDRESS = '0x1a2b3c4d5e6f7890a1b2c3d4e5f6a7b8c9d0e1f2'
const WALLET_ADDRESS_SHORT = '0x1a2b…e1f2'

// Chaves reais de `localStorage` usadas pela app (não dá pra importar os módulos
// de `src/` aqui - ver nota em `e2e/fixtures/test.ts` sobre o alias `@/` não
// resolver no projeto TS do Playwright).
const ACCESS_TOKEN_KEY = 'kurio-access-token' // src/entities/session/model/token-storage.ts
const IDEMPOTENCY_KEY_PREFIX = 'kurio-pending-order-key:' // src/shared/lib/idempotency.ts

// `src/shared/api/http.ts` aplica 3s de atraso simulado por request REST via
// Axios, e o checkout encadeia várias chamadas sequenciais (carrinho → cotação →
// revalidação da cotação → criação do pedido → detalhe do pedido confirmado) -
// bem mais lento que qualquer fluxo já testado em `01-03`, daí os timeouts generosos
// e o `describe.configure` abaixo (mesmo padrão de `03-cart.spec.ts`).
test.describe.configure({ timeout: 120_000 })

const CHECKOUT_LOAD_TIMEOUT = 20_000
// Generoso de propósito: sob a suíte completa (muitos workers/Chromium em
// paralelo), a soma de 3 chamadas REST com 3s de atraso simulado cada
// (revalidar cotação, criar pedido, recibo) mais 1.2s de resolução assíncrona
// já passa de 7s nominais - contenção de CPU com outras specs rodando ao
// mesmo tempo pode inflar isso bem mais; aumentar o teto evita um falso
// negativo por lentidão da máquina, não mascara estado incorreto (a espera
// continua sendo por texto visível, nunca por tempo fixo).
const CONFIRM_STEP_TIMEOUT = 45_000
const CONFIRMED_REDIRECT_TIMEOUT = 15_000

function isMobileViewport(page: Page): boolean {
  const viewport = page.viewportSize()
  return Boolean(viewport && viewport.width < 1024)
}

async function buyIntoCart(page: Page) {
  await page.goto(`/nft/${NFT_ID}?edition=${EDITION_ID}`)
  const buyButtonName = isMobileViewport(page) ? 'Comprar NFT' : 'COMPRAR'
  await page.getByRole('button', { name: buyButtonName, exact: true }).click()
  await expect(page.getByRole('button', { name: buyButtonName, exact: true })).toBeEnabled()
}

async function readIdempotencyKey(page: Page): Promise<string> {
  const key = await page.evaluate((prefix) => {
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const storageKey = window.localStorage.key(i)
      if (storageKey?.startsWith(prefix)) return window.localStorage.getItem(storageKey)
    }
    return null
  }, IDEMPOTENCY_KEY_PREFIX)
  if (!key) throw new Error('Idempotency key não encontrada no localStorage')
  return key
}

async function fetchOrderByIdempotencyKey(
  page: Page,
  idempotencyKey: string,
): Promise<{ id: string; status: string }> {
  return page.evaluate(
    async ({ tokenKey, key }) => {
      const token = window.localStorage.getItem(tokenKey)
      const response = await fetch(`/api/orders?idempotencyKey=${encodeURIComponent(key)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return response.json()
    },
    { tokenKey: ACCESS_TOKEN_KEY, key: idempotencyKey },
  )
}

// Conectar a carteira preenche (e valida) rede/endereço/tipo automaticamente no
// formulário do colecionador (`useCollectorProfileForm`, efeito que observa
// `connectedWallet`) e os dados do usuário logado já cobrem nome/usuário/e-mail -
// não é preciso digitar nada a mais pra "Avançar para revisão" ficar habilitado.
async function connectSeededWallet(page: Page) {
  await page.getByRole('button', { name: /MetaMask/ }).click()
  await expect(page.getByRole('button', { name: 'Trocar carteira' })).toBeVisible({
    timeout: CHECKOUT_LOAD_TIMEOUT,
  })
}

async function goToCheckoutReview(page: Page) {
  await buyIntoCart(page)
  await page.goto('/checkout')
  await expect(page.getByText(NFT_NAME)).toBeVisible({ timeout: CHECKOUT_LOAD_TIMEOUT })
  await connectSeededWallet(page)

  const advanceButton = page.getByRole('button', { name: 'Avançar para revisão' })
  await expect(advanceButton).toBeEnabled({ timeout: 10_000 })
  await advanceButton.click()
  await expect(page.getByRole('button', { name: 'Confirmar compra' })).toBeVisible({
    timeout: CHECKOUT_LOAD_TIMEOUT,
  })
}

test.describe('Checkout - pagamento e confirmação', () => {
  test('compra completa: carrinho → checkout → recibo confirmado', async ({
    page,
    scenario,
    loginAs,
  }) => {
    await scenario.use('success')
    await loginAs('collector-a')
    await goToCheckoutReview(page)

    // `main` desambigua de "Bem-vindo, Ana Colecionadora" no cabeçalho desktop
    // (`SiteHeader.tsx`), que também contém o nome de exibição do usuário.
    await expect(page.locator('main').getByText('Ana Colecionadora')).toBeVisible()
    await expect(page.getByText(WALLET_ADDRESS)).toBeVisible()

    await page.getByRole('button', { name: 'Confirmar compra' }).click()

    await page.waitForURL((url) => /\/orders\//.test(url.pathname), {
      timeout: CONFIRMED_REDIRECT_TIMEOUT,
    })

    await expect(
      page.getByText('Seus NFTs agora estão na sua carteira', { exact: false }),
    ).toBeVisible({ timeout: CHECKOUT_LOAD_TIMEOUT })
    await expect(page.getByText(NFT_NAME)).toBeVisible()
    // O total aparece duas vezes na página (resumo no topo e detalhe da
    // transação) - `.first()` evita violação de modo estrito, ambas legítimas.
    await expect(page.getByText(TOTAL_ETH_TEXT).first()).toBeVisible()
    await expect(page.getByText(WALLET_ADDRESS_SHORT)).toBeVisible()
  })

  test('pagamento recusado mostra mensagem clara e preserva o carrinho', async ({
    page,
    scenario,
    loginAs,
  }) => {
    await scenario.use('payment-declined')
    await loginAs('collector-a')
    await goToCheckoutReview(page)

    await page.getByRole('button', { name: 'Confirmar compra' }).click()

    const alert = page.getByRole('alert')
    await expect(alert).toContainText('Pedido recusado', { timeout: CONFIRM_STEP_TIMEOUT })
    await expect(alert).toContainText('Pagamento recusado pela carteira')

    await page.goto('/cart')
    await expect(page.getByText(NFT_NAME)).toBeVisible({ timeout: CHECKOUT_LOAD_TIMEOUT })
    await expect(page.locator('main').getByText('1', { exact: true }).first()).toBeVisible()
  })

  test('clique duplo em "Confirmar compra" cria só um pedido', async ({
    page,
    scenario,
    loginAs,
  }) => {
    await scenario.use('success')
    await loginAs('collector-a')
    await goToCheckoutReview(page)

    const idempotencyKey = await readIdempotencyKey(page)

    const createdOrderIds: string[] = []
    page.on('response', (response) => {
      if (response.request().method() !== 'POST' || !response.url().endsWith('/api/orders')) return
      void response
        .json()
        .then((body: { id?: string }) => {
          if (body.id) createdOrderIds.push(body.id)
        })
        .catch(() => undefined)
    })

    const confirmButton = page.getByRole('button', { name: 'Confirmar compra' })
    // `dblclick` dispara os dois cliques no mesmo gesto do Playwright, sem uma
    // segunda chamada de locator com seu próprio retry/auto-wait - um segundo
    // `.click()` separado fica esperando um botão que já foi desmontado assim
    // que a revalidação da cotação começa, e estoura o timeout sem testar o
    // guard de verdade.
    await confirmButton.dblclick()

    await expect(page).toHaveURL(/\/orders\//, { timeout: CONFIRMED_REDIRECT_TIMEOUT })
    const confirmedOrderId = new URL(page.url()).pathname.split('/').pop()

    // Não confia só na UI: confirma pela própria API simulada que a chave de
    // idempotência usada nos dois cliques resolve para um único pedido, o mesmo
    // que a tela de confirmação está mostrando.
    const verifiedOrder = await fetchOrderByIdempotencyKey(page, idempotencyKey)
    expect(verifiedOrder.id).toBe(confirmedOrderId)

    await expect
      .poll(() => createdOrderIds.length, { timeout: CONFIRM_STEP_TIMEOUT })
      .toBeGreaterThan(0)
    expect(new Set(createdOrderIds)).toEqual(new Set([confirmedOrderId]))
  })

  test('cotação alterada ao confirmar exige aceitar o novo valor', async ({
    page,
    scenario,
    loginAs,
  }) => {
    await scenario.use('quote-changed')
    await loginAs('collector-a')
    await goToCheckoutReview(page)

    const confirmButton = page.getByRole('button', { name: 'Confirmar compra' })
    await confirmButton.click()

    await expect(page.getByRole('alert')).toContainText('A cotação deste pedido foi atualizada.', {
      timeout: CONFIRM_STEP_TIMEOUT,
    })
    await expect(confirmButton).toBeDisabled()

    await page.getByRole('button', { name: 'Aceitar novo valor' }).click()
    await expect(confirmButton).toBeEnabled({ timeout: 5_000 })
  })

  test('edição esgotada ao confirmar mostra erro claro sem travar a tela', async ({
    page,
    scenario,
    loginAs,
  }) => {
    await scenario.use('edition-sold-out')
    await loginAs('collector-a')
    await goToCheckoutReview(page)

    const confirmButton = page.getByRole('button', { name: 'Confirmar compra' })
    await confirmButton.click()

    await expect(page.getByRole('alert')).toHaveText('Edição esgotada', {
      timeout: CONFIRM_STEP_TIMEOUT,
    })
    await expect(confirmButton).toBeEnabled()
  })
})
