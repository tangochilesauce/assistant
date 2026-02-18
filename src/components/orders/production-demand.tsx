'use client'

import { useOrderStore } from '@/store/order-store'

export function ProductionDemand() {
  const demand = useOrderStore(s => s.getProductionDemand())

  if (demand.length === 0) return null

  return (
    <div className="border border-border rounded-lg p-4">
      <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
        Production Demand
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
              <th className="pb-2">Flavor</th>
              <th className="pb-2 text-right">Cases</th>
              <th className="pb-2 text-right">Bottles</th>
              <th className="pb-2 hidden sm:table-cell">Source Orders</th>
            </tr>
          </thead>
          <tbody>
            {demand.map(d => (
              <tr key={d.flavor} className="border-t border-border/50">
                <td className="py-1.5 font-medium">{d.flavor}</td>
                <td className="py-1.5 text-right tabular-nums">{d.cases}</td>
                <td className="py-1.5 text-right tabular-nums text-muted-foreground">{d.bottles}</td>
                <td className="py-1.5 text-xs text-muted-foreground hidden sm:table-cell">
                  {d.sourceOrders.join(' + ')}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-border font-semibold">
              <td className="pt-2">Total</td>
              <td className="pt-2 text-right tabular-nums">
                {demand.reduce((s, d) => s + d.cases, 0)}
              </td>
              <td className="pt-2 text-right tabular-nums text-muted-foreground">
                {demand.reduce((s, d) => s + d.bottles, 0)}
              </td>
              <td className="pt-2 hidden sm:table-cell" />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
