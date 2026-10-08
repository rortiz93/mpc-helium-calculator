import { Minus, Plus } from 'lucide-react'

type Props = {
  label: string
  value: number
  price: string
  description: string
  onDecrease: () => void
  onIncrease: () => void
  increaseDisabled?: boolean
}

export function QuantityControl({ label, value, price, description, onDecrease, onIncrease, increaseDisabled }: Props) {
  return (
    <div className="custom-row">
      <div>
        <div className="custom-label-row">
          <span className="custom-label">{label}</span>
          <span className="custom-price">{price}</span>
        </div>
        <p>{description}</p>
      </div>
      <div className="quantity-control" aria-label={`${label} quantity`}>
        <button type="button" onClick={onDecrease} disabled={value === 0} aria-label={`Remove ${label}`}><Minus size={16} strokeWidth={2.5} /></button>
        <span aria-live="polite">{value}</span>
        <button type="button" onClick={onIncrease} disabled={increaseDisabled} aria-label={`Add ${label}`}><Plus size={16} strokeWidth={2.5} /></button>
      </div>
    </div>
  )
}
