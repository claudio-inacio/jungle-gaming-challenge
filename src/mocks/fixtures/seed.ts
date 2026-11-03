import { faker } from '@faker-js/faker'
export function withSeed<T>(seed: number, fn: () => T): T {
  faker.seed(seed)
  return fn()
}
