import Big from 'big.js'

export type EthAmount = string // sempre string, para evitar problemas de precisão com floats

const ETH_PATTERN = /^\d+(\.\d+)?$/

export function parseEth(value: EthAmount): Big {
  if (!ETH_PATTERN.test(value)) throw new Error(`Invalid ETH amount: "${value}"`)
  return new Big(value)
}

export function addEth(a: EthAmount, b: EthAmount): EthAmount {
  return parseEth(a).plus(parseEth(b)).toString()
}

export function subEth(a: EthAmount, b: EthAmount): EthAmount {
  return parseEth(a).minus(parseEth(b)).toString()
}

export function mulEth(a: EthAmount, quantity: number): EthAmount {
  return parseEth(a).times(quantity).toString()
}

export function sumEth(values: EthAmount[]): EthAmount {
  return values.reduce((acc, v) => addEth(acc, v), '0')
}

export function compareEth(a: EthAmount, b: EthAmount): -1 | 0 | 1 {
  return parseEth(a).cmp(parseEth(b)) as -1 | 0 | 1
}

export function formatEth(value: EthAmount, decimals = 3): string {
  return `${parseEth(value).toFixed(decimals)} ETH`
}
