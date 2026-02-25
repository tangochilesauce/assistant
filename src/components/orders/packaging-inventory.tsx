'use client'

import { useInventoryStore } from '@/store/inventory-store'
import { FLAVORS, FLAVOR_COLORS, MATERIAL_STATUSES, STATUS_COLORS, type MaterialStatus } from '@/data/tango-constants'

export function PackagingInventory() {
  const { materials, cycleMaterialStatus, setMaterialNote, setMaterialQuantity } = useInventoryStore()

  const flavorDot = (f: string) => (
    <span className="inline-block w-2 h-2 rounded-full mr-1.5 relative top-[-1px]" style={{ background: FLAVOR_COLORS[f] || '#999' }} />
  )

  return (
    <div className="border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Packaging</h3>
        <span className="text-[10px] text-muted-foreground/50">Tap status to cycle</span>
      </div>

      {/* Generic materials */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
              <th className="pb-2 pr-4">Item</th>
              <th className="pb-2 px-2 w-20">Status</th>
              <th className="pb-2 px-2 w-16">Qty</th>
              <th className="pb-2 px-2">Note</th>
            </tr>
          </thead>
          <tbody>
            {materials.map((mat, idx) => {
              if (mat.item.startsWith('Caps —') || mat.item.startsWith('Labels —')) return null
              return (
                <tr key={mat.item} className="border-t border-border/50">
                  <td className="py-1.5 pr-4 font-medium">{mat.item}</td>
                  <td className="py-1.5 px-2">
                    <button
                      onClick={() => cycleMaterialStatus(idx)}
                      className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full cursor-pointer select-none active:scale-95 transition-transform ${
                        STATUS_COLORS[mat.status as MaterialStatus] || STATUS_COLORS.Have
                      }`}
                    >
                      {mat.status}
                    </button>
                  </td>
                  <td className="py-1.5 px-2">
                    <input
                      type="number"
                      min={0}
                      value={mat.quantity ?? ''}
                      onChange={e => {
                        const v = parseInt(e.target.value)
                        setMaterialQuantity(idx, isNaN(v) ? null : v)
                      }}
                      placeholder="—"
                      className="w-14 text-right tabular-nums bg-transparent border border-border/50 rounded px-1 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-foreground/20"
                    />
                  </td>
                  <td className="py-1.5 px-2">
                    <input
                      type="text"
                      value={mat.note}
                      onChange={e => setMaterialNote(idx, e.target.value)}
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

      {/* Caps & Labels — flavor grid */}
      <div className="overflow-x-auto mt-4 pt-4 border-t border-border/50">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
              <th className="pb-2 pr-4"></th>
              {FLAVORS.map(f => (
                <th key={f} className="pb-2 text-center px-1 min-w-[60px]">{flavorDot(f)}{f}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(['Caps', 'Labels'] as const).map(category => (
              <tr key={category} className="border-t border-border/50">
                <td className="py-2 pr-4 font-medium">{category}</td>
                {FLAVORS.map(f => {
                  const matName = `${category} — ${f}`
                  const idx = materials.findIndex(m => m.item === matName)
                  if (idx === -1) return <td key={f} className="py-2 text-center px-1"><span className="text-muted-foreground/20">&mdash;</span></td>
                  const mat = materials[idx]
                  return (
                    <td key={f} className="py-2 text-center px-1">
                      <button
                        onClick={() => cycleMaterialStatus(idx)}
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full cursor-pointer select-none active:scale-95 transition-transform ${
                          STATUS_COLORS[mat.status as MaterialStatus] || STATUS_COLORS.Have
                        }`}
                      >
                        {mat.status}
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
