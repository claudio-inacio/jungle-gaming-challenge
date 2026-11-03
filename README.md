# Kurio NFT Marketplace

Marketplace de NFTs 100% simulado (MSW: REST + Socket.IO), construído em React + TypeScript para o desafio técnico `junglegaming/frontend-challenge` (Jungle Gaming).

> **Estado atual: Fase 0 — Setup.** Ainda não existem sessão, carrinho, catálogo, NFTs, pedidos, perfil nem carteiras. Este README documenta o que já funciona hoje e marca como "a definir" o que está planejado para fases futuras do roadmap (veja `.claude/skills/challenge-context/references/roadmap.md`).

## Stack

React 19 · TypeScript · Vite · TanStack Router (file-based) · TanStack Query · Axios · Socket.IO (`socket.io-client`) · Tailwind CSS v4 · shadcn/ui · MSW 2 (+ `@mswjs/socket.io-binding`) · Playwright · Lighthouse CI · zod · husky + commitlint · steiger (lint de arquitetura FSD).

## Setup

Pré-requisitos: Node.js 22, npm.

```bash
git clone <url-do-repositorio>
cd jungle-gaming-challenge
npm install
cp .env.example .env
npm run dev
```

O app sobe em `http://localhost:5173` com os mocks (MSW) habilitados.

## Variáveis de ambiente

Definidas em `.env.example`:

| Variável            | Valor padrão                 | Descrição                                                                                                                                                          |
| ------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `VITE_ENABLE_MOCKS` | `true`                       | Liga o MSW (`msw/browser`) no bootstrap da aplicação (`src/main.tsx`). Fica `true` também no build de produção, pois a demo pública (Vercel) não tem backend real. |
| `VITE_API_URL`      | `/api`                       | `baseURL` do cliente Axios (`src/shared/api/http.ts`).                                                                                                             |
| `VITE_SOCKET_URL`   | `wss://realtime.kurio.local` | URL de conexão do `socket.io-client` (`src/shared/api/socket/client.ts`). Interceptada pelo MSW via `ws.link`, nunca sai para a rede real.                         |

Essas variáveis são lidas em `src/shared/config/env.ts`. Não há segredos reais: o projeto não possui backend, então não existem chaves de API, tokens de terceiros ou credenciais de infraestrutura.

## Credenciais fictícias

Ainda não existem usuários simulados nem fluxo de login — **a definir na Fase 3** (autenticação), quando a camada `entities/session` e os fixtures de usuário (`src/mocks/fixtures/`) forem criados. Este README será atualizado com e-mail/senha de pelo menos dois usuários fictícios (`faker` com seed fixa) assim que existirem.

## Seleção e reset de cenários MSW

Ainda não há cenários configuráveis — **a definir na Fase 1** (fundação de mocks: `db/`, `fixtures/`, `scenarios/`, `reset()`). O plano (ver `references/requirements.md` da skill `challenge-context`) prevê selecionar cenário via query param e/ou `localStorage`, com reset para um estado conhecido. Esta seção será substituída pela lista real de cenários (sucesso, vazio, latência, timeout, offline, 4xx/5xx, sessão expirada, conflito, cupom inválido/expirado, preço alterado, edição esgotada, pagamento confirmado/recusado) e pelo comando/atalho de reset quando implementados.

## Comandos

| Comando                      | O que faz                                                                                                                                                      |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`                | Dev server (Vite) com mocks habilitados (`VITE_ENABLE_MOCKS=true` via `.env`).                                                                                 |
| `npm run build`              | `tsc -b && vite build` — build de produção (mocks habilitados, pois é a base da demo pública).                                                                 |
| `npm run preview`            | Serve o build de produção localmente (usado por Playwright e Lighthouse).                                                                                      |
| `npm run typecheck`          | `tsc -b` — checagem de tipos em modo projeto (strict).                                                                                                         |
| `npm run lint`               | `eslint .` + `steiger ./src` (regras de camadas do Feature-Sliced Design).                                                                                     |
| `npm run format`             | `prettier --write .`                                                                                                                                           |
| `npm run test:e2e`           | Playwright, projetos `desktop` (Chromium 1440×900) e `mobile` (Pixel 7, 390×844). Faz build + preview automaticamente (`webServer` em `playwright.config.ts`). |
| `npm run test:e2e:ui`        | Playwright em modo UI interativo.                                                                                                                              |
| `npm run lighthouse:mobile`  | LHCI com `lighthouserc.mobile.json` (preset mobile, 3 runs).                                                                                                   |
| `npm run lighthouse:desktop` | LHCI com `lighthouserc.desktop.json` (preset desktop, 3 runs).                                                                                                 |
| `npm run lighthouse`         | Build + os dois comandos acima. Relatórios em `reports/lighthouse/{mobile,desktop}`.                                                                           |

Sempre rode `typecheck` e `lint` antes de considerar uma tarefa concluída. Rode `test:e2e` quando alterar fluxos cobertos por specs.

### CI

`.github/workflows/ci.yml` executa em push/PR para `main`/`master`: 4 jobs independentes — `typecheck`, `lint`, `playwright` (Chromium, publica `playwright-report/` como artefato) e `lighthouse` (publica `reports/` como artefato). Node 22 em todos.

### Deploy

`vercel.json` define rewrites de SPA (`"/(.*)" → "/index.html"`) para que o roteamento do TanStack Router funcione em refresh/acesso direto a qualquer rota na Vercel.

## Como reproduzir cada fluxo de falha

Ainda não existem fluxos de negócio (carrinho, checkout, pedidos) nem cenários de erro simulados — **a definir conforme cada fase do roadmap for implementada** (latência, timeout, offline, 4xx/5xx, sessão expirada, conflito de pedido, cupom inválido/expirado, preço alterado, edição esgotada, pagamento recusado). Esta seção será substituída por uma tabela "cenário → como ativar → o que observar na UI" assim que os cenários existirem em `src/mocks/scenarios/`.

## Estrutura atual do projeto

Ver visão completa e diagrama em `ARCHITECTURE.md`. Resumo rápido:

```
src/
├── app/           # router, routes (file-based), routeTree.gen.ts
├── pages/         # home, not-found
├── shared/        # api (http, query-client, socket), config, lib, ui (shadcn adaptado)
└── mocks/         # browser.ts, handlers/ (REST), socket/ (Socket.IO via MSW)
```

`entities/`, `features/` e `widgets/` ainda não existem — serão criados a partir da Fase 1/2 do roadmap.
