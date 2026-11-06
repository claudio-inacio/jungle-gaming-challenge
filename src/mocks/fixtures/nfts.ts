import { nftDetailSchema, type NftDetail } from '@/shared/api/contracts/nft'
import raw from './nfts.generated.json'

// JSON estático gerado a partir do faker com seed fixa (ver `generate-nfts.ts` e
// `nfts.fixture.test.ts`). Em runtime o app nunca executa o faker: só importa este
// JSON e valida contra o contrato real, evitando ~416kB de `@faker-js/faker` no
// chunk do MSW. Para regenerar após mudar a lógica de geração: `npx vitest run -u`.
export const fixtureNfts: NftDetail[] = nftDetailSchema.array().parse(raw)
