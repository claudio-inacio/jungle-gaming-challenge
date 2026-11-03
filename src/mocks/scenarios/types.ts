export interface Scenario {
  id: string
  description: string
  networkLatencyMs?: [number, number]
  forceOffline?: boolean
  overrides?: Record<string, { status: number; code: string; when?: Record<string, unknown> }>
}
