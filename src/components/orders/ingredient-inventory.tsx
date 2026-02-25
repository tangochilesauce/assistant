'use client'

import { useInventoryStore } from '@/store/inventory-store'
import { INGREDIENT_KEYS, UNITS } from '@/data/tango-constants'
import { StepperInput } from './stepper-input'
import { SaveInput } from './save-input'

export function IngredientInventory() {
  const { ingredients, setIngredient } = useInventoryStore()

  return (
    <div className="border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Ingredients (Fridge)</h3>
        <span className="text-[10px] text-muted-foreground/50">Subtracted from Deep Order</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
              <th className="pb-2 pr-4">Ingredient</th>
              <th className="pb-2 px-4 text-center">On Hand</th>
              <th className="pb-2 px-4 whitespace-nowrap">Format</th>
              <th className="pb-2 px-4">Note</th>
            </tr>
          </thead>
          <tbody>
            {INGREDIENT_KEYS.map(key => {
              const u = UNITS[key]
              if (!u) return null
              const inv = ingredients[key] || { onHand: 0, unit: u.unit, lastUpdated: '', note: '' }

              // Display in purchase units (bags, gallons, boxes)
              const pkgs = inv.onHand > 0 ? inv.onHand / u.pkg : 0
              const step = u.unit === 'gal' ? 0.5 : 1

              return (
                <tr key={key} className="border-t border-border/50">
                  <td className="py-1.5 pr-4 font-medium capitalize">{u.name}</td>
                  <td className="py-1.5 px-4 text-center">
                    <StepperInput
                      value={pkgs}
                      step={step}
                      onSave={v => {
                        setIngredient(key, v * u.pkg)
                      }}
                    />
                  </td>
                  <td className="py-1.5 px-4 text-xs text-muted-foreground whitespace-nowrap">
                    {u.label}
                    {inv.onHand > 0 && u.pkg > 1 && (
                      <span className="text-muted-foreground/40 ml-1">({inv.onHand}{u.unit})</span>
                    )}
                  </td>
                  <td className="py-1.5 px-4">
                    <SaveInput
                      type="text"
                      value={inv.note || ''}
                      onSave={v => setIngredient(key, inv.onHand, v)}
                      placeholder="—"
                      className="w-full bg-transparent text-sm border-none focus:outline-none focus:ring-0 placeholder:text-muted-foreground/20"
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
