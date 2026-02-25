'use client'

import { useInventoryStore } from '@/store/inventory-store'
import { INGREDIENT_KEYS, UNITS } from '@/data/tango-constants'

export function IngredientInventory() {
  const { ingredients, setIngredient } = useInventoryStore()

  return (
    <div className="border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Ingredients (Fridge)</h3>
        <span className="text-[10px] text-muted-foreground/50">Update before generating Deep Order</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
              <th className="pb-2 pr-4">Ingredient</th>
              <th className="pb-2 text-right px-2 w-28">On Hand</th>
              <th className="pb-2 text-right px-2 w-16">Unit</th>
              <th className="pb-2 px-2">Note</th>
            </tr>
          </thead>
          <tbody>
            {INGREDIENT_KEYS.map(key => {
              const u = UNITS[key]
              if (!u) return null
              const inv = ingredients[key] || { onHand: 0, unit: u.unit, lastUpdated: '', note: '' }
              return (
                <tr key={key} className="border-t border-border/50">
                  <td className="py-1.5 pr-4 font-medium capitalize">{u.name}</td>
                  <td className="py-1.5 text-right px-2">
                    <input
                      type="number"
                      min={0}
                      step="any"
                      value={inv.onHand || ''}
                      onChange={e => setIngredient(key, parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="w-20 text-right tabular-nums bg-transparent border border-border/50 rounded px-1.5 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-foreground/20"
                    />
                  </td>
                  <td className="py-1.5 text-right px-2 text-muted-foreground text-xs">{u.unit}</td>
                  <td className="py-1.5 px-2">
                    <input
                      type="text"
                      value={inv.note || ''}
                      onChange={e => setIngredient(key, inv.onHand, e.target.value)}
                      placeholder="&mdash;"
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
