'use client'

import { useInventoryStore } from '@/store/inventory-store'
import { INGREDIENT_KEYS, UNITS } from '@/data/tango-constants'
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
              <th className="pb-2 px-2 w-20 text-center">Qty</th>
              <th className="pb-2 px-2 w-24">Format</th>
              <th className="pb-2 px-2">Note</th>
            </tr>
          </thead>
          <tbody>
            {INGREDIENT_KEYS.map(key => {
              const u = UNITS[key]
              if (!u) return null
              const inv = ingredients[key] || { onHand: 0, unit: u.unit, lastUpdated: '', note: '' }

              // Commodified display: convert raw amount to packages
              const pkgs = inv.onHand > 0 ? inv.onHand / u.pkg : 0
              const pkgsDisplay = pkgs > 0
                ? (pkgs % 1 === 0 ? `${pkgs}` : pkgs.toFixed(1)) + ` ${u.label}${pkgs !== 1 ? 's' : ''}`
                : ''

              return (
                <tr key={key} className="border-t border-border/50">
                  <td className="py-1.5 pr-4 font-medium capitalize">{u.name}</td>
                  <td className="py-1.5 px-2 text-center">
                    <SaveInput
                      type="number"
                      min={0}
                      step="any"
                      inputMode="decimal"
                      value={inv.onHand || ''}
                      onSave={v => setIngredient(key, parseFloat(v) || 0)}
                      placeholder="0"
                      className="w-16 text-center tabular-nums bg-transparent border border-border/50 rounded px-1.5 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-foreground/20"
                    />
                    <span className="text-[10px] text-muted-foreground/50 ml-1">{u.unit}</span>
                  </td>
                  <td className="py-1.5 px-2 text-xs text-muted-foreground tabular-nums">
                    {pkgsDisplay || <span className="text-muted-foreground/20">&mdash;</span>}
                  </td>
                  <td className="py-1.5 px-2">
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
