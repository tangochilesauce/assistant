'use client'

import { useMemo } from 'react'
import { useOrderStore } from '@/store/order-store'

export function ShipTracker() {
  const { orders, selectOrder, updateOrder } = useOrderStore()

  // Ship stage orders + pack stage orders nearing completion
  const shipOrders = useMemo(
    () => orders.filter(o => o.stage === 'ship'),
    [orders]
  )

  const carrierLabel = (carrier: string | null) => {
    switch (carrier) {
      case 'unfi': return 'UNFI Carrier'
      case 'daylight': return 'Daylight Transport'
      case 'pickup': return 'Customer Pickup'
      default: return 'Not set'
    }
  }

  if (shipOrders.length === 0) {
    return (
      <div className="border border-border rounded-lg p-4">
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">Ship Tracker</h3>
        <p className="text-sm text-muted-foreground/50 text-center py-4">No orders in ship stage.</p>
      </div>
    )
  }

  return (
    <div className="border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Ship Tracker</h3>
        <span className="text-[10px] text-muted-foreground/50 tabular-nums">
          {shipOrders.length} shipment{shipOrders.length > 1 ? 's' : ''}
        </span>
      </div>
      <div className="space-y-3">
        {shipOrders.map(order => (
          <div
            key={order.id}
            className="border border-border/50 rounded-lg p-3 hover:border-foreground/20 cursor-pointer transition-colors"
            onClick={() => selectOrder(order.id)}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-orange-400 font-medium">{order.channel}</span>
                <div className="text-sm font-medium">{order.title}</div>
              </div>
              <span className="text-xs font-semibold tabular-nums text-emerald-400">{order.value}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground/50">Carrier</span>
                <div className="font-medium text-foreground">{carrierLabel(order.carrier)}</div>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground/50">Pickup</span>
                <div className="font-medium text-foreground">
                  {order.pickupDate || order.dateStr || 'TBD'}
                </div>
              </div>
              {order.trackingNumber && (
                <div className="col-span-2">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground/50">Tracking</span>
                  <div className="font-medium text-foreground">{order.trackingNumber}</div>
                </div>
              )}
              {order.shipTo && (
                <div className="col-span-2">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground/50">Ship To</span>
                  <div className="text-foreground/80 truncate">{order.shipTo}</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
