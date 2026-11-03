import type { Scenario } from './types'

const successScenario: Scenario = {
  id: 'success',
  description: 'Caminho feliz, sem latência extra',
}

export const scenarios: Record<string, Scenario> = {
  success: successScenario,
  'slow-network': {
    id: 'slow-network',
    description: 'Latência de 800–2000ms em toda request',
    networkLatencyMs: [800, 2000],
  },
  offline: {
    id: 'offline',
    description: 'Toda request falha como erro de rede',
    forceOffline: true,
  },
}

const STORAGE_KEY = 'kurio-mocks-scenario'

// Em Node (testes de integração, SSR) não há `window`/`location`/`localStorage`;
// nesse caso o cenário ativo é sempre o padrão (sucesso).
export function getActiveScenario(): Scenario {
  if (typeof window === 'undefined') return successScenario

  const fromUrl = new URLSearchParams(window.location.search).get('scenario')
  const id = fromUrl ?? window.localStorage.getItem(STORAGE_KEY) ?? 'success'
  if (fromUrl) window.localStorage.setItem(STORAGE_KEY, fromUrl)
  return scenarios[id] ?? successScenario
}
