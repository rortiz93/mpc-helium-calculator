import { useMemo, useState } from 'react'
import { Check, Clipboard, Info, Sparkles } from 'lucide-react'
import { baseBundles, calculatePrice, customizations, emptySelections, getMaxFoils, type Selections } from './config/pricing'
import { QuantityControl } from './components/calculator/QuantityControl'

const logoSrc = 'https://images.squarespace-cdn.com/content/v1/65143510f9985b2f4c1cb9ae/29161b60-2754-46e7-8db6-069e08ad582a/Meg+O.png?format=1500w'

function money(value: number) { return `$${value}` }

export default function App() {
  const [selectedId, setSelectedId] = useState(baseBundles[0].id)
  const [selections, setSelections] = useState<Selections>(emptySelections)
  const [copied, setCopied] = useState(false)
  const bundle = baseBundles.find((item) => item.id === selectedId) ?? baseBundles[0]
  const result = useMemo(() => calculatePrice(bundle, selections), [bundle, selections])
  const foilCount = selections.smallFoil + selections.largeFoil

  function chooseBundle(id: string) {
    setSelectedId(id)
    setSelections(emptySelections)
  }

  function change(id: keyof Selections, delta: number) {
    setSelections((current) => {
      const next = Math.max(0, current[id] + delta)
      if ((id === 'smallFoil' || id === 'largeFoil') && foilCount + delta > getMaxFoils(bundle)) return current
      return { ...current, [id]: next }
    })
  }

  async function copyQuote() {
    const quoteItems = [
      result.latexCount > 0 ? `${result.latexCount} latex` : '',
      selections.smallFoil > 0 ? `${selections.smallFoil} small foil` : '',
      selections.largeFoil > 0 ? `${selections.largeFoil} large foil` : '',
    ].filter(Boolean)
    const quote = `${bundle.name}: ${quoteItems.join(', ')}. Total: ${money(result.finalPrice)}.`
    try { await navigator.clipboard.writeText(quote) } catch { /* clipboard is optional in preview */ }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="app-shell">
      <div className="top-strip"><span>MEG’S PARTY CO.</span><span>INTERNAL QUOTE TOOL</span></div>
      <header className="site-header">
        <a className="brand-lockup" href="https://www.megspartyco.com" aria-label="Meg’s Party Co. website">
          <img src={logoSrc} alt="Meg’s Party Co." />
        </a>
        <div className="header-note"><span className="status-dot" /> Ready to party</div>
      </header>

      <main className="page-content">
        <section className="hero">
          <div className="hero-kicker"><span className="squiggle">〰</span> HELIUM BOUQUETS</div>
          <h1>Let’s make it<br /><em>float.</em></h1>
          <div className="hero-sticker" aria-hidden="true"><Sparkles size={17} /><span>party<br />starts here</span></div>
          <p className="hero-copy">Build a beautiful helium bouquet in three easy steps. Pick a starting point, make it yours, and send the quote.</p>
        </section>

        <div className="calculator-grid">
          <div className="calculator-flow">
            <section className="flow-section">
              <div className="section-heading"><span className="step-number">01</span><div><p className="section-kicker">Start with a bundle</p><h2>Choose your base</h2></div></div>
              <div className="bundle-grid">
                {baseBundles.filter((item) => item.active).map((item) => {
                  const selected = item.id === selectedId
                  return <button key={item.id} type="button" className={`bundle-card ${selected ? 'selected' : ''}`} onClick={() => chooseBundle(item.id)} aria-pressed={selected}>
                    <div className="bundle-card-top"><span className="bundle-eyebrow">{item.eyebrow}</span>{selected && <span className="selected-mark"><Check size={13} /></span>}</div>
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                    <div className="bundle-price"><span>from</span> {money(item.basePrice)}</div>
                  </button>
                })}
              </div>
            </section>

            <section className="flow-section customize-section">
              <div className="section-heading"><span className="step-number">02</span><div><p className="section-kicker">Make it yours</p><h2>Add a little extra</h2></div></div>
              <div className="custom-card">
                {customizations.map((item) => <QuantityControl key={item.id} label={item.name} value={selections[item.id]} price={item.unitLabel} description={item.description} onDecrease={() => change(item.id, -1)} onIncrease={() => change(item.id, 1)} increaseDisabled={(item.id === 'smallFoil' || item.id === 'largeFoil') && foilCount >= getMaxFoils(bundle)} />)}
                {foilCount >= getMaxFoils(bundle) && <div className="limit-note"><Info size={15} /> All of this bundle’s latex spots are filled — add extra latex to grow the bouquet.</div>}
              </div>
            </section>
          </div>

          <aside className="summary-panel" aria-label="Pricing summary">
            <div className="summary-label"><span className="step-number">03</span><span>Your bouquet</span></div>
            <div className="summary-topline"><span>{bundle.name}</span><span className="balloon-count">{result.totalCount} balloons</span></div>
            <div className="composition" aria-label="Bouquet composition">
              <span className="composition-balloon latex" />
              <span className="composition-balloon small" />
              <span className="composition-balloon large" />
              <div><strong>{result.latexCount} latex</strong><br /><span>{selections.smallFoil} small foil · {selections.largeFoil} large foil</span></div>
            </div>
            <div className="price-breakdown">
              <div><span>{bundle.name}</span><strong>{money(bundle.basePrice)}</strong></div>
              {selections.smallFoil > 0 && <div><span>{selections.smallFoil} × small foil</span><strong>+{money(selections.smallFoil * 10)}</strong></div>}
              {selections.largeFoil > 0 && <div><span>{selections.largeFoil} × large foil</span><strong>+{money(selections.largeFoil * 20)}</strong></div>}
              {selections.additionalLatex > 0 && <div><span>{selections.additionalLatex} × additional latex</span><strong>+{money(selections.additionalLatex * 6)}</strong></div>}
              <div className="breakdown-rule" />
              <div className="raw-total"><span>Calculated price</span><strong>{money(result.rawPrice)}</strong></div>
              {result.roundingAdjustment > 0 && <div className="rounding-row"><span>Pricing round-up</span><strong>+{money(result.roundingAdjustment)}</strong></div>}
            </div>
            <div className="final-price"><span>Final price</span><strong>{money(result.finalPrice)}</strong></div>
            <button type="button" className="quote-button" onClick={copyQuote}><Clipboard size={17} /> {copied ? 'Quote copied!' : 'Copy quote'}</button>
            <p className="summary-footnote">Base bundle includes a matching balloon base and weight.</p>
          </aside>
        </div>
      </main>
      <footer className="site-footer"><span>Meg’s Party Co.</span><span>Turning life’s moments into unforgettable celebrations.</span></footer>
    </div>
  )
}
