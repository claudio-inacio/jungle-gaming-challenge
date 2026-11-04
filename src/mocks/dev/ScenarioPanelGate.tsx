import { lazy, Suspense } from 'react'
import { env } from '@/shared/config/env'

// Carregado só quando exibido (import.meta.env.DEV ou ?devtools=1) e com mocks
// ativos, nunca no bundle inicial - o painel é ferramenta de dev, não parte
// do app de produto, e não faz sentido sem o db simulado.
const ScenarioPanel = lazy(() =>
  import('./ScenarioPanel').then((m) => ({ default: m.ScenarioPanel })),
)

function shouldShowScenarioPanel(): boolean {
  if (!env.enableMocks) return false
  if (import.meta.env.DEV) return true
  return new URLSearchParams(window.location.search).get('devtools') === '1'
}

export function ScenarioPanelGate() {
  if (!shouldShowScenarioPanel()) return null
  return (
    <Suspense fallback={null}>
      <ScenarioPanel />
    </Suspense>
  )
}
