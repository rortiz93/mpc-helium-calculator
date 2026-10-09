export type BundleComponent = {
  id: string
  type: 'latex' | 'foil'
  name: string
  count: number
  size: number
}

export type Bundle = {
  id: string
  name: string
  eyebrow: string
  description: string
  components: BundleComponent[]
  basePrice: number
  basePriceMode: 'fixed' | 'perUnit'
  basePriceComponentId?: string
  includesBase: boolean
  active: boolean
}

export type CustomizationId = 'smallFoil' | 'largeFoil' | 'additionalLatex' | 'additionalFoil'

export type Customization = {
  id: CustomizationId
  name: string
  shortName: string
  description: string
  unitPrice: number
  unitLabel: string
}

const latex = (id: string, count: number, size: number): BundleComponent => ({ id, type: 'latex', name: 'Latex balloons', count, size })
const foil = (id: string, name: string, count: number, size: number): BundleComponent => ({ id, type: 'foil', name, count, size })

const defaultBundles: Bundle[] = [
  {
    id: 'classic-5', name: 'Classic 5', eyebrow: 'The everyday classic', description: '5 × 11” latex balloons + weighted base',
    components: [latex('classic-5-latex', 5, 11)], basePrice: 35, basePriceMode: 'fixed', includesBase: true, active: true,
  },
  {
    id: 'classic-10', name: 'Classic 10', eyebrow: 'More to celebrate', description: '10 × 11” latex balloons + weighted base',
    components: [latex('classic-10-latex', 10, 11)], basePrice: 65, basePriceMode: 'fixed', includesBase: true, active: true,
  },
  {
    id: 'statement-17', name: '17” Statement', eyebrow: 'Make it a moment', description: '4 × 17” latex balloons + weighted base',
    components: [latex('statement-17-latex', 4, 17)], basePrice: 70, basePriceMode: 'fixed', includesBase: true, active: true,
  },
  {
    id: 'foil-number-letter', name: 'Foil Number / Letter', eyebrow: 'A special statement', description: '1 × 40” foil number or letter + weighted base',
    components: [foil('foil-number-letter-main', 'Number / letter foil', 1, 40)], basePrice: 22, basePriceMode: 'perUnit', basePriceComponentId: 'foil-number-letter-main', includesBase: true, active: true,
  },
  {
    id: 'theme-number-foil', name: 'Theme Number Foil', eyebrow: 'Themed and joyful', description: 'Number foil + character foil + 5 × 11” latex',
    components: [foil('theme-number', 'Number foil', 1, 40), foil('theme-character', 'Character foil', 1, 18), latex('theme-latex', 5, 11)],
    basePrice: 60, basePriceMode: 'fixed', includesBase: true, active: true,
  },
]

const defaultCustomizations: Customization[] = [
  { id: 'smallFoil', name: 'Small foil', shortName: 'Small foil', description: 'Swaps with one latex balloon', unitPrice: 10, unitLabel: '+$10 each' },
  { id: 'largeFoil', name: 'Large foil', shortName: 'Large foil', description: 'Swaps with one latex balloon', unitPrice: 20, unitLabel: '+$20 each' },
  { id: 'additionalLatex', name: 'Additional latex', shortName: 'Extra latex', description: 'Adds to the bouquet count', unitPrice: 6, unitLabel: '+$6 each' },
  { id: 'additionalFoil', name: 'Additional foil', shortName: 'Extra foil', description: 'Adds a foil to the bouquet', unitPrice: 12, unitLabel: '+$12 each' },
]

export type PricingSettings = { bundles: Bundle[]; customizations: Customization[] }

export const defaultPricingSettings: PricingSettings = { bundles: defaultBundles, customizations: defaultCustomizations }
export const pricingStorageKey = 'mpc-helium-pricing-settings'

function normalizeBundle(bundle: Bundle & { latexSize?: number; latexCount?: number }): Bundle {
  if (Array.isArray(bundle.components)) return { ...bundle, basePriceMode: bundle.basePriceMode ?? 'fixed' }
  return { ...bundle, components: [latex(`${bundle.id}-latex`, bundle.latexCount ?? 0, bundle.latexSize ?? 11)], basePriceMode: bundle.basePriceMode ?? 'fixed' }
}

export function loadPricingSettings(): PricingSettings {
  if (typeof window === 'undefined') return clonePricingSettings(defaultPricingSettings)
  try {
    const stored = window.localStorage.getItem(pricingStorageKey)
    if (!stored) return clonePricingSettings(defaultPricingSettings)
    const parsed = JSON.parse(stored) as PricingSettings
    if (!Array.isArray(parsed.bundles) || !Array.isArray(parsed.customizations)) throw new Error('Invalid pricing settings')
    const savedBundles = parsed.bundles.map((bundle) => normalizeBundle(bundle as Bundle & { latexSize?: number; latexCount?: number }))
    const savedBundleIds = new Set(savedBundles.map((bundle) => bundle.id))
    return {
      bundles: [...savedBundles, ...defaultBundles.filter((bundle) => !savedBundleIds.has(bundle.id))],
      customizations: defaultCustomizations.map((item) => parsed.customizations.find((saved) => saved.id === item.id) ?? item),
    }
  } catch {
    return clonePricingSettings(defaultPricingSettings)
  }
}

export function savePricingSettings(settings: PricingSettings) { window.localStorage.setItem(pricingStorageKey, JSON.stringify(settings)) }
export function clonePricingSettings(settings: PricingSettings): PricingSettings { return JSON.parse(JSON.stringify(settings)) as PricingSettings }

export type Selections = Record<CustomizationId, number>
export const emptySelections: Selections = { smallFoil: 0, largeFoil: 0, additionalLatex: 0, additionalFoil: 0 }
export type CompositionItem = BundleComponent & { source: 'base' | 'customization' }

export function getMaxFoils(bundle: Bundle) {
  return bundle.components.filter((item) => item.type === 'latex').reduce((total, item) => total + item.count, 0)
}

export function getBundleBasePrice(bundle: Bundle) {
  if (bundle.basePriceMode !== 'perUnit') return bundle.basePrice
  const target = bundle.components.find((item) => item.id === bundle.basePriceComponentId) ?? bundle.components[0]
  return bundle.basePrice * (target?.count ?? 0)
}

export function calculatePrice(bundle: Bundle, selections: Selections, customizations: Customization[] = defaultCustomizations) {
  const prices = Object.fromEntries(customizations.map((item) => [item.id, item.unitPrice])) as Record<CustomizationId, number>
  const customizationNames = Object.fromEntries(customizations.map((item) => [item.id, item.name])) as Record<CustomizationId, string>
  const rawPrice = getBundleBasePrice(bundle) + selections.smallFoil * prices.smallFoil + selections.largeFoil * prices.largeFoil + selections.additionalLatex * prices.additionalLatex + selections.additionalFoil * prices.additionalFoil
  const finalPrice = Math.ceil(rawPrice / 5) * 5
  const composition: CompositionItem[] = bundle.components.map((item) => ({ ...item, source: 'base' }))
  let substitutionsRemaining = selections.smallFoil + selections.largeFoil
  for (const item of composition) {
    if (item.type !== 'latex' || substitutionsRemaining === 0) continue
    const substituted = Math.min(item.count, substitutionsRemaining)
    item.count -= substituted
    substitutionsRemaining -= substituted
  }
  if (selections.smallFoil > 0) composition.push({ id: 'custom-small-foil', type: 'foil', name: customizationNames.smallFoil, count: selections.smallFoil, size: 0, source: 'customization' })
  if (selections.largeFoil > 0) composition.push({ id: 'custom-large-foil', type: 'foil', name: customizationNames.largeFoil, count: selections.largeFoil, size: 0, source: 'customization' })
  if (selections.additionalLatex > 0) composition.push({ id: 'custom-additional-latex', type: 'latex', name: customizationNames.additionalLatex, count: selections.additionalLatex, size: 0, source: 'customization' })
  if (selections.additionalFoil > 0) composition.push({ id: 'custom-additional-foil', type: 'foil', name: customizationNames.additionalFoil, count: selections.additionalFoil, size: 0, source: 'customization' })
  return {
    rawPrice, finalPrice, roundingAdjustment: finalPrice - rawPrice,
    composition: composition.filter((item) => item.count > 0),
    latexCount: composition.filter((item) => item.type === 'latex').reduce((total, item) => total + item.count, 0),
    foilCount: composition.filter((item) => item.type === 'foil').reduce((total, item) => total + item.count, 0),
    totalCount: composition.reduce((total, item) => total + item.count, 0),
  }
}
