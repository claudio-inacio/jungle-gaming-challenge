import type { Page } from '@playwright/test'
import Big from 'big.js'
import { expect, test } from '../fixtures/test'

// `nft_001` ("Spirited Councilman", seed 42, `src/mocks/fixtures/nfts.ts`) - mesmos
// dados determinísticos usados em `02-nft-detail.spec.ts`. A edição '1/1'
// (`nft_001-edition-1-1`) tem só 1 unidade disponível, o que a torna inadequada
// para testar incremento de quantidade no carrinho (bateria no limite
// imediatamente); usamos a edição '1/50' (`nft_001-edition-1-50`, 15 disponíveis,
// 12.016 ETH) para os testes de quantidade, selecionada via `?edition=` - o mesmo
// deep link real da aplicação já usado em `02-nft-detail.spec.ts` para o caso de
// edição esgotada.
const NFT_ID = 'nft_001'
const NFT_NAME = 'Spirited Councilman'
const EDITION_ID = 'nft_001-edition-1-50'

// `KURIO10` (10%, válido) e `KURIO-EXPIRED` (expirado) vêm de
// `src/mocks/fixtures/coupons.ts`. Qualquer código fora desse fixture (como
// `CODIGO-INEXISTENTE`) é inválido por não existir, sem precisar de nenhum
// cenário especial - os cenários `coupon-invalid`/`coupon-expired` do fixture
// `scenario` servem para forçar KURIO10 a falhar em outros fluxos (cotação,
// pedido); aqui testamos inválido/expirado de verdade, sob o cenário `success`.
const VALID_COUPON = 'KURIO10'
const EXPIRED_COUPON = 'KURIO-EXPIRED'
const UNKNOWN_COUPON = 'CODIGO-INEXISTENTE'

function isMobileViewport(page: Page): boolean {
  const viewport = page.viewportSize()
  return Boolean(viewport && viewport.width < 1024)
}

// O carrinho autenticado encadeia duas chamadas reais em sequência (`GET
// /api/cart` e depois `POST /api/quote`, só habilitada quando os itens chegam) -
// mais lento que uma navegação comum, daí o timeout maior para a primeira
// aparição do item e do resumo.
const CART_LOAD_TIMEOUT = 15_000

function cartSummary(page: Page) {
  return page.getByRole('complementary')
}

// `CartSummary` renderiza linhas `<dt>/<dd>` dentro do `<aside>` (sem role ARIA
// próprio para esses elementos) - a forma acessível de ler o valor é pelo texto
// visível que termina em "ETH", escopado pela landmark `complementary`. O Total
// é sempre o último valor em ETH do bloco (depois de Subtotal, Desconto e Taxa
// de rede). Espera a linha de desconto assentar antes de ler - enquanto a
// cotação (`POST /api/quote`) está pendente, o resumo é só o skeleton
// `aria-hidden`, sem nenhum "ETH" visível ainda.
async function waitForQuoteSettled(page: Page) {
  await expect(cartSummary(page).getByText(/^\(-\)/)).toBeVisible({ timeout: CART_LOAD_TIMEOUT })
}

async function readTotal(page: Page): Promise<Big> {
  await waitForQuoteSettled(page)
  const amounts = await cartSummary(page).getByText(/ETH$/).allTextContents()
  const lastAmount = amounts.at(-1) ?? '0 ETH'
  return new Big(lastAmount.replace(/\s*ETH$/, '').trim())
}

async function readDiscount(page: Page): Promise<string> {
  await waitForQuoteSettled(page)
  const text = await cartSummary(page)
    .getByText(/^\(-\)/)
    .textContent()
  return (text ?? '').trim()
}

// Semeia o carrinho de visitante direto no `localStorage`, no formato real de
// `guestCartStorage` (`src/entities/cart/model/guest-cart-storage.ts`). Não existe
// hoje nenhum caminho de UI para um visitante criar a primeira linha do carrinho -
// "COMPRAR" sempre redireciona para `/login` sem sessão (`useAddToCart`) - então
// semear o `localStorage` é a única forma de chegar a um carrinho de visitante
// não vazio para testar persistência e merge no login; é uma particularidade real
// desta fase do app, não um artifício do teste.
async function seedGuestCart(
  page: Page,
  items: { nftId: string; editionId: string; quantity: number }[],
) {
  await page.addInitScript(
    (seededItems) => window.localStorage.setItem('kurio-guest-cart', JSON.stringify(seededItems)),
    items,
  )
}

async function buyAsAuthenticated(page: Page) {
  await page.goto(`/nft/${NFT_ID}?edition=${EDITION_ID}`)
  const buyButtonName = isMobileViewport(page) ? 'Comprar NFT' : 'COMPRAR'
  await page.getByRole('button', { name: buyButtonName, exact: true }).click()
  await expect(page.getByRole('button', { name: buyButtonName, exact: true })).toBeEnabled()
}

// `src/shared/api/http.ts` aplica um atraso mínimo simulado de 3s por request
// REST (`SIMULATED_REQUEST_DELAY_MS`), de propósito, para manter os estados de
// loading visíveis. Cada mutação do carrinho encadeia 2-3 requests sequenciais
// (ex.: PATCH quantidade -> GET /api/cart -> POST /api/quote), e os testes
// abaixo fazem várias mutações em sequência - o timeout padrão de 30s do
// Playwright não é suficiente mesmo no caminho feliz, sem nenhuma lentidão real
// de rede ou flakiness envolvida.
test.describe('Carrinho - quantidade, remoção, cupom e persistência', () => {
  test.describe.configure({ timeout: 90_000 })

  test('alterar quantidade atualiza a linha e o total', async ({ page, scenario, loginAs }) => {
    await scenario.use('success')
    await loginAs('collector-a')
    await buyAsAuthenticated(page)

    await page.goto('/cart')
    await expect(page.getByText(NFT_NAME)).toBeVisible({ timeout: CART_LOAD_TIMEOUT })

    const quantity = page.locator('main').getByText('1', { exact: true }).first()
    await expect(quantity).toBeVisible()
    const totalBefore = await readTotal(page)

    const increaseButton = page.getByRole('button', { name: `Aumentar quantidade de ${NFT_NAME}` })
    await increaseButton.click()
    await expect(page.locator('main').getByText('2', { exact: true }).first()).toBeVisible({
      timeout: CART_LOAD_TIMEOUT,
    })

    await expect
      .poll(async () => (await readTotal(page)).toString(), { timeout: CART_LOAD_TIMEOUT })
      .not.toBe(totalBefore.toString())
    const totalAfterIncrease = await readTotal(page)
    expect(totalAfterIncrease.gt(totalBefore)).toBe(true)

    const decreaseButton = page.getByRole('button', { name: `Diminuir quantidade de ${NFT_NAME}` })
    await decreaseButton.click()
    await expect(page.locator('main').getByText('1', { exact: true }).first()).toBeVisible({
      timeout: CART_LOAD_TIMEOUT,
    })
    await expect
      .poll(async () => (await readTotal(page)).toString(), { timeout: CART_LOAD_TIMEOUT })
      .toBe(totalBefore.toString())
  })

  test('remover item esvazia o carrinho', async ({ page, scenario, loginAs }) => {
    await scenario.use('success')
    await loginAs('collector-a')
    await buyAsAuthenticated(page)

    await page.goto('/cart')
    await expect(page.getByText(NFT_NAME)).toBeVisible({ timeout: CART_LOAD_TIMEOUT })

    await page.getByRole('button', { name: `Remover ${NFT_NAME} do carrinho` }).click()

    // `EmptyState` (`src/shared/ui/QueryState.tsx`) expõe o título num `role="status"`
    // (não um heading) - mesmo padrão já usado para o estado de edição esgotada em
    // `02-nft-detail.spec.ts`.
    await expect(page.getByRole('status')).toHaveText(/Seu carrinho está vazio/, {
      timeout: CART_LOAD_TIMEOUT,
    })
  })

  test('cupom válido aplica desconto e reduz o total', async ({ page, scenario, loginAs }) => {
    await scenario.use('success')
    await loginAs('collector-a')
    await buyAsAuthenticated(page)

    await page.goto('/cart')
    const totalBefore = await readTotal(page)
    expect(await readDiscount(page)).toContain('0.00 ETH')

    await page.getByLabel('Código promocional').fill(VALID_COUPON)
    await page.getByRole('button', { name: 'Aplicar' }).click()

    await expect(page.getByText(`Cupom ${VALID_COUPON} aplicado`)).toBeVisible({
      timeout: CART_LOAD_TIMEOUT,
    })
    await expect
      .poll(async () => readDiscount(page), { timeout: CART_LOAD_TIMEOUT })
      .not.toContain('0.00 ETH')

    const totalAfter = await readTotal(page)
    expect(totalAfter.lt(totalBefore)).toBe(true)

    // `exact: true` desambigua do botão "Remover {nome} do carrinho" da linha do
    // item na tabela, que também casa com um `getByRole('button', { name: 'Remover' })`
    // sem `exact` (nome acessível contém "Remover" como prefixo).
    await page.getByRole('button', { name: 'Remover', exact: true }).click()
    await expect(page.getByText(`Cupom ${VALID_COUPON} aplicado`)).toHaveCount(0, {
      timeout: CART_LOAD_TIMEOUT,
    })
    await expect
      .poll(async () => (await readTotal(page)).toString(), { timeout: CART_LOAD_TIMEOUT })
      .toBe(totalBefore.toString())
  })

  test('cupom inexistente mostra "Cupom inválido." e não altera o total', async ({
    page,
    scenario,
    loginAs,
  }) => {
    await scenario.use('success')
    await loginAs('collector-a')
    await buyAsAuthenticated(page)

    await page.goto('/cart')
    const totalBefore = await readTotal(page)

    await page.getByLabel('Código promocional').fill(UNKNOWN_COUPON)
    await page.getByRole('button', { name: 'Aplicar' }).click()

    await expect(page.getByRole('alert')).toHaveText('Cupom inválido.', {
      timeout: CART_LOAD_TIMEOUT,
    })
    expect((await readTotal(page)).toString()).toBe(totalBefore.toString())
  })

  test('cupom expirado mostra "Este cupom expirou." e não altera o total', async ({
    page,
    scenario,
    loginAs,
  }) => {
    await scenario.use('success')
    await loginAs('collector-a')
    await buyAsAuthenticated(page)

    await page.goto('/cart')
    const totalBefore = await readTotal(page)

    await page.getByLabel('Código promocional').fill(EXPIRED_COUPON)
    await page.getByRole('button', { name: 'Aplicar' }).click()

    await expect(page.getByRole('alert')).toHaveText('Este cupom expirou.', {
      timeout: CART_LOAD_TIMEOUT,
    })
    expect((await readTotal(page)).toString()).toBe(totalBefore.toString())
  })

  test('carrinho de usuário autenticado persiste após refresh', async ({
    page,
    scenario,
    loginAs,
  }) => {
    await scenario.use('success')
    await loginAs('collector-a')
    await buyAsAuthenticated(page)

    await page.goto('/cart')
    await expect(page.getByText(NFT_NAME)).toBeVisible({ timeout: CART_LOAD_TIMEOUT })

    await page.reload()

    await expect(page.getByText(NFT_NAME)).toBeVisible({ timeout: CART_LOAD_TIMEOUT })
    await expect(page.locator('main').getByText('1', { exact: true }).first()).toBeVisible()
  })

  test('carrinho de visitante persiste após refresh', async ({ page, scenario }) => {
    await scenario.use('success')
    await seedGuestCart(page, [{ nftId: NFT_ID, editionId: EDITION_ID, quantity: 1 }])
    await page.goto('/cart')

    await expect(page.getByText(NFT_NAME)).toBeVisible({ timeout: CART_LOAD_TIMEOUT })

    await page.reload()

    await expect(page.getByText(NFT_NAME)).toBeVisible({ timeout: CART_LOAD_TIMEOUT })
    await expect(page.locator('main').getByText('1', { exact: true }).first()).toBeVisible()
  })

  test('carrinho de visitante é mesclado ao carrinho do usuário no login e persiste no servidor', async ({
    page,
    scenario,
    loginAs,
  }) => {
    await scenario.use('success')
    await seedGuestCart(page, [{ nftId: NFT_ID, editionId: EDITION_ID, quantity: 1 }])

    await loginAs('collector-a')

    await page.goto('/cart')
    await expect(page.getByText(NFT_NAME)).toBeVisible({ timeout: CART_LOAD_TIMEOUT })

    // Novo reload prova que o item foi persistido no carrinho do usuário via
    // `POST /api/cart/merge` (servidor simulado), não que ele só continua visível
    // por sobreviver em cache local do visitante - o merge limpa `kurio-guest-cart`
    // no sucesso (`guestCartStorage.clear()` em `useLoginForm`).
    await page.reload()
    await expect(page.getByText(NFT_NAME)).toBeVisible({ timeout: CART_LOAD_TIMEOUT })
  })
})
