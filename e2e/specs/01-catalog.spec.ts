import type { Page } from '@playwright/test'
import Big from 'big.js'
import { expect, test } from '../fixtures/test'

// Dados determinísticos: `src/mocks/fixtures/nfts.ts` usa `faker.seed(42)`, então
// nomes/preços/coleções/redes são sempre os mesmos entre execuções - MAS qualquer
// chamada nova ao `faker` inserida no meio da geração (ex: o campo `editions` por
// NFT, ou o tamanho de `ARTWORK_POOL` usado por `buildShuffledArtworkSequence`)
// desloca a sequência inteira do PRNG compartilhado, mudando todos os nomes daí em
// diante. Os valores abaixo foram recalculados com `npx tsx` lendo `fixtureNfts`
// diretamente depois de `buildShuffledArtworkSequence` passar a rodar numa seed
// isolada (44, não mais 42) só para não repetir esse problema a cada mudança no
// pool de artes - se a geração da fixture mudar de novo, recalcule de novo em vez
// de adivinhar. Ordenação padrão da API é `sortBy=newest` (`sort=recent` da URL).
// "Same Hexagon" (ethereum, Violet Nomads) - item 4 da página 1, padrão, e também
//   item 1 ao filtrar só ethereum
// "Bogus Hamburger" (polygon, Crypto Punks Kurio) - item 2 da página 1, padrão,
//   não está em "Em alta"
// "Glorious Curl" (ethereum, Violet Nomads) - membro da interseção ethereum+Violet Nomads
// "Excellent Cutlet" (ethereum, mas coleção Pixel Dreams, não Violet Nomads)
// "Considerate Molasses" - único NFT com "Molasses" no nome
// "Fine Sock" (1.178 ETH) - o mais barato dos 40, independe de ordenação/filtro
// "Deep Hovel" - primeiro item da página 2 (itens 13-24) na ordenação padrão

const NFT_ETHEREUM_FIRST = 'Same Hexagon'
const NFT_POLYGON_DEFAULT = 'Bogus Hamburger'
const NFT_HARD_TO_FIND = 'Glorious Curl'
const NFT_WRONG_COLLECTION = 'Excellent Cutlet'
const NFT_UNIQUE_SEARCH_TERM = 'Considerate Molasses'
const NFT_CHEAPEST_OVERALL = 'Fine Sock'
const NFT_FIRST_PAGE_TWO = 'Deep Hovel'

const GRID_ASSERTION_TIMEOUT = 15_000

function nftLink(page: Page, name: string) {
  return page.getByRole('link', { name: new RegExp(name) })
}

async function expectNftVisible(page: Page, name: string) {
  await expect(nftLink(page, name)).toBeVisible({ timeout: GRID_ASSERTION_TIMEOUT })
}

async function expectNftHidden(page: Page, name: string) {
  await expect(nftLink(page, name)).toHaveCount(0, { timeout: GRID_ASSERTION_TIMEOUT })
}

// Primeiro link para `/nft/:id` no grid, na ordem em que aparece no DOM. Não há
// landmark próprio para o grid (Hero/PromoCards/BlogSection também têm links na
// mesma página), então escopar por `href` é mais confiável aqui do que por texto.
function firstGridItemName(page: Page) {
  return page.locator('main a[href^="/nft/"]').first()
}

// O campo de busca do header mobile ("Explorar coleções") ainda não tem estado
// ligado ao `q` da URL (é só visual nesta fase) - ver `SiteHeader.tsx`. Por isso
// testamos a busca navegando direto para `?q=...`: o handler MSW (`nft.ts`) já
// filtra por `q` de verdade, então isso continua sendo um teste real de integração
// com a API simulada, só sem passar por uma interação de UI que não existe ainda.
async function searchByQuery(page: Page, query: string) {
  await page.goto(`/?q=${encodeURIComponent(query)}`)
}

function isMobileViewport(page: Page): boolean {
  const viewport = page.viewportSize()
  return Boolean(viewport && viewport.width < 1024)
}

async function openMobileFiltersIfNeeded(page: Page) {
  if (isMobileViewport(page)) {
    await page.getByRole('button', { name: 'Abrir filtros e opções avançadas' }).click()
  }
  // No desktop a sidebar já está na página; no mobile ela só existe depois do Sheet abrir.
  await expect(page.getByRole('group', { name: 'Rede' })).toBeVisible()
}

// O Sheet mobile aplica aria-hidden no resto da página enquanto aberto (correto
// para a11y), o que tira o grid da árvore de acessibilidade até fechar - sem isso
// `getByRole('link', ...)` nunca encontra os itens do catálogo atrás do Sheet.
async function closeMobileFiltersIfNeeded(page: Page) {
  if (isMobileViewport(page)) {
    await page.keyboard.press('Escape')
    await expect(page.getByRole('group', { name: 'Rede' })).not.toBeVisible()
  }
}

// O botão da página ativa perde o `aria-label="Página N"` (vira `aria-current="page"`
// sem nome acessível além do texto "N"), então localizamos pelo texto do número, que
// é estável nos dois estados, em vez de pelo nome acessível que muda.
function pageButton(page: Page, pageNumber: number) {
  return page.getByRole('navigation', { name: 'Paginação' }).getByText(String(pageNumber), {
    exact: true,
  })
}

function getUrlArrayParam(page: Page, key: string): string[] {
  const raw = new URL(page.url()).searchParams.get(key)
  if (!raw) return []
  const parsed = JSON.parse(raw) as unknown
  return Array.isArray(parsed) ? parsed.map(String) : []
}

function getUrlParam(page: Page, key: string): string | null {
  return new URL(page.url()).searchParams.get(key)
}

// Converte o texto exibido ("26.846 ETH") num `Big` para comparar valores em ETH
// sem nunca usar `Number`/`parseFloat` (ver rule `eth-money.md`).
function parseDisplayedEth(text: string): Big {
  const amount = text.replace(/\s*ETH$/, '').trim()
  return new Big(amount)
}

test.describe('Catálogo - busca, filtros, ordenação, paginação e histórico', () => {
  test('filtro de rede atualiza a URL e o grid', async ({ page, scenario }) => {
    await scenario.use('success')
    await page.goto('/')
    await expectNftVisible(page, NFT_POLYGON_DEFAULT)

    await openMobileFiltersIfNeeded(page)
    await page.getByRole('checkbox', { name: 'Ethereum' }).click()

    await expect.poll(() => getUrlArrayParam(page, 'network')).toEqual(['ethereum'])
    await closeMobileFiltersIfNeeded(page)

    await expectNftVisible(page, NFT_ETHEREUM_FIRST) // ethereum
    await expectNftHidden(page, NFT_POLYGON_DEFAULT) // polygon, deve sair do grid
  })

  test('combinar rede + coleção reflete os dois na URL e aplica interseção', async ({
    page,
    scenario,
  }) => {
    await scenario.use('success')
    await page.goto('/')

    await openMobileFiltersIfNeeded(page)

    // Pega o nome real da primeira coleção renderizada (vem de `/api/nfts/collections`),
    // em vez de hardcodar - mas sabemos pela fixture que a primeira é "Violet Nomads"
    // (toda em ethereum), o que nos dá uma combinação previsível para validar a interseção.
    const collectionsGroup = page.getByRole('group', { name: 'Coleções' })
    const firstCollectionLabel = collectionsGroup.locator('label').first()
    const firstCollectionText = (await firstCollectionLabel.textContent())?.trim() ?? ''
    const firstCollectionName = firstCollectionText.replace(/\s*\(\d+\)$/, '')

    await page.getByRole('checkbox', { name: 'Ethereum' }).click()
    await collectionsGroup.getByRole('checkbox', { name: new RegExp(firstCollectionName) }).click()

    await expect.poll(() => getUrlArrayParam(page, 'network')).toEqual(['ethereum'])
    await expect.poll(() => getUrlArrayParam(page, 'collections')).toHaveLength(1)
    await closeMobileFiltersIfNeeded(page)

    // Violet Nomads é inteiramente ethereum - a interseção deve manter seus itens...
    await expectNftVisible(page, NFT_HARD_TO_FIND)
    // ...mas excluir itens de outras coleções, mesmo que também sejam ethereum.
    await expectNftHidden(page, NFT_WRONG_COLLECTION)
    // e excluir itens de outras redes.
    await expectNftHidden(page, NFT_POLYGON_DEFAULT)
  })

  test('mudar de aba reseta a página para 1', async ({ page, scenario }) => {
    await scenario.use('success')
    await page.goto('/')

    await pageButton(page, 2).click()
    await expect.poll(() => getUrlParam(page, 'page')).toBe('2')

    await page.getByRole('tab', { name: 'Em alta' }).click()
    await expect.poll(() => getUrlParam(page, 'page')).toBe('1')
  })

  test('ordenação reflete na URL e muda a ordem dos itens no grid', async ({ page, scenario }) => {
    await scenario.use('success')
    await page.goto('/')

    const firstPriceBefore = await firstGridItemName(page).getByText(/ETH$/).first().textContent()

    await page.getByRole('combobox', { name: 'Ordenar por' }).click()
    await page.getByRole('option', { name: 'Menor preço' }).click()

    await expect.poll(() => getUrlParam(page, 'sort')).toBe('price-asc')

    // O item mais barato de todos (0.637 ETH) deve virar o primeiro do grid.
    await expectNftVisible(page, NFT_CHEAPEST_OVERALL)
    await expect(firstGridItemName(page)).toContainText(NFT_CHEAPEST_OVERALL, {
      timeout: GRID_ASSERTION_TIMEOUT,
    })

    const firstPriceAfterText = await firstGridItemName(page)
      .getByText(/ETH$/)
      .first()
      .textContent()

    expect(firstPriceBefore).not.toBeNull()
    expect(firstPriceAfterText).not.toBeNull()
    const before = parseDisplayedEth(firstPriceBefore ?? '0 ETH')
    const after = parseDisplayedEth(firstPriceAfterText ?? '0 ETH')
    expect(after.lte(before)).toBe(true)
  })

  test('paginação navega para a página 2 e troca os itens', async ({ page, scenario }) => {
    await scenario.use('success')
    await page.goto('/')
    await expectNftVisible(page, NFT_ETHEREUM_FIRST)

    await pageButton(page, 2).click()

    await expect.poll(() => getUrlParam(page, 'page')).toBe('2')
    await expectNftVisible(page, NFT_FIRST_PAGE_TWO)
    await expectNftHidden(page, NFT_ETHEREUM_FIRST)
    await expect(pageButton(page, 2)).toHaveAttribute('aria-current', 'page')
  })

  test('busca textual via ?q= filtra o catálogo pelo nome do NFT', async ({ page, scenario }) => {
    await scenario.use('success')
    // Nota: o input "Explorar coleções" do header mobile é só visual nesta fase
    // (sem estado ligado a `q`), então aqui testamos direto pela URL - ver nota
    // na função `searchByQuery` acima.
    await searchByQuery(page, 'Molasses')

    await expectNftVisible(page, NFT_UNIQUE_SEARCH_TERM)
    await expectNftHidden(page, NFT_HARD_TO_FIND)
    await expectNftHidden(page, NFT_POLYGON_DEFAULT)
  })

  test('voltar no navegador restaura o estado de filtro anterior', async ({ page, scenario }) => {
    await scenario.use('success')
    await page.goto('/')
    await expectNftVisible(page, NFT_POLYGON_DEFAULT) // estado A: aba "Todos os NFTs"

    await page.getByRole('tab', { name: 'Em alta' }).click() // estado B
    await expect.poll(() => getUrlParam(page, 'tab')).toBe('trending')
    await expectNftHidden(page, NFT_POLYGON_DEFAULT)

    await page.goBack()

    // `useCatalogFilters` navega com `navigate({ search: ... })` sem `replace: true`,
    // então cada mudança de filtro empilha uma entrada de histórico - `goBack()` deve
    // voltar ao estado A (aba "Todos os NFTs"), não permanecer em B.
    await expect.poll(() => getUrlParam(page, 'tab')).toBe('all')
    await expect(page.getByRole('tab', { name: 'Todos os NFTs' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await expectNftVisible(page, NFT_POLYGON_DEFAULT)
  })
})
