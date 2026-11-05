import { expect, test } from '../fixtures/test'

// `nft_001`, seed 42 (`src/mocks/fixtures/nfts.ts`): nome e preço estáveis entre
// execuções. A edição padrão selecionada é a primeira com `available > 0` ('1/1',
// 2.250 ETH) - '1/10' nasce esgotada de propósito (`SOLD_OUT_EDITION_NFT_INDEX`/
// `SOLD_OUT_EDITION_LABEL`) e é exatamente a que o cenário 3 seleciona manualmente.
const EXISTING_NFT_ID = 'nft_001'
const EXISTING_NFT_NAME = 'Scornful Rim'
const EXISTING_NFT_DEFAULT_PRICE = '2.250 ETH'
const SOLD_OUT_EDITION_ID = 'nft_001-edition-1-10'
const SOLD_OUT_EDITION_BUTTON_NAME = '1/10 · esgotada'

// `NftDetailPage` renderiza um skeleton enquanto a query de detalhe está pendente;
// no caminho de 404, o React Query ainda executa seus retries padrão antes de
// desistir e deixar `query.isError` assentar (o que dispara o `throw notFound()`)
// - então o `notFoundComponent` só aparece depois disso, mais lento que o
// carregamento normal de uma página existente.
const NOT_FOUND_ASSERTION_TIMEOUT = 15_000

test.describe('Detalhe do NFT - acesso direto, 404, edições e favoritos', () => {
  test('acesso direto a um NFT existente renderiza a página de detalhe', async ({
    page,
    scenario,
  }) => {
    await scenario.use('success')
    await page.goto(`/nft/${EXISTING_NFT_ID}`)

    await expect(page.getByRole('heading', { name: EXISTING_NFT_NAME, level: 1 })).toBeVisible()
    await expect(page.getByText(EXISTING_NFT_DEFAULT_PRICE).first()).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Detalhes do NFT' })).toBeVisible()
    await expect(
      page.getByRole('tab', { name: /Avaliações de colecionadores \(\d+\)/ }),
    ).toBeVisible()
  })

  test('acesso direto a um NFT inexistente renderiza a página 404 sem redirecionar', async ({
    page,
    scenario,
  }) => {
    await scenario.use('success')
    await page.goto('/nft/nft_does_not_exist')

    await expect(page.getByRole('heading', { name: 'Página não encontrada' })).toBeVisible({
      timeout: NOT_FOUND_ASSERTION_TIMEOUT,
    })
    // `notFoundComponent` do TanStack Router renderiza no lugar da rota sem navegar -
    // a URL permanece a do NFT inexistente, não é um redirect para "/".
    expect(new URL(page.url()).pathname).toBe('/nft/nft_does_not_exist')
  })

  test('selecionar uma edição esgotada mostra o aviso e desabilita COMPRAR', async ({
    page,
    scenario,
  }) => {
    await scenario.use('success')
    await page.goto(`/nft/${EXISTING_NFT_ID}`)

    // O chip de uma edição esgotada é um `<button disabled>` de propósito
    // (`NftPurchasePanel.tsx`: `disabled={e.available === 0}`), então um clique real
    // de usuário nunca dispara `selectEdition` - não há como chegar a esse estado
    // clicando no chip. A rota aceita `?edition=<id>` (`initialEditionId` em
    // `useEditionSelection`) para selecionar uma edição específica via deep link;
    // é o único caminho real da aplicação para visitar esse estado, então o usamos
    // aqui em vez de forçar um clique que o navegador recusaria a entregar.
    const soldOutEditionButton = page.getByRole('button', { name: SOLD_OUT_EDITION_BUTTON_NAME })
    await expect(soldOutEditionButton).toBeVisible()
    await expect(soldOutEditionButton).toBeDisabled()

    await page.goto(`/nft/${EXISTING_NFT_ID}?edition=${SOLD_OUT_EDITION_ID}`)

    await expect(page.getByRole('button', { name: SOLD_OUT_EDITION_BUTTON_NAME })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await expect(page.getByRole('status')).toHaveText(
      'Esta edição está esgotada. Escolha outra edição disponível.',
    )
    await expect(page.getByRole('button', { name: 'COMPRAR', exact: true })).toBeDisabled()
  })

  test('favoritar com falha na mutation desfaz o estado otimista (rollback)', async ({
    page,
    scenario,
    loginAs,
  }) => {
    // Ordem obrigatória: o cenário precisa ser ativado antes de qualquer `page.goto`,
    // já que a fixture `scenario` só tem efeito no próximo carregamento de documento.
    await scenario.use('mutation-failure')
    // `loginAs` navega para `/login` (único carregamento de página completo deste
    // teste) e, ao logar com sucesso, o app navega para "/" via `useNavigate` do
    // TanStack Router - navegação client-side, sem novo documento. Isso é
    // intencional: o `addInitScript` da fixture `scenario` apaga o db simulado (e a
    // sessão criada pelo login) a cada novo carregamento de documento no mesmo
    // `context`, então um `page.goto('/nft/...')` depois do login derrubaria a
    // sessão antes dos scripts da próxima página rodarem. Por isso chegamos ao
    // detalhe clicando num card do catálogo (navegação client-side do Router), em
    // vez de um novo `page.goto`.
    await loginAs('collector-a')

    const firstNftCard = page.locator('main a[href^="/nft/"]').first()
    await firstNftCard.click()

    const addFavoriteButton = page.getByRole('button', { name: 'Adicionar aos favoritos' })
    await expect(addFavoriteButton).toBeVisible()
    await expect(addFavoriteButton).toHaveAttribute('aria-pressed', 'false')

    await addFavoriteButton.click()

    const toggledFavoriteButton = page.getByRole('button', {
      name: /Adicionar aos favoritos|Remover dos favoritos/,
    })
    await expect(toggledFavoriteButton).toHaveAttribute('aria-pressed', 'true')
    // `mutation-failure` força 500/TRANSIENT em POST /api/favorites - o `onError` do
    // toggle-favorite desfaz para o snapshot anterior (`aria-pressed` volta a 'false').
    await expect(toggledFavoriteButton).toHaveAttribute('aria-pressed', 'false')
  })
})
