import { delay, HttpResponse } from 'msw'
import { getActiveScenario } from './registry'

export async function withScenario<T>(fn: () => T | Promise<T>): Promise<T> {
  const scenario = getActiveScenario()
  if (scenario.forceOffline) throw HttpResponse.error()
  if (scenario.networkLatencyMs) {
    const [min, max] = scenario.networkLatencyMs
    await delay(min + Math.random() * (max - min))
  }
  return fn()
}
