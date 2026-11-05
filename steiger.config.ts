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
])
