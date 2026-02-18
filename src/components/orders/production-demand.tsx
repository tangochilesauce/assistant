'use client'

import { useMemo } from 'react'
import { useOrderStore } from '@/store/order-store'

const FLAVORS = ['Hot', 'Mild', 'Mango', 'Truffle', 'Sriracha', 'Thai'] as const

export function ProductionDemand() {
  const orders = useOrderStore(s => s.orders)

  const activeOrders = useMemo(
    () => orders.filter(o => o.stage === 'new' || o.stage === 'processing'),
    [orders]
  )

  // Build a map: orderId → { flavor → cases }
  const orderFlavorMap = useMemo(() => {
    const map = new Map<string, Record<string, number>>()
    for (const order of activeOrders) {
      const flavorCases: Record<string, number> = {}
      for (const item of order.items) {
        const f = item.flavor
        flavorCases[f] = (flavorCases[f] || 0) + item.cases
      }
      map.set(order.id, flavorCases)
    }
    return map
  }, [activeOrders])

  // Totals per flavor
  const totals = useMemo(() => {
    const t: Record<string, number> = {}
    for (const fc of orderFlavorMap.values()) {
      for (const [flavor, cases] of Object.entries(fc)) {
        t[flavor] = (t[flavor] || 0) + cases
      }
    }
    return t
  }, [orderFlavorMap])

  if (activeOrders.length === 0) return null

  return (
    <div className="border border-border rounded-lg p-4">
      <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
        Production Demand
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
              <th className="pb-2 pr-4">Order</th>
              {FLAVORS.map(f => (
                <th key={f} className="pb-2 text-right px-2 min-w-[52px]">{f}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {activeOrders.map(order => {
              const fc = orderFlavorMap.get(order.id) || {}
              return (
                <tr key={order.id} className="border-t border-border/50">
                  <td className="py-1.5 pr-4 font-medium truncate max-w-[180px]">{order.title}</td>
                  {FLAVORS.map(f => (
                    <td key={f} className="py-1.5 text-right tabular-nums px-2">
                      {fc[f] ? (
                        <span>{fc[f]}</span>
                      ) : (
                        <span className="text-muted-foreground/20">&mdash;</span>
                      )}
                    </td>
                  ))}
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
            </tr>
            <tr className="text-muted-foreground text-xs">
              <td className="pt-1 pr-4">Bottles</td>
              {FLAVORS.map(f => (
                <td key={f} className="pt-1 text-right tabular-nums px-2">
                  {totals[f] ? totals[f] * 6 : <span className="text-muted-foreground/20">&mdash;</span>}
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
