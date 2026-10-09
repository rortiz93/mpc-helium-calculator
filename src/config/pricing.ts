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

const defaultBundles: Bundle[] = [
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

const defaultCustomizations: Customization[] = [
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

export type PricingSettings = {
  bundles: Bundle[]
  customizations: Customization[]
}

export const defaultPricingSettings: PricingSettings = {
  bundles: defaultBundles,
  customizations: defaultCustomizations,
}

export const pricingStorageKey = 'mpc-helium-pricing-settings'

export function loadPricingSettings(): PricingSettings {
  if (typeof window === 'undefined') return clonePricingSettings(defaultPricingSettings)
  try {
    const stored = window.localStorage.getItem(pricingStorageKey)
    if (!stored) return clonePricingSettings(defaultPricingSettings)
    const parsed = JSON.parse(stored) as PricingSettings
    if (!Array.isArray(parsed.bundles) || !Array.isArray(parsed.customizations)) throw new Error('Invalid pricing settings')
    return parsed
  } catch {
    return clonePricingSettings(defaultPricingSettings)
  }
}

export function savePricingSettings(settings: PricingSettings) {
  window.localStorage.setItem(pricingStorageKey, JSON.stringify(settings))
}

export function clonePricingSettings(settings: PricingSettings): PricingSettings {
  return JSON.parse(JSON.stringify(settings)) as PricingSettings
}

export type Selections = Record<Customization['id'], number>

export const emptySelections: Selections = {
  smallFoil: 0,
  largeFoil: 0,
  additionalLatex: 0,
}

export function getMaxFoils(bundle: Bundle) {
  return bundle.latexCount
}

export function calculatePrice(bundle: Bundle, selections: Selections, customizations: Customization[] = defaultCustomizations) {
  const prices = Object.fromEntries(customizations.map((item) => [item.id, item.unitPrice])) as Record<Customization['id'], number>
  const rawPrice = bundle.basePrice +
    selections.smallFoil * prices.smallFoil +
    selections.largeFoil * prices.largeFoil +
    selections.additionalLatex * prices.additionalLatex
  const finalPrice = Math.ceil(rawPrice / 5) * 5
  return {
    rawPrice,
    finalPrice,
    roundingAdjustment: finalPrice - rawPrice,
    latexCount: bundle.latexCount - selections.smallFoil - selections.largeFoil + selections.additionalLatex,
    totalCount: bundle.latexCount + selections.additionalLatex,
  }
}
