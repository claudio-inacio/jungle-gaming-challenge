import type { Page } from '@playwright/test'
import { expect, test } from '../fixtures/test'

// Mesmos dados determinísticos de `04-checkout.spec.ts` (ver comentário lá sobre
// a edição '1/50' usada tanto em `POST /api/quote` quanto em `POST /api/orders`).
const NFT_ID = 'nft_001'
const NFT_NAME = 'Spirited Councilman'
const EDITION_ID = 'nft_001-edition-1-50'
const TOTAL_ETH_TEXT = '12.026 ETH'

// Edição diferente da que está no carrinho, usada só para gerar um pedido "de
// fundo" que resolve pra `confirmed` e emite `nft.updated` pra este NFT - nunca
// toca a linha do carrinho em teste (editionId diferente), e tem estoque de
// sobra (~196 unidades, tipo "aberta") pra não esgotar entre execuções.
const BACKGROUND_EDITION_ID = 'nft_001-edition-open'

// Carteira primária pré-cadastrada para cada usuário de demo (`createInitialState`
// em `src/mocks/db/store.ts`) - endereço de `collector-a`/`user-1`.
const WALLET_ADDRESS = '0x1a2b3c4d5e6f7890a1b2c3d4e5f6a7b8c9d0e1f2'

const ACCESS_TOKEN_KEY = 'kurio-access-token' // src/entities/session/model/token-storage.ts
const IDEMPOTENCY_KEY_PREFIX = 'kurio-pending-order-key:' // src/shared/lib/idempotency.ts

// Mesmo motivo de `04-checkout.spec.ts`: várias chamadas REST sequenciais com
// 3s de atraso simulado cada (`src/shared/api/http.ts`).
test.describe.configure({ timeout: 120_000 })

const CHECKOUT_LOAD_TIMEOUT = 20_000
// Ver comentário equivalente em `04-checkout.spec.ts`: generoso de propósito
// para a suíte completa rodando em paralelo.
const CONFIRM_STEP_TIMEOUT = 45_000

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

async function connectSeededWallet(page: Page) {
  await page.getByRole('button', { name: /MetaMask/ }).click()
  await expect(page.getByRole('button', { name: 'Trocar carteira' })).toBeVisible({
    timeout: CHECKOUT_LOAD_TIMEOUT,
  })
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

// Cria um pedido "de fundo" (via chamada real ao MSW, não um clique de UI) pra
// outra edição do mesmo NFT. Sob o cenário `success` ele resolve pra `confirmed`
// depois de `ORDER_RESOLUTION_DELAY_MS` (1.2s, `src/mocks/handlers/order.ts`) e,
// ao resolver, o handler emite `nft.updated` (broadcast público) pela mesma
// conexão de socket que a página de checkout já está escutando - é o único jeito
// real de disparar esse evento sem recriar o binding Socket.IO à mão.
async function createBackgroundOrder(page: Page, editionId: string) {
  return page.evaluate(
    async ({ tokenKey, address, nftId, editionId: id }) => {
      const token = window.localStorage.getItem(tokenKey)
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'Idempotency-Key': crypto.randomUUID(),
        },
        body: JSON.stringify({
          items: [{ nftId, editionId: id, quantity: 1 }],
          walletAddress: address,
          network: 'ethereum',
        }),
      })
      const body = await res.json()
      return body as { id: string; status: string }
    },
    { tokenKey: ACCESS_TOKEN_KEY, address: WALLET_ADDRESS, nftId: NFT_ID, editionId },
  )
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

test.describe('Checkout - recuperação de pedido e eventos em tempo real', () => {
  test('timeout após criar o pedido: refresh recupera o MESMO pedido pending', async ({
    page,
    scenario,
    loginAs,
  }) => {
    await scenario.use('order-timeout')
    await loginAs('collector-a')
    await goToCheckoutReview(page)

    const orderPostCount: unknown[] = []
    page.on('response', (response) => {
      if (response.request().method() === 'POST' && response.url().endsWith('/api/orders')) {
        orderPostCount.push(response.url())
      }
    })

    await page.getByRole('button', { name: 'Confirmar compra' }).click()

    // `order-timeout` nunca resolve o pedido: fica `pending` pra sempre de
    // propósito - não há estado terminal pra esperar aqui. `exact: true`
    // desambigua do anúncio para leitor de tela (`OrderStatusAnnouncer`, texto
    // mais longo e `sr-only`) que também contém esta frase como substring.
    await expect(page.getByText('Pagamento em processamento', { exact: true })).toBeVisible({
      timeout: CONFIRM_STEP_TIMEOUT,
    })

    const idempotencyKey = await readIdempotencyKey(page)
    const orderBeforeReload = await fetchOrderByIdempotencyKey(page, idempotencyKey)
    expect(orderBeforeReload.status).toBe('pending')

    await page.reload()

    await expect(page.getByText('Pagamento em processamento', { exact: true })).toBeVisible({
      timeout: CONFIRM_STEP_TIMEOUT,
    })

    const orderAfterReload = await fetchOrderByIdempotencyKey(page, idempotencyKey)
    expect(orderAfterReload.id).toBe(orderBeforeReload.id)
    expect(orderAfterReload.status).toBe('pending')

    // A recuperação usa `GET /orders?idempotencyKey=...`, nunca um novo POST -
    // confirma que só existiu uma criação de pedido na vida inteira do teste.
    expect(orderPostCount.length).toBe(1)
  })

  test('evento nft.updated chegando durante o checkout reflete no resumo sem reload', async ({
    page,
    scenario,
    loginAs,
  }) => {
    await scenario.use('success')
    await loginAs('collector-a')
    await buyIntoCart(page)
    await page.goto('/checkout')

    await expect(page.getByText(NFT_NAME)).toBeVisible({ timeout: CHECKOUT_LOAD_TIMEOUT })
    await expect(page.getByText(TOTAL_ETH_TEXT).first()).toBeVisible({
      timeout: CHECKOUT_LOAD_TIMEOUT,
    })

    // Registrado ANTES do gatilho, pra capturar a cotação disparada pela
    // invalidação de cache que o evento `nft.updated` deve causar (nunca uma
    // escrita direta no cache - ver `useCartRealtime`).
    const nextQuoteResponse = page.waitForResponse(
      (response) => response.url().includes('/api/quote') && response.request().method() === 'POST',
      { timeout: 10_000 },
    )

    await createBackgroundOrder(page, BACKGROUND_EDITION_ID)

    await expect(
      page.getByText('O preço ou a disponibilidade de um item do seu carrinho mudou.'),
    ).toBeVisible({ timeout: 10_000 })
    await nextQuoteResponse

    // A tela continua íntegra e com o total correto depois de processar o
    // evento - nenhum reload foi feito neste teste.
    await expect(page.getByText(TOTAL_ETH_TEXT).first()).toBeVisible()
  })

  // Cenário 8 do roadmap (eventos `order.updated` duplicados/antigos não devem
  // reabrir um pedido já terminal): não há, nesta app, nenhum caminho real (REST
  // ou UI) que force o mock a reemitir um `order.updated` repetido ou com
  // `version` menor para o MESMO pedido - `resolveOrder` em
  // `src/mocks/handlers/order.ts` só roda uma vez por pedido (é guardado por
  // `stored.status !== 'pending'`) e só existem dois eventos naturais por
  // pedido (criação e resolução), sempre em ordem crescente de versão. Forçar
  // esse caso exigiria injetar um frame de socket sintético direto, o que a
  // regra do projeto proíbe (eventos sempre pelo binding Socket.IO real, nunca
  // fakeados). A dedupe por `eventId`/`version` em `useCheckout.ts` e
  // `useCartRealTime.ts` está implementada e documentada, mas não há como
  // exercitá-la ponta a ponta sem um ator de rede capaz de reenviar um evento
  // antigo - registrado aqui como limitação conhecida, não como teste fraco.
  test.skip('order.updated duplicado/antigo não reabre pedido terminal (sem caminho real pra forçar isso só com Playwright - ver comentário acima)', async () => {})
})
