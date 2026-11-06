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
    files: [
      './src/features/login/**',
      './src/features/auth/login/**',
      './src/features/register/**',
      './src/features/logout/**',
    ],
    rules: { 'fsd/insignificant-slice': 'off' },
  },
  {
    // entities/cart, entities/quote, features/apply-coupon, widgets/cart-summary
    // e widgets/cart-table são os slices do fluxo de carrinho/cotação, separados
    // por responsabilidade (carrinho, cotação com cupom, aplicar cupom, resumo,
    // tabela de itens). entities/cart já tem 3 consumidores reais em slices
    // diferentes (widgets/cart-table, pages/cart, features/auth/login) — o
    // steiger reporta só 1 aqui, parece um falso positivo da heurística dele;
    // os demais têm um único consumidor hoje porque pages/cart é a única
    // página que os compõe até o checkout existir.
    files: [
      './src/entities/cart/**',
      './src/entities/quote/**',
      './src/features/apply-coupon/**',
      './src/widgets/cart-summary/**',
      './src/widgets/cart-table/**',
    ],
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
  {
    // features/connect-wallet e features/place-order são a lógica de negócio
    // da Fase 7 (pagamento e confirmação) - máquina de estados do checkout,
    // idempotência, revalidação de cotação e tempo real do pedido. Ainda sem
    // consumidor porque a página de checkout (UI) é uma tarefa separada,
    // posterior às medidas do Figma.
    files: ['./src/features/connect-wallet/**', './src/features/place-order/**'],
    rules: { 'fsd/insignificant-slice': 'off' },
  },
  {
    // entities/order (só a query de detalhe do pedido) e features/collector-profile
    // (formulário RHF+zod do perfil do colecionador) nascem nesta leva da Fase 7
    // com um único consumidor cada (pages/order-confirmation e pages/checkout,
    // respectivamente) - mesma situação de connect-wallet/place-order acima.
    files: ['./src/entities/order/**', './src/features/collector-profile/**'],
    rules: { 'fsd/insignificant-slice': 'off' },
  },
])
