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
])
