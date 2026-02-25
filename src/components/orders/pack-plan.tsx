'use client'

import { useMemo } from 'react'
import { useOrderStore } from '@/store/order-store'

export function PackPlan() {
  const { orders, selectOrder } = useOrderStore()

  const packOrders = useMemo(
    () => orders.filter(o => o.stage === 'cook'),
    [orders]
  )

  if (packOrders.length === 0) {
    return (
      <div className="border border-border rounded-lg p-4">
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">Pack Plan</h3>
        <p className="text-sm text-muted-foreground/50 text-center py-4">No orders in cook stage.</p>
      </div>
    )
  }

  return (
    <div className="border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Pack Plan</h3>
      </div>
      <div className="space-y-4">
        {packOrders.map(order => {
          const totalCases = order.items.reduce((s, i) => s + i.cases, 0)
          const totalBottles = totalCases * 6
          const packedCases = order.items.reduce((s, i) => s + i.packed, 0)
          const progress = totalCases > 0 ? Math.round((packedCases / totalCases) * 100) : 0

          return (
            <div
              key={order.id}
              className="border border-border/50 rounded-lg p-3 hover:border-foreground/20 cursor-pointer transition-colors"
              onClick={() => selectOrder(order.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-orange-400 font-medium">{order.channel}</span>
                  <div className="text-sm font-medium">{order.title}</div>
                </div>
                <span className="text-xs font-semibold tabular-nums text-emerald-400">{order.value}</span>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 bg-border/50 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-[10px] text-muted-foreground tabular-nums mb-2">
                {packedCases}/{totalCases} cases packed ({progress}%) &middot; {totalBottles} bottles
              </div>

              {/* Auto-generated checklist */}
              <div className="space-y-1">
                {order.items.map(item => {
                  const remaining = item.cases - item.packed
                  const bottlesNeeded = remaining * 6
                  if (remaining <= 0) {
                    return (
                      <div key={item.flavor} className="text-xs text-muted-foreground/40 line-through">
                        {item.flavor}: {item.cases} cases done
                      </div>
                    )
                  }
                  return (
                    <div key={item.flavor} className="text-xs">
                      <span className="font-medium">{item.flavor}</span>: Fill {bottlesNeeded} bottles &rarr; Box {remaining} cases
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
