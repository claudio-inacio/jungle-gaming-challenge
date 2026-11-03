import { describe, expect, it } from 'vitest'
import { addEth, formatEth, mulEth, parseEth } from './eth'

describe('eth utils', () => {
  it('soma com precisão decimal (sem erro de float)', () => {
    expect(addEth('0.1', '0.2')).toBe('0.3')
  })
  it('multiplica por quantidade inteira', () => {
    expect(mulEth('1.19', 2)).toBe('2.38')
  })
  it('rejeita valores inválidos', () => {
    expect(() => parseEth('abc')).toThrow()
  })
  it('formata com unidade', () => {
    expect(formatEth('26.846')).toBe('26.846 ETH')
    expect(formatEth('0')).toBe('0.000 ETH')
  })
})
