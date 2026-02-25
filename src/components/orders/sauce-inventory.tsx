'use client'

import { useInventoryStore } from '@/store/inventory-store'
import { FLAVORS, DRUM_BOTTLES, FLAVOR_COLORS } from '@/data/tango-constants'

export function SauceInventory() {
  const { packed, drums, setPacked, setDrums } = useInventoryStore()

  const inventory = FLAVORS.map(f => {
    const p = packed[f] || 0
    const d = drums[f] || 0
    const dw = Math.round(d * DRUM_BOTTLES)
    return { flavor: f, packed: p, drums: d, drumBottles: dw, total: p + dw }
  })

  const totalBottles = inventory.reduce((s, i) => s + i.total, 0)

  const flavorDot = (f: string) => (
    <span className="inline-block w-2 h-2 rounded-full mr-1.5 relative top-[-1px]" style={{ background: FLAVOR_COLORS[f] || '#999' }} />
  )

  return (
    <div className="border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Sauce</h3>
        <span className="text-[10px] text-muted-foreground/50 tabular-nums">{totalBottles.toLocaleString()} bottles total</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
              <th className="pb-2 pr-4"></th>
              {FLAVORS.map(f => (
                <th key={f} className="pb-2 text-right px-2 min-w-[52px]">{flavorDot(f)}{f}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Packed Bottles */}
            <tr className="border-t border-border/50">
              <td className="py-1.5 pr-4 font-medium">Packed Bottles</td>
              {FLAVORS.map(f => (
                <td key={f} className="py-1.5 text-right px-2">
                  <input
                    type="number" min={0} step="1"
                    value={packed[f] || 0}
                    onChange={e => setPacked(f, parseInt(e.target.value) || 0)}
                    onBlur={e => setPacked(f, parseInt(e.target.value) || 0)}
                    className="w-14 text-right tabular-nums bg-transparent border border-border/50 rounded px-1.5 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-foreground/20"
                  />
                </td>
              ))}
            </tr>
            {/* Cases derived */}
            <tr className="border-t border-border/30 text-muted-foreground text-xs">
              <td className="py-1 pr-4">&rarr; {Math.floor((packed[FLAVORS[0]] || 0) / 6) !== (packed[FLAVORS[0]] || 0) / 6 ? '' : ''}Cases</td>
              {FLAVORS.map(f => {
                const cases = (packed[f] || 0) / 6
                return (
                  <td key={f} className="py-1 text-right tabular-nums px-2">
                    {cases === 0 ? <span className="text-muted-foreground/20">&mdash;</span> : cases % 1 === 0 ? cases : cases.toFixed(1)}
                  </td>
                )
              })}
            </tr>

            {/* Botes / Drums (decimal) */}
            <tr className="border-t border-border/50">
              <td className="py-1.5 pr-4 font-medium">Botes (drums)</td>
              {FLAVORS.map(f => (
                <td key={f} className="py-1.5 text-right px-2">
                  <input
                    type="number" min={0} step="0.1"
                    value={drums[f] || 0}
                    onChange={e => setDrums(f, parseFloat(e.target.value) || 0)}
                    onBlur={e => setDrums(f, parseFloat(e.target.value) || 0)}
                    className="w-14 text-right tabular-nums bg-transparent border border-border/50 rounded px-1.5 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-foreground/20"
                  />
                </td>
              ))}
            </tr>
            {/* Bottles from drums */}
            <tr className="border-t border-border/30 text-muted-foreground text-xs">
              <td className="py-1 pr-4">&rarr; Bottles</td>
              {inventory.map(inv => (
                <td key={inv.flavor} className="py-1 text-right tabular-nums px-2">
                  {inv.drumBottles === 0 ? <span className="text-muted-foreground/20">&mdash;</span> : inv.drumBottles.toLocaleString()}
                </td>
              ))}
            </tr>

            {/* Total */}
            <tr className="border-t border-border font-semibold">
              <td className="pt-2 pr-4">Total</td>
              {inventory.map(inv => (
                <td key={inv.flavor} className="pt-2 text-right tabular-nums px-2 font-semibold">
                  {inv.total === 0 ? <span className="text-muted-foreground/20">&mdash;</span> : inv.total.toLocaleString()}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
