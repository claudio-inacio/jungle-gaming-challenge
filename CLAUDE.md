# Kurio NFT Marketplace — Desafio Frontend React Pleno (Jungle Gaming)

Você está trabalhando no desafio técnico `junglegaming/frontend-challenge`: um marketplace de NFTs em React + TypeScript, 100% simulado com MSW (REST + Socket.IO). Não existe backend real.

Responda e escreva documentação em **português do Brasil**. Código, nomes de arquivos, identificadores e mensagens de commit em **inglês**.

## Fontes de verdade (nesta ordem)

1. `docs/challenge/README-challenge.md` — enunciado oficial (comportamentos e critérios). Em caso de dúvida, ele vence.
2. Skill `challenge-context` — requisitos condensados, eliminatórios, tokens e frames do Figma.
3. Figma (cópia editável): fileKey `TWDGE5ytlsmMSUk7jX50Hw` — identidade visual. Estados não desenhados seguem o mesmo padrão visual.
4. `ARCHITECTURE.md` — decisões já tomadas. Não contradiga sem registrar uma nova decisão.

## Mapa do código: use o graphify antes de explorar

- Antes de ler arquivos às cegas ou fazer buscas amplas, consulte `graphify-out/GRAPH_REPORT.md` (nós centrais, comunidades, dependências) e use o grafo para localizar o que importa.
- Se `graphify-out/` não existir ou estiver desatualizado após mudanças estruturais (nova camada, novo slice, novas rotas), rode `/graphify .` — o cache reprocessa só o que mudou.
- Use o grafo para checar impacto antes de alterar algo de `shared/` ou `entities/` (quem depende disso?).
- Detalhes: rule `graphify.md` e skill `graph-context`.

## Stack obrigatória (eliminatório se não for usada de fato)

React · TypeScript · TanStack Router · TanStack Query · Axios · REST · Socket.IO (`socket.io-client`) · Tailwind CSS · shadcn/ui · MSW (+ `@mswjs/socket.io-binding`) · Playwright · Lighthouse.
Complementares escolhidas: Vite, zod, react-hook-form, big.js, @faker-js/faker (seed fixa), sonner, @lhci/cli, steiger, husky + commitlint.

## Arquitetura: Feature-Sliced Design

`app → pages → widgets → features → entities → shared` (uma camada só importa das camadas **abaixo**). `src/mocks/` é infraestrutura de simulação e **nunca** é importado por código de negócio. Detalhes na rule `fsd-architecture.md`.

## Comandos

```bash
npm run dev          # dev com mocks (VITE_ENABLE_MOCKS=true)
npm run build        # build otimizado (mocks habilitados para a demo)
npm run preview
npm run typecheck
npm run lint         # eslint + steiger (FSD)
npm run test:e2e     # Playwright (chromium desktop + mobile)
npm run lighthouse   # LHCI: 3 runs, mediana
```

Sempre rode `typecheck` e `lint` antes de considerar uma tarefa concluída. Rode os testes E2E relacionados quando mexer em fluxos.

## Como trabalhamos (fluxo padrão)

Para qualquer tarefa do roadmap, use a skill `implement-task`:
1. contexto (graphify + challenge-context) → 2. plano com `frontend-architect` → 3. execução pelos subagentes especialistas → 4. revisão com `code-reviewer` → 5. commit semântico pequeno (skill `semantic-commit`).

Subagentes não chamam outros subagentes: **a orquestração é sempre feita pela sessão principal**.

| Subagente | Quando usar |
|---|---|
| `frontend-architect` | Planejar slice/feature, contratos, query keys, rotas. Não escreve código. |
| `mock-engineer` | MSW: db, fixtures, handlers, cenários, idempotência, eventos simulados |
| `feature-dev` | entities/features/pages com Query, Router, Axios, formulários |
| `ui-dev` | Componentes visuais a partir do Figma, shadcn adaptado, skeletons, responsivo |
| `realtime-engineer` | socket.io-client, dedupe/versão, reconexão e reconciliação com REST |
| `test-engineer` | Playwright E2E e regressão visual |
| `quality-auditor` | Lighthouse, a11y, Web Vitals, bundle |
| `code-reviewer` | Revisão final: eliminatórios, FSD, tipagem, estados, a11y |
| `docs-writer` | README.md, ARCHITECTURE.md, contratos e decisões |

## Nunca faça

- Respostas fictícias ou "caminhos de demo" em componentes, hooks ou no cliente Axios.
- Atualizar UI/cache para simular evento em vez de emitir pelo socket.
- `Number`/`parseFloat` em valores ETH.
- Mostrar sucesso em ação fora do escopo (newsletter, login social, "esqueci a senha"…).
- Commits gigantes misturando escopos.
