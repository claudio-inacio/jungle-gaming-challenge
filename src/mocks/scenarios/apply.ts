import { delay, HttpResponse } from 'msw'
import { getActiveScenario } from './registry'
import type { Scenario, ScenarioOverride } from './types'

export async function withScenario<T>(fn: () => T | Promise<T>): Promise<T> {
  const scenario = getActiveScenario()
  if (scenario.forceOffline) throw HttpResponse.error()
  if (scenario.networkLatencyMs) {
    const [min, max] = scenario.networkLatencyMs
    await delay(min + Math.random() * (max - min))
  }
  return fn()
}

/**
 * Override declarativo de um cenário para "METHOD /path" (ex. "POST /api/quote"),
 * usado para forçar um erro determinístico (cupom inválido/expirado, pagamento
 * recusado, etc.) independente dos dados reais do db. `when` casa campos do corpo
 * já parseado pelo próprio handler - `withScenario` nunca lê o body (evita
 * consumir o stream da Request antes do handler fazer `request.json()`).
 */
export function matchOverride(
  method: string,
  pathname: string,
  when?: Record<string, unknown>,
  scenario: Scenario = getActiveScenario(),
): ScenarioOverride | null {
  const override = scenario.overrides?.[`${method} ${pathname}`]
  if (!override) return null
  if (override.when) {
    if (!when) return null
    const matches = Object.entries(override.when).every(([key, value]) => when[key] === value)
    if (!matches) return null
  }
  return override
}
