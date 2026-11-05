import { defineConfig } from 'steiger'
import fsd from '@feature-sliced/steiger-plugin'

export default defineConfig([
  ...fsd.configs.recommended,
  { ignores: ['./src/mocks/**'] },
  {
    // Widgets fora de escopo adiantados antes de suas páginas existirem
    // (blog teaser da Home, bloco social do login, sidebar do perfil).
    // Ficam sem referência até as fases 4/3/7-8 compô-los; ver comentário
    // no topo de cada arquivo.
    files: [
      './src/widgets/blog-teaser/**',
      './src/widgets/auth-out-of-scope/**',
      './src/widgets/account-sidebar/**',
    ],
    rules: { 'fsd/insignificant-slice': 'off' },
  },
  {
    // login/register/logout são slices de verdade (form state, validação,
    // mutation) hoje com um único consumidor cada (pages/login,
    // pages/register, widgets/header). Mantê-las como slices próprias, em
    // vez de aninhadas sob um agrupador "auth", é o que evita os problemas
    // de public-api-sidestep/reserved-folder-names que motivaram esse
    // formato; "insignificant-slice" aqui é só o reflexo de o roadmap ainda
    // não ter outro consumidor.
    files: ['./src/features/login/**', './src/features/register/**', './src/features/logout/**'],
    rules: { 'fsd/insignificant-slice': 'off' },
  },
  {
    // nft-gallery/nft-detail-tabs/related-nfts/add-to-cart/toggle-favorite são os
    // widgets/features da tela de detalhe do NFT, separados por responsabilidade
    // (galeria, abas, relacionados, compra, favoritar) em vez de uma página monolítica
    // — convenção FSD do projeto, não "pequenos demais para existir". toggle-favorite
    // em especial ganhará um segundo consumidor real quando o catálogo (NftCard) e a
    // página de favoritos do perfil usarem o mesmo FavoriteButton.
    files: [
      './src/widgets/nft-gallery/**',
      './src/widgets/nft-detail-tabs/**',
      './src/widgets/related-nfts/**',
      './src/features/add-to-cart/**',
      './src/features/toggle-favorite/**',
    ],
    rules: { 'fsd/insignificant-slice': 'off' },
  },
  {
    // hero/catalog-grid/promo-cards/blog-section são seções grandes e
    // independentes da Home, extraídas em widgets próprios para manter
    // HomePage.tsx como composição fina (convenção FSD do projeto) — não
    // "pequenas demais para existir", só com um único consumidor porque a
    // Home ainda é a única página composta até agora.
    files: [
      './src/widgets/hero/**',
      './src/widgets/catalog-grid/**',
      './src/widgets/promo-cards/**',
      './src/widgets/blog-section/**',
      './src/features/catalog-filters/**',
    ],
    rules: { 'fsd/insignificant-slice': 'off' },
  },
])
