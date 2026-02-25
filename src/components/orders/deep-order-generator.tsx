'use client'

import { useState, useCallback, useMemo } from 'react'
import { useCookCalculations } from '@/hooks/use-cook-calculations'
import { DELIVERY_FEE } from '@/data/tango-constants'

export function DeepOrderGenerator() {
  const { ingredientRows, tightSpots } = useCookCalculations()
  const [copied, setCopied] = useState(false)

  const copyText = useMemo(() => {
    return ingredientRows.rows.map(r => {
      if (r.unit === 'gal') {
        return `${r.ordered} gallons ${r.u.name}`
      }
      return `${r.ordered}lb ${r.u.name} (${r.pkgs} ${r.u.label}${r.pkgs > 1 ? 's' : ''})`
    }).join('\n')
  }, [ingredientRows])

  const handleCopy = useCallback(async () => {
    if (!copyText) return
    await navigator.clipboard.writeText(copyText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [copyText])

  if (ingredientRows.rows.length === 0) return null

  return (
    <div className="border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Deep Order</h3>
        <span className="text-[10px] text-muted-foreground/50">Auto-calculated &middot; fridge inventory subtracted</span>
      </div>

      {tightSpots.length > 0 && (
        <div className="mb-3 p-2 rounded bg-yellow-500/10 border border-yellow-500/20 text-xs text-yellow-700 dark:text-yellow-400">
          <span className="font-medium">Tight fit:</span>{' '}
          {tightSpots.join(' \u00b7 ')}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
              <th className="pb-2 pr-4">Ingredient</th>
              <th className="pb-2 text-right px-2">Need</th>
              <th className="pb-2 text-right px-2">On Hand</th>
              <th className="pb-2 text-right px-2">Net Need</th>
              <th className="pb-2 text-right px-2">Ordering</th>
              <th className="pb-2 text-right px-2">Est. Cost</th>
              <th className="pb-2 text-right px-2">Leftover</th>
            </tr>
          </thead>
          <tbody>
            {ingredientRows.rows.map(r => {
              const costStr = r.costLo === r.costHi
                ? `$${r.costLo.toFixed(0)}`
                : `$${r.costLo.toFixed(0)}\u2013$${r.costHi.toFixed(0)}`

              return (
                <tr key={r.ing} className="border-t border-border/50">
                  <td className="py-1.5 pr-4 font-medium capitalize">{r.u.name}</td>
                  <td className="py-1.5 text-right tabular-nums px-2">
                    {r.rawAmt} {r.unit}
                  </td>
                  <td className={`py-1.5 text-right tabular-nums px-2 ${r.onHand > 0 ? 'text-green-600' : 'text-muted-foreground/30'}`}>
                    {r.onHand > 0 ? `${r.onHand} ${r.unit}` : '\u2014'}
                  </td>
                  <td className="py-1.5 text-right tabular-nums px-2 font-medium">
                    {r.netNeed > 0 ? `${r.netNeed} ${r.unit}` : <span className="text-green-600">covered</span>}
                  </td>
                  <td className="py-1.5 text-right tabular-nums px-2 font-semibold">
                    {r.pkgs > 0 ? (
                      <>
                        <div>{r.ordered} {r.unit}</div>
                        <div className="text-[10px] text-muted-foreground/50 font-normal">
                          {r.pkgs} &times; {r.u.label}
                        </div>
                      </>
                    ) : (
                      <span className="text-muted-foreground/30">\u2014</span>
                    )}
                  </td>
                  <td className="py-1.5 text-right tabular-nums px-2">
                    {r.pkgs > 0 ? costStr : '\u2014'}
                  </td>
                  <td className={`py-1.5 text-right tabular-nums px-2 ${
                    r.leftover <= 0 ? 'text-muted-foreground/40' : 'text-green-600'
                  }`}>
                    {r.leftover <= 0 ? '~0' : `${r.leftover} ${r.unit}`}
                  </td>
                </tr>
              )
            })}
            <tr className="border-t border-border/50">
              <td className="py-1.5 pr-4 font-medium">Delivery</td>
              <td className="py-1.5" colSpan={4} />
              <td className="py-1.5 text-right tabular-nums px-2">${DELIVERY_FEE}</td>
              <td className="py-1.5" />
            </tr>
          </tbody>
          <tfoot>
            <tr className="border-t border-border font-semibold">
              <td className="pt-2 pr-4">Total</td>
              <td className="pt-2" colSpan={4} />
              <td className="pt-2 text-right tabular-nums px-2">
                {ingredientRows.totalLo === ingredientRows.totalHi
                  ? `$${ingredientRows.totalLo.toFixed(0)}`
                  : `$${ingredientRows.totalLo.toFixed(0)}\u2013$${ingredientRows.totalHi.toFixed(0)}`
                }
              </td>
              <td className="pt-2" />
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={handleCopy}
          className="text-xs font-medium uppercase tracking-wider px-4 py-2 rounded-full border border-foreground/20 hover:bg-foreground hover:text-background transition-colors"
        >
          {copied ? 'Copied!' : 'Copy Deep List'}
        </button>
      </div>
    </div>
  )
}
