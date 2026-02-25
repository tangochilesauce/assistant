'use client'

import { useInventoryStore } from '@/store/inventory-store'
import { StepperInput } from './stepper-input'
import { SaveInput } from './save-input'

export function PackagingInventory() {
  const { materials, setMaterialNote, setMaterialQuantity } = useInventoryStore()

  const packagingItems = materials.map((mat, idx) => ({ mat, idx }))

  return (
    <div className="border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Packaging</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
              <th className="pb-2 pr-4">Item</th>
              <th className="pb-2 px-4">Qty</th>
              <th className="pb-2 px-4">Note</th>
            </tr>
          </thead>
          <tbody>
            {packagingItems.map(({ mat, idx }) => (
              <tr key={`${mat.item}-${idx}`} className="border-t border-border/50">
                <td className="py-1.5 pr-4 font-medium whitespace-nowrap">{mat.item}</td>
                <td className="py-1.5 px-4">
                  <StepperInput
                    value={mat.quantity ?? 0}
                    step={1}
                    onSave={v => setMaterialQuantity(idx, v === 0 ? null : v)}
                  />
                </td>
                <td className="py-1.5 px-4">
                  <SaveInput
                    type="text"
                    value={mat.note}
                    onSave={v => setMaterialNote(idx, v)}
                    placeholder="—"
                    className="w-full bg-transparent text-sm border-none focus:outline-none focus:ring-0 placeholder:text-muted-foreground/20"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
