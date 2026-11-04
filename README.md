# Kurio NFT Marketplace

Marketplace de NFTs 100% simulado (MSW: REST + Socket.IO), construído em React + TypeScript para o desafio técnico `junglegaming/frontend-challenge` (Jungle Gaming).

> **Estado atual.** A API simulada está completa: handlers REST de sessão/conta, NFTs, favoritos, carrinho, cotação, pedidos, perfil e carteiras, contratos zod compartilhados, 9 cenários reproduzíveis (latência, offline, cupom inválido/expirado, pagamento recusado, timeout, preço alterado, edição esgotada) e emissão real de eventos (`nft.updated`, `order.updated`) via `socket.io-client`. O que **ainda não existe** são as telas de produto: `entities/`, `features/` e `widgets/` estão vazias, e a única rota real é a Home (smoke test de `/api/health`). Este README documenta o que já funciona hoje.

## Stack

React 19 · TypeScript · Vite · TanStack Router (file-based) · TanStack Query · Axios · Socket.IO (`socket.io-client`) · Tailwind CSS v4 · shadcn/ui · MSW 2 (+ `@mswjs/socket.io-binding`) · Playwright · Lighthouse CI · zod · big.js · @faker-js/faker · husky + commitlint · steiger (lint de arquitetura FSD).

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

Dois usuários fixos em `src/mocks/fixtures/users.ts`, determinísticos (sem `faker`, hardcoded) e usados pelo handler `POST /api/auth/login`:

| E-mail                          | Senha       | Nome de exibição   | Username      |
| ------------------------------- | ----------- | ------------------ | ------------- |
| `ana.colecionadora@kurio.test`  | `Kurio@123` | Ana Colecionadora  | `ana.kurio`   |
| `bruno.colecionador@kurio.test` | `Kurio@123` | Bruno Colecionador | `bruno.kurio` |

São credenciais **fictícias de demonstração** — não existe backend real, e a senha só é comparada em texto nas fixtures (usuários cadastrados em runtime via `POST /api/auth/register` recebem hash de verdade, nunca senha em claro). Também é possível criar uma conta nova via `POST /api/auth/register`.

## Seleção e reset de cenários MSW

O motor de cenários vive em `src/mocks/scenarios/registry.ts`. Um cenário fica ativo globalmente (toda request MSW consulta `getActiveScenario()`) e é resolvido, em ordem de prioridade: query param `?scenario=<id>` na URL (persistido automaticamente em `localStorage`) → valor salvo em `localStorage` (chave `kurio-mocks-scenario`) → `success` como padrão.

| id                 | O que simula                                                                                                                                                                                   | Como ativar                  |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| `success`          | Caminho feliz, sem latência extra                                                                                                                                                              | `?scenario=success` (padrão) |
| `slow-network`     | Latência de 800–2000ms em toda request                                                                                                                                                         | `?scenario=slow-network`     |
| `offline`          | Toda request falha como erro de rede (`HttpResponse.error()`)                                                                                                                                  | `?scenario=offline`          |
| `coupon-invalid`   | Cupom `KURIO10` (normalmente válido) responde `COUPON_INVALID` em `POST /api/quote` e `POST /api/orders`                                                                                       | `?scenario=coupon-invalid`   |
| `coupon-expired`   | Cupom `KURIO10` (normalmente válido) responde `COUPON_EXPIRED` em `POST /api/quote` e `POST /api/orders`                                                                                       | `?scenario=coupon-expired`   |
| `payment-declined` | Todo `POST /api/orders` cria o pedido `pending` e, ~1.2s depois (assíncrono, via `order.updated`), transiciona para `status: "declined"` (`declineReason: "Pagamento recusado pela carteira"`) | `?scenario=payment-declined` |
| `order-timeout`    | Todo `POST /api/orders` cria o pedido `pending` e nunca agenda a transição — fica `pending` indefinidamente (simula timeout de confirmação)                                                    | `?scenario=order-timeout`    |
| `quote-changed`    | Toda criação de pedido falha com `409 QUOTE_CHANGED`                                                                                                                                           | `?scenario=quote-changed`    |
| `edition-sold-out` | Toda criação de pedido falha com `409 AVAILABILITY_CONFLICT`                                                                                                                                   | `?scenario=edition-sold-out` |

Três formas de ativar/trocar, todas equivalentes (a terceira grava nas mesmas duas primeiras):

1. **Query param**: acessar `http://localhost:5173/?scenario=offline` — grava automaticamente em `localStorage` e passa a valer em qualquer rota até ser trocado.
2. **`localStorage` direto**: no console do browser, `localStorage.setItem('kurio-mocks-scenario', 'slow-network')` e recarregar a página (chave exportada como `STORAGE_KEY` em `src/mocks/scenarios/registry.ts`).
3. **Painel visual** (`src/mocks/dev/ScenarioPanel.tsx`): canto inferior direito, visível sempre em `npm run dev` (`import.meta.env.DEV`) ou em qualquer ambiente com `?devtools=1` na URL (inclusive a demo publicada). Tem um `Select` com os 9 cenários e um botão **Reset**.

### Reset do estado

O botão **Reset** do painel visual chama `db.reset()` (`src/mocks/db/store.ts`) e recarrega a página. `reset()` descarta o estado atual e reconstrói a partir das fixtures determinísticas: os 2 usuários fixos, os 40 NFTs gerados com `withSeed(42, ...)` (`src/mocks/fixtures/nfts.ts`) e tudo mais zerado — sessões, favoritos, carrinhos, pedidos, chaves de idempotência e carteiras voltam vazios. O `db` não é exposto numa variável global hoje, então fora do painel visual o reset mais direto é apagar a chave `kurio-mocks-db` do `localStorage` do navegador (DevTools → Application → Local Storage) e recarregar a página — o próximo `db.get()` reconstrói o mesmo estado inicial por não encontrar nada salvo.

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

Hoje não há telas de checkout/carrinho (`entities`/`features`/`widgets` ainda não existem), então os cenários abaixo se reproduzem chamando a API simulada diretamente — com o cenário ativo (via `?scenario=<id>` ou painel, ver seção anterior) e usando o console do browser ou uma aba de DevTools (Network) na própria aplicação rodando (`npm run dev` ou `npm run preview`), já que o MSW intercepta `fetch`/`XHR` nessa origem independente da rota visitada.

| Cenário a reproduzir                           | Como ativar                                                                                                              | Endpoint para observar o efeito                                     | O que observar na resposta                                                                                                                          |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Latência alta em qualquer request              | `?scenario=slow-network`                                                                                                 | Qualquer rota, ex. `GET /api/nfts`                                  | Resposta demora 800–2000ms antes de chegar.                                                                                                         |
| Falha de rede (offline)                        | `?scenario=offline`                                                                                                      | Qualquer rota                                                       | A request rejeita com erro de rede (`HttpResponse.error()`), sem corpo de resposta.                                                                 |
| Cupom inválido                                 | `?scenario=coupon-invalid`                                                                                               | `POST /api/quote` ou `POST /api/orders` com `couponCode: "KURIO10"` | `422` com `{ "error": { "code": "COUPON_INVALID" } }`.                                                                                              |
| Cupom expirado                                 | `?scenario=coupon-expired`                                                                                               | `POST /api/quote` ou `POST /api/orders` com `couponCode: "KURIO10"` | `422` com `{ "error": { "code": "COUPON_EXPIRED" } }`.                                                                                              |
| Pagamento recusado                             | `?scenario=payment-declined`                                                                                             | `POST /api/orders` (autenticado, com `Idempotency-Key`)             | `201` com `Order.status === "pending"`; ~1.2s depois chega `order.updated` com `status: "declined"` e `declineReason` preenchido; estoque não muda. |
| Timeout na confirmação do pedido               | `?scenario=order-timeout`                                                                                                | `POST /api/orders` (autenticado, com `Idempotency-Key`)             | `201` com `Order.status === "pending"` e nenhum `order.updated` de transição é agendado — permanece `pending` indefinidamente; estoque não muda.    |
| Preço mudou desde a cotação                    | `?scenario=quote-changed`                                                                                                | `POST /api/orders` (autenticado, com `Idempotency-Key`)             | `409` com `{ "error": { "code": "QUOTE_CHANGED" } }`.                                                                                               |
| Edição esgotada                                | `?scenario=edition-sold-out`                                                                                             | `POST /api/orders` (autenticado, com `Idempotency-Key`)             | `409` com `{ "error": { "code": "AVAILABILITY_CONFLICT" } }`.                                                                                       |
| Conflito de idempotência (qualquer cenário)    | Não depende de cenário — repetir a mesma `Idempotency-Key` em `POST /api/orders` com corpo diferente, ou de outra sessão | `POST /api/orders`                                                  | `409` com `{ "error": { "code": "CONFLICT" } }`; a mesma chave + mesmo corpo, em vez disso, retorna `201` com o pedido já existente.                |
| Sessão expirada/inexistente (qualquer cenário) | Não depende de cenário — chamar uma rota 🔒 sem header `Authorization` ou com token de sessão já removida                | Qualquer rota 🔒, ex. `GET /api/cart`                               | `401` com `{ "error": { "code": "UNAUTHORIZED" } }`.                                                                                                |

Ver a tabela completa de contratos REST (requests, respostas e todos os códigos de erro por rota) e o detalhamento dos eventos de Socket.IO em `ARCHITECTURE.md`.

## Estrutura atual do projeto

Ver visão completa e diagrama em `ARCHITECTURE.md`. Resumo rápido:

```
src/
├── app/           # router, routes (file-based), routeTree.gen.ts
├── pages/         # home, not-found
├── shared/        # api (http, query-client, contracts, socket), config, lib, ui (shadcn adaptado)
└── mocks/         # db/, fixtures/, handlers/ (REST), scenarios/, socket/ (Socket.IO via MSW), dev/ (ScenarioPanel)
```

`entities/`, `features/` e `widgets/` ainda não existem — serão criados a partir das próximas fases do roadmap, consumindo a API simulada que já está pronta.
