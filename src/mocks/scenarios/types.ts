import type { ApiErrorCode } from '@/shared/api/contracts/error'

export interface ScenarioOverride {
  status: number
  code: ApiErrorCode
  message: string
  when?: Record<string, unknown>
}

// Chave do override: "METHOD /path", ex. "POST /api/quote".
export interface Scenario {
  id: string
  description: string
  networkLatencyMs?: [number, number]
  forceOffline?: boolean
  overrides?: Record<string, ScenarioOverride>
}
