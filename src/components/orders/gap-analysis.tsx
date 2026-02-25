'use client'

import { useCookCalculations } from '@/hooks/use-cook-calculations'
import { FLAVORS, FLAVOR_COLORS } from '@/data/tango-constants'

export function GapAnalysis() {
  const { demandTotals, inventory, gaps, totalGap } = useCookCalculations()

  const numCell = (val: number, opts?: { color?: 'green' | 'red' | 'auto'; bold?: boolean; dash?: boolean }) => {
    if (opts?.dash && val === 0) return <span className="text-muted-foreground/20">&mdash;</span>
    let cls = 'tabular-nums'
    if (opts?.bold) cls += ' font-semibold'
    if (opts?.color === 'green') cls += ' text-green-600'
    if (opts?.color === 'red') cls += ' text-red-500'
    if (opts?.color === 'auto') cls += val < 0 ? ' text-red-500' : ' text-green-600'
    return <span className={cls}>{val >= 0 && opts?.color === 'auto' ? '+' : ''}{val.toLocaleString()}</span>
  }

  const flavorDot = (f: string) => (
    <span className="inline-block w-2 h-2 rounded-full mr-1.5 relative top-[-1px]" style={{ background: FLAVOR_COLORS[f] || '#999' }} />
  )

  return (
    <div className="border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Gap Analysis</h3>
        <span className="text-[10px] text-muted-foreground/50 tabular-nums">
          {totalGap > 0 ? `${totalGap.toLocaleString()} bottles short` : 'Fully stocked'}
        </span>
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
              <td className="py-1.5 pr-4 font-medium">Order Demand</td>
              {FLAVORS.map(f => (
                <td key={f} className="py-1.5 text-right tabular-nums px-2">
                  {numCell(demandTotals[f] || 0, { dash: true })}
                </td>
              ))}
            </tr>
            <tr className="border-t border-border/50">
              <td className="py-1.5 pr-4 font-medium">Have (total)</td>
              {FLAVORS.map(f => (
                <td key={f} className="py-1.5 text-right tabular-nums px-2">
                  {numCell(inventory[f]?.total || 0, { dash: true, color: (inventory[f]?.total || 0) > 0 ? 'green' : undefined })}
                </td>
              ))}
            </tr>
            <tr className="border-t border-border font-semibold">
              <td className="pt-2 pr-4">Gap</td>
              {FLAVORS.map(f => {
                const gap = gaps[f]
                if ((demandTotals[f] || 0) === 0 && (inventory[f]?.total || 0) === 0) {
                  return (
                    <td key={f} className="pt-2 text-right tabular-nums px-2">
                      <span className="text-muted-foreground/20">&mdash;</span>
                    </td>
                  )
                }
                return (
                  <td key={f} className="pt-2 text-right tabular-nums px-2">
                    {numCell(gap <= 0 ? Math.abs(gap) : -gap, { color: 'auto', bold: true })}
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
