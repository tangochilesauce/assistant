'use client'

import { useMemo } from 'react'
import { useOrderStore } from '@/store/order-store'

export function PaymentTracker() {
  const { orders, selectOrder, updateOrder, moveOrder } = useOrderStore()

  // Orders in ship or paid stage that need payment tracking
  const payOrders = useMemo(
    () => orders.filter(o => o.stage === 'ship' || o.stage === 'paid'),
    [orders]
  )

  const isOverdue = (expectedPayDate: string | null) => {
    if (!expectedPayDate) return false
    return new Date(expectedPayDate) < new Date()
  }

  if (payOrders.length === 0) {
    return (
      <div className="border border-border rounded-lg p-4">
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">Payment Tracker</h3>
        <p className="text-sm text-muted-foreground/50 text-center py-4">No orders awaiting payment.</p>
      </div>
    )
  }

  const unpaid = payOrders.filter(o => o.stage === 'ship' && !o.paidAt)
  const paid = payOrders.filter(o => o.stage === 'paid' || o.paidAt)

  return (
    <div className="border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Payment Tracker</h3>
        <span className="text-[10px] text-muted-foreground/50 tabular-nums">
          {unpaid.length} awaiting &middot; {paid.length} paid
        </span>
      </div>

      {/* Unpaid */}
      {unpaid.length > 0 && (
        <div className="space-y-2 mb-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-medium">Awaiting Payment</div>
          {unpaid.map(order => {
            const overdue = isOverdue(order.expectedPayDate)
            return (
              <div
                key={order.id}
                className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                  overdue ? 'border-red-500/30 bg-red-500/5' : 'border-border/50 hover:border-foreground/20'
                }`}
                onClick={() => selectOrder(order.id)}
              >
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-orange-400 font-medium">{order.channel}</span>
                    <div className="text-sm font-medium">{order.title}</div>
                  </div>
                  <span className="text-xs font-semibold tabular-nums text-emerald-400">{order.value}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {order.invoiceNumber && (
                    <span>Inv: {order.invoiceNumber}</span>
                  )}
                  {order.invoiceSentAt && (
                    <span>Sent: {new Date(order.invoiceSentAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  )}
                  {order.expectedPayDate && (
                    <span className={overdue ? 'text-red-400 font-medium' : ''}>
                      {overdue ? 'OVERDUE' : 'Due'}: {new Date(order.expectedPayDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    const val = parseFloat(order.value.replace(/[^0-9.]/g, ''))
                    updateOrder(order.id, {
                      paidAt: new Date().toISOString(),
                      paidAmount: isNaN(val) ? 0 : val,
                    })
                    moveOrder(order.id, 'paid')
                  }}
                  className="mt-2 text-[10px] font-medium uppercase tracking-wider px-3 py-1 rounded-full border border-green-500/30 text-green-500 hover:bg-green-500 hover:text-background transition-colors"
                >
                  Mark Paid
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Paid */}
      {paid.length > 0 && (
        <div className="space-y-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-medium">Paid</div>
          {paid.map(order => (
            <div
              key={order.id}
              className="border border-border/30 rounded-lg p-3 cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
              onClick={() => selectOrder(order.id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-orange-400 font-medium">{order.channel}</span>
                  <div className="text-sm font-medium">{order.title}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold tabular-nums text-emerald-400">{order.value}</div>
                  {order.paidAt && (
                    <div className="text-[10px] text-muted-foreground/50">
                      Paid {new Date(order.paidAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
