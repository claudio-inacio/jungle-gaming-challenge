import { useState } from 'react'
import { Button } from '@/shared/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { db } from '../db/store'
import { scenarios, STORAGE_KEY } from '../scenarios/registry'

function readStoredScenarioId(): string {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? 'success'
  } catch {
    return 'success'
  }
}

function storeScenarioId(id: string): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, id)
  } catch {
    // Storage indisponível (modo privado, bloqueado etc.) - ignora, é ferramenta de dev.
  }
}

/**
 * Painel flutuante de desenvolvimento para alternar cenários MSW e resetar o
 * banco mock. Vive fora de `src/app` para que `src/mocks/**` nunca precise
 * ser importado por código de negócio - quem monta este componente é o
 * bootstrap condicional do app.
 */
export function ScenarioPanel() {
  const [scenarioId, setScenarioId] = useState<string>(() => readStoredScenarioId())

  function handleScenarioChange(value: string | null): void {
    if (!value) return
    setScenarioId(value)
    storeScenarioId(value)
  }

  function handleReset(): void {
    db.reset()
    window.location.reload()
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-md border border-border bg-card p-2 text-foreground shadow-md">
      <Select value={scenarioId} onValueChange={(value) => handleScenarioChange(value)}>
        <SelectTrigger size="sm">
          <SelectValue placeholder="Cenário" />
        </SelectTrigger>
        <SelectContent>
          {Object.values(scenarios).map((scenario) => (
            <SelectItem key={scenario.id} value={scenario.id} title={scenario.description}>
              {scenario.id}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button variant="outline" size="sm" onClick={handleReset}>
        Reset
      </Button>
    </div>
  )
}
