import { describe, expect, it } from 'vitest'
import { generateFixtureNfts } from './generate-nfts'

// Garante que `nfts.generated.json` continua idêntico ao que o faker geraria com a
// seed fixa de `generate-nfts.ts`. Se a lógica do gerador mudar sem atualizar o
// snapshot, este teste falha. Para regenerar o JSON estático: `npx vitest run -u`.
describe('generateFixtureNfts', () => {
  it('matches the static fixture snapshot used at runtime', async () => {
    const output = `${JSON.stringify(generateFixtureNfts(), null, 2)}\n`
    await expect(output).toMatchFileSnapshot('./nfts.generated.json')
  })
})
