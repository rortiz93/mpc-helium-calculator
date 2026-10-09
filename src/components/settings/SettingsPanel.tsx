import { useState } from 'react'
import { Plus, RotateCcw, Save, Trash2, X } from 'lucide-react'
import { clonePricingSettings, defaultPricingSettings, type Bundle, type BundleComponent, type Customization, type PricingSettings } from '../../config/pricing'

type Props = {
  settings: PricingSettings
  onClose: () => void
  onSave: (settings: PricingSettings) => void
}

const emptyBundle: Bundle = {
  id: '',
  name: '',
  eyebrow: 'New bundle',
  description: '',
  components: [{ id: 'new-bundle-latex', type: 'latex', name: 'Latex balloons', count: 5, size: 11 }],
  basePrice: 35,
  includesBase: true,
  active: true,
}

function numberValue(value: string, fallback: number) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? Math.max(0, parsed) : fallback
}

export function SettingsPanel({ settings, onClose, onSave }: Props) {
  const [draft, setDraft] = useState<PricingSettings>(() => clonePricingSettings(settings))

  function updateCustomization(id: Customization['id'], field: keyof Customization, value: string) {
    setDraft((current) => ({
      ...current,
      customizations: current.customizations.map((item) => item.id !== id ? item : {
        ...item,
        [field]: field === 'unitPrice' ? numberValue(value, item.unitPrice) : value,
        ...(field === 'unitPrice' ? { unitLabel: `+$${numberValue(value, item.unitPrice)} each` } : {}),
      }),
    }))
  }

  function updateBundle(id: string, field: keyof Bundle, value: string | boolean) {
    setDraft((current) => ({
      ...current,
      bundles: current.bundles.map((item) => item.id !== id ? item : {
        ...item,
        [field]: typeof value === 'boolean' ? value : field === 'basePrice' ? numberValue(value, item.basePrice) : value,
      }),
    }))
  }

  function updateComponent(bundleId: string, componentId: string, field: keyof BundleComponent, value: string) {
    setDraft((current) => ({
      ...current,
      bundles: current.bundles.map((bundle) => bundle.id !== bundleId ? bundle : {
        ...bundle,
        components: bundle.components.map((component) => component.id !== componentId ? component : {
          ...component,
          [field]: field === 'count' || field === 'size' ? numberValue(value, component[field]) : value,
        }),
      }),
    }))
  }

  function addComponent(bundleId: string) {
    const component: BundleComponent = { id: `component-${Date.now()}`, type: 'latex', name: 'Latex balloons', count: 1, size: 11 }
    setDraft((current) => ({
      ...current,
      bundles: current.bundles.map((bundle) => bundle.id !== bundleId ? bundle : { ...bundle, components: [...bundle.components, component] }),
    }))
  }

  function removeComponent(bundleId: string, componentId: string) {
    setDraft((current) => ({
      ...current,
      bundles: current.bundles.map((bundle) => bundle.id !== bundleId ? bundle : {
        ...bundle,
        components: bundle.components.length <= 1 ? bundle.components : bundle.components.filter((component) => component.id !== componentId),
      }),
    }))
  }

  function addBundle() {
    const id = `custom-${Date.now()}`
    setDraft((current) => ({ ...current, bundles: [...current.bundles, { ...emptyBundle, id }] }))
  }

  function removeBundle(id: string) {
    if (draft.bundles.length <= 1) return
    setDraft((current) => ({ ...current, bundles: current.bundles.filter((item) => item.id !== id) }))
  }

  function resetDefaults() {
    if (window.confirm('Reset all pricing and bundles to the original MPC defaults?')) setDraft(clonePricingSettings(defaultPricingSettings))
  }

  return (
    <div className="settings-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <aside className="settings-drawer" role="dialog" aria-modal="true" aria-labelledby="settings-title">
        <div className="settings-header">
          <div><p className="section-kicker">Calculator controls</p><h2 id="settings-title">Settings</h2></div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close settings"><X size={20} /></button>
        </div>
        <p className="settings-intro">Update the pricing ingredients and bouquet catalog used by the quoting tool. Changes are stored in this browser only.</p>

        <section className="settings-section">
          <div className="settings-section-heading"><div><p className="section-kicker">Pricing ingredients</p><h3>Customizations</h3></div><span className="settings-count">{draft.customizations.length} items</span></div>
          <div className="settings-list">
            {draft.customizations.map((item) => <div className="settings-item" key={item.id}>
              <div className="settings-item-title"><span className="settings-swatch" />{item.name}</div>
              <label>Display name<input value={item.name} onChange={(event) => updateCustomization(item.id, 'name', event.target.value)} /></label>
              <label>Description<input value={item.description} onChange={(event) => updateCustomization(item.id, 'description', event.target.value)} /></label>
              <label>Unit price<input type="number" min="0" step="1" value={item.unitPrice} onChange={(event) => updateCustomization(item.id, 'unitPrice', event.target.value)} /></label>
            </div>)}
          </div>
        </section>

        <section className="settings-section">
          <div className="settings-section-heading"><div><p className="section-kicker">Base catalog</p><h3>Bundles & packages</h3></div><button type="button" className="small-action" onClick={addBundle}><Plus size={15} /> Add bundle</button></div>
          <div className="settings-list">
            {draft.bundles.map((item) => <div className="bundle-settings-card" key={item.id}>
              <div className="bundle-settings-top"><span className="settings-bundle-id">{item.id.startsWith('custom-') ? 'Custom bundle' : 'MPC default'}</span><button type="button" className="delete-button" onClick={() => removeBundle(item.id)} disabled={draft.bundles.length <= 1} aria-label={`Delete ${item.name || 'bundle'}`}><Trash2 size={16} /></button></div>
              <div className="settings-form-grid">
                <label>Bundle name<input value={item.name} onChange={(event) => updateBundle(item.id, 'name', event.target.value)} placeholder="e.g. Birthday sparkle" /></label>
                <label>Eyebrow<input value={item.eyebrow} onChange={(event) => updateBundle(item.id, 'eyebrow', event.target.value)} placeholder="e.g. A little extra joy" /></label>
                <label className="wide-field">Description<input value={item.description} onChange={(event) => updateBundle(item.id, 'description', event.target.value)} placeholder={'e.g. 6 × 11” latex balloons + weighted base'} /></label>
                <label>Base price<input type="number" min="0" step="1" value={item.basePrice} onChange={(event) => updateBundle(item.id, 'basePrice', event.target.value)} /></label>
              </div>
              <div className="settings-components">
                <div className="components-heading"><span>Base composition</span><button type="button" className="component-add" onClick={() => addComponent(item.id)}><Plus size={13} /> Add component</button></div>
                {item.components.map((component) => <div className="component-row" key={component.id}>
                  <select value={component.type} onChange={(event) => updateComponent(item.id, component.id, 'type', event.target.value)} aria-label="Component type"><option value="latex">Latex</option><option value="foil">Foil</option></select>
                  <input value={component.name} onChange={(event) => updateComponent(item.id, component.id, 'name', event.target.value)} aria-label="Component name" placeholder="e.g. Character foil" />
                  <input type="number" min="0" step="1" value={component.count} onChange={(event) => updateComponent(item.id, component.id, 'count', event.target.value)} aria-label="Component quantity" />
                  <input type="number" min="0" step="1" value={component.size} onChange={(event) => updateComponent(item.id, component.id, 'size', event.target.value)} aria-label="Component size" />
                  <button type="button" className="delete-button" onClick={() => removeComponent(item.id, component.id)} disabled={item.components.length <= 1} aria-label={`Delete ${component.name}`}><Trash2 size={15} /></button>
                </div>)}
                <p className="component-help">Included components are covered by the base bundle price. Sizes are descriptive and do not change the base price.</p>
              </div>
              <div className="settings-toggles"><label className="toggle-label"><input type="checkbox" checked={item.includesBase} onChange={(event) => updateBundle(item.id, 'includesBase', event.target.checked)} /> Includes weighted base</label><label className="toggle-label"><input type="checkbox" checked={item.active} onChange={(event) => updateBundle(item.id, 'active', event.target.checked)} /> Show in calculator</label></div>
            </div>)}
          </div>
        </section>

        <div className="settings-footer"><button type="button" className="reset-button" onClick={resetDefaults}><RotateCcw size={15} /> Reset defaults</button><button type="button" className="save-button" onClick={() => onSave(draft)}><Save size={16} /> Save changes</button></div>
      </aside>
    </div>
  )
}
