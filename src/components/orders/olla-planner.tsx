'use client'

import { useCookPlanStore } from '@/store/cook-plan-store'
import { useCookCalculations } from '@/hooks/use-cook-calculations'
import { FLAVORS, FLAVOR_COLORS, OLLA_YIELDS } from '@/data/tango-constants'

export function OllaPlanner() {
  const { ollas, setOllas, autoPlan } = useCookPlanStore()
  const { demandTotals, inventory, gaps, cookCalc } = useCookCalculations()

  const numCell = (val: number, opts?: { color?: 'auto'; bold?: boolean; dash?: boolean }) => {
    if (opts?.dash && val === 0) return <span className="text-muted-foreground/20">&mdash;</span>
    let cls = 'tabular-nums'
    if (opts?.bold) cls += ' font-semibold'
    if (opts?.color === 'auto') cls += val < 0 ? ' text-red-500' : ' text-green-600'
    return <span className={cls}>{val >= 0 && opts?.color === 'auto' ? '+' : ''}{val.toLocaleString()}</span>
  }

  const flavorDot = (f: string) => (
    <span className="inline-block w-2 h-2 rounded-full mr-1.5 relative top-[-1px]" style={{ background: FLAVOR_COLORS[f] || '#999' }} />
  )

  return (
    <div className="border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Cook Planner
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-muted-foreground/50 tabular-nums">
            {cookCalc.totalOllas > 0
              ? `${cookCalc.totalOllas} olla${cookCalc.totalOllas > 1 ? 's' : ''} planned`
              : 'Set ollas below'
            }
          </span>
          <button
            onClick={() => autoPlan(gaps)}
            className="text-[10px] font-medium uppercase tracking-wider px-3 py-1 rounded-full border border-foreground/20 hover:bg-foreground hover:text-background transition-colors"
          >
            Auto-Plan
          </button>
        </div>
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
            <tr className="border-t border-border/50">
              <td className="py-1.5 pr-4 font-medium">Ollas to Cook</td>
              {FLAVORS.map(f => (
                <td key={f} className="py-1.5 text-right px-2">
                  <input
                    type="number" min={0} max={9}
                    value={ollas[f] || 0}
                    onChange={e => setOllas(f, parseInt(e.target.value) || 0)}
                    className="w-12 text-right tabular-nums bg-transparent border border-border/50 rounded px-1.5 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-foreground/20"
                  />
                </td>
              ))}
            </tr>
            <tr className="border-t border-border/50 text-muted-foreground text-xs">
              <td className="py-1 pr-4">&rarr; Yield/olla</td>
              {FLAVORS.map(f => (
                <td key={f} className="py-1 text-right tabular-nums px-2 text-muted-foreground/40">
                  {OLLA_YIELDS[f]}
                </td>
              ))}
            </tr>
            <tr className="border-t border-border/50">
              <td className="py-1.5 pr-4 font-medium">Bottles Produced</td>
              {FLAVORS.map(f => (
                <td key={f} className="py-1.5 text-right tabular-nums px-2">
                  {numCell(cookCalc.produced[f], { dash: true })}
                </td>
              ))}
            </tr>
            <tr className="border-t border-border/50">
              <td className="py-1.5 pr-4 font-medium">Post-Cook Total</td>
              {FLAVORS.map(f => (
                <td key={f} className="py-1.5 text-right tabular-nums px-2">
                  {numCell(cookCalc.postCook[f], { dash: true })}
                </td>
              ))}
            </tr>
            <tr className="border-t border-border font-semibold">
              <td className="pt-2 pr-4">Surplus After Orders</td>
              {FLAVORS.map(f => {
                const s = cookCalc.surplus[f]
                if (cookCalc.produced[f] === 0 && (demandTotals[f] || 0) === 0 && (inventory[f]?.total || 0) === 0) {
                  return (
                    <td key={f} className="pt-2 text-right tabular-nums px-2">
                      <span className="text-muted-foreground/20">&mdash;</span>
                    </td>
                  )
                }
                return (
                  <td key={f} className="pt-2 text-right tabular-nums px-2">
                    {numCell(s, { color: 'auto', bold: true })}
                  </td>
                )
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
