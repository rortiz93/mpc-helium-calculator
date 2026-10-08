export type Bundle = {
  id: string
  name: string
  eyebrow: string
  description: string
  latexSize: number
  latexCount: number
  basePrice: number
  includesBase: boolean
  active: boolean
}

export type Customization = {
  id: 'smallFoil' | 'largeFoil' | 'additionalLatex'
  name: string
  shortName: string
  description: string
  unitPrice: number
  unitLabel: string
}

export const baseBundles: Bundle[] = [
  {
    id: 'classic-5',
    name: 'Classic 5',
    eyebrow: 'The everyday classic',
    description: '5 × 11” latex balloons + weighted base',
    latexSize: 11,
    latexCount: 5,
    basePrice: 35,
    includesBase: true,
    active: true,
  },
  {
    id: 'classic-10',
    name: 'Classic 10',
    eyebrow: 'More to celebrate',
    description: '10 × 11” latex balloons + weighted base',
    latexSize: 11,
    latexCount: 10,
    basePrice: 65,
    includesBase: true,
    active: true,
  },
  {
    id: 'statement-17',
    name: '17” Statement',
    eyebrow: 'Make it a moment',
    description: '4 × 17” latex balloons + weighted base',
    latexSize: 17,
    latexCount: 4,
    basePrice: 70,
    includesBase: true,
    active: true,
  },
]

export const customizations: Customization[] = [
  {
    id: 'smallFoil',
    name: 'Small foil',
    shortName: 'Small foil',
    description: 'Swaps with one latex balloon',
    unitPrice: 10,
    unitLabel: '+$10 each',
  },
  {
    id: 'largeFoil',
    name: 'Large foil',
    shortName: 'Large foil',
    description: 'Swaps with one latex balloon',
    unitPrice: 20,
    unitLabel: '+$20 each',
  },
  {
    id: 'additionalLatex',
    name: 'Additional latex',
    shortName: 'Extra latex',
    description: 'Adds to the bouquet count',
    unitPrice: 6,
    unitLabel: '+$6 each',
  },
]

export type Selections = Record<Customization['id'], number>

export const emptySelections: Selections = {
  smallFoil: 0,
  largeFoil: 0,
  additionalLatex: 0,
}

export function getMaxFoils(bundle: Bundle) {
  return bundle.latexCount
}

export function calculatePrice(bundle: Bundle, selections: Selections) {
  const rawPrice = bundle.basePrice +
    selections.smallFoil * 10 +
    selections.largeFoil * 20 +
    selections.additionalLatex * 6
  const finalPrice = Math.ceil(rawPrice / 5) * 5
  return {
    rawPrice,
    finalPrice,
    roundingAdjustment: finalPrice - rawPrice,
    latexCount: bundle.latexCount - selections.smallFoil - selections.largeFoil + selections.additionalLatex,
    totalCount: bundle.latexCount + selections.additionalLatex,
  }
}
