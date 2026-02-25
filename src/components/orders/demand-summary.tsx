'use client'

import { useMemo } from 'react'
import { useOrderStore } from '@/store/order-store'
import { FLAVORS, DRUM_BOTTLES } from '@/data/tango-constants'

export function DemandSummary() {
  const orders = useOrderStore(s => s.orders)

  const activeOrders = useMemo(
    () => orders.filter(o => o.stage === 'order' || o.stage === 'cook'),
    [orders]
  )

  const orderFlavorMap = useMemo(() => {
    const map = new Map<string, Record<string, number>>()
    for (const order of activeOrders) {
      const flavorCases: Record<string, number> = {}
      for (const item of order.items) {
        flavorCases[item.flavor] = (flavorCases[item.flavor] || 0) + item.cases
      }
      map.set(order.id, flavorCases)
    }
    return map
  }, [activeOrders])

  const totals = useMemo(() => {
    const t: Record<string, number> = {}
    for (const fc of orderFlavorMap.values()) {
      for (const [flavor, cases] of Object.entries(fc)) {
        t[flavor] = (t[flavor] || 0) + cases
      }
    }
    return t
  }, [orderFlavorMap])

  const grandTotalCases = Object.values(totals).reduce((a, b) => a + b, 0)
  const grandTotalBottles = grandTotalCases * 6

  if (activeOrders.length === 0) return null

  return (
    <div className="border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Demand Summary
        </h3>
        <span className="text-[10px] text-muted-foreground/50 tabular-nums">
          {grandTotalCases} cases &middot; {grandTotalBottles} btl &middot; {(grandTotalBottles / DRUM_BOTTLES).toFixed(1)} drums
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
              <th className="pb-2 pr-4">Order</th>
              {FLAVORS.map(f => (
                <th key={f} className="pb-2 text-right px-2 min-w-[52px]">{f}</th>
              ))}
              <th className="pb-2 text-right pl-3 border-l border-border/50 min-w-[52px]">Total</th>
            </tr>
          </thead>
          <tbody>
            {activeOrders.map(order => {
              const fc = orderFlavorMap.get(order.id) || {}
              const orderTotal = Object.values(fc).reduce((a, b) => a + b, 0)
              const hasItems = order.items.length > 0
              return (
                <tr key={order.id} className="border-t border-border/50">
                  <td className="py-1.5 pr-4">
                    <div className="text-[10px] uppercase tracking-wider text-orange-400 font-medium truncate max-w-[180px]">{order.channel}</div>
                    <div className="font-medium truncate max-w-[180px]">{order.title}</div>
                    <div className="text-[10px] text-muted-foreground/50">{order.dateStr}</div>
                  </td>
                  {FLAVORS.map(f => (
                    <td key={f} className="py-1.5 text-right tabular-nums px-2">
                      {fc[f] ? <span>{fc[f]}</span> : <span className="text-muted-foreground/20">&mdash;</span>}
                    </td>
                  ))}
                  <td className="py-1.5 text-right tabular-nums pl-3 border-l border-border/50 font-medium">
                    {hasItems ? orderTotal : <span className="text-muted-foreground/40 text-[10px]">no items</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-border font-semibold">
              <td className="pt-2 pr-4">Cases</td>
              {FLAVORS.map(f => (
                <td key={f} className="pt-2 text-right tabular-nums px-2">
                  {totals[f] || <span className="text-muted-foreground/20">&mdash;</span>}
                </td>
              ))}
              <td className="pt-2 text-right tabular-nums pl-3 border-l border-border/50">{grandTotalCases}</td>
            </tr>
            <tr className="text-muted-foreground text-xs">
              <td className="pt-1 pr-4">Bottles</td>
              {FLAVORS.map(f => (
                <td key={f} className="pt-1 text-right tabular-nums px-2">
                  {totals[f] ? totals[f] * 6 : <span className="text-muted-foreground/20">&mdash;</span>}
                </td>
              ))}
              <td className="pt-1 text-right tabular-nums pl-3 border-l border-border/50">{grandTotalBottles}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
