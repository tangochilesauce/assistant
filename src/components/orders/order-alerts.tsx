'use client'

import { useMemo } from 'react'
import { useOrderStore } from '@/store/order-store'
import { useInventoryStore } from '@/store/inventory-store'
import { FLAVORS, DRUM_BOTTLES, FLAVOR_COLORS } from '@/data/tango-constants'

interface Alert {
  severity: 'critical' | 'warning'
  message: string
  detail?: string
  flavor?: string
}

export function OrderAlerts() {
  const orders = useOrderStore(s => s.orders)
  const { packed, packed25, drums, labels, materials } = useInventoryStore()

  const activeOrders = useMemo(
    () => orders.filter(o => o.stage === 'order' || o.stage === 'cook'),
    [orders]
  )

  const alerts = useMemo(() => {
    if (activeOrders.length === 0) return []

    const result: Alert[] = []

    // Total demand per flavor (bottles + cases)
    const demandBottles: Record<string, number> = {}
    const demandCases: Record<string, number> = {}
    for (const order of activeOrders) {
      for (const item of order.items) {
        const remaining = item.cases - item.packed
        if (remaining > 0) {
          demandBottles[item.flavor] = (demandBottles[item.flavor] || 0) + remaining * 6
          demandCases[item.flavor] = (demandCases[item.flavor] || 0) + remaining
        }
      }
    }

    const totalCasesNeeded = Object.values(demandCases).reduce((s, v) => s + v, 0)

    // Total available bottles per flavor
    const available: Record<string, number> = {}
    for (const f of FLAVORS) {
      available[f] = (packed[f] || 0) + (packed25[f] || 0) + Math.round((drums[f] || 0) * DRUM_BOTTLES)
    }

    // Box check
    const totalBoxes = materials
      .filter(m => m.item.includes('6-Pack Box'))
      .reduce((s, m) => s + (m.quantity ?? 0), 0)

    if (totalCasesNeeded > totalBoxes) {
      const short = totalCasesNeeded - totalBoxes
      result.push({
        severity: 'critical',
        message: `${short} boxes short`,
        detail: `${totalBoxes} available, ${totalCasesNeeded} needed across ${activeOrders.length} order${activeOrders.length !== 1 ? 's' : ''}`,
      })
    }

    // Per-flavor checks
    for (const f of FLAVORS) {
      const demand = demandBottles[f] || 0
      if (demand === 0) continue

      // Label check
      const labelCount = labels[f] || 0
      if (labelCount === 0) {
        result.push({
          severity: 'critical',
          message: `No ${f} labels`,
          detail: `${demand} bottles needed, 0 labels in stock`,
          flavor: f,
        })
      }

      // Sauce shortage (not enough even with drums)
      const avail = available[f] || 0
      if (avail < demand) {
        const short = demand - avail
        result.push({
          severity: 'warning',
          message: `${f}: ${short} bottles short`,
          detail: `${demand} needed, ${avail} available (packed + drums)`,
          flavor: f,
        })
      }
    }

    return result
  }, [activeOrders, packed, packed25, drums, labels, materials])

  if (alerts.length === 0) return null

  const criticals = alerts.filter(a => a.severity === 'critical')
  const warnings = alerts.filter(a => a.severity === 'warning')

  return (
    <div className="space-y-1.5">
      {criticals.map((alert, i) => (
        <div
          key={`c-${i}`}
          className="flex items-start gap-2.5 rounded-lg bg-red-500/10 border border-red-500/25 px-3.5 py-2.5"
        >
          {alert.flavor ? (
            <span className="inline-block w-2.5 h-2.5 rounded-full shrink-0 mt-0.5" style={{ background: FLAVOR_COLORS[alert.flavor] || '#999' }} />
          ) : (
            <span className="text-red-500 text-sm shrink-0 mt-px">!</span>
          )}
          <div className="min-w-0">
            <div className="text-sm font-medium text-red-600 dark:text-red-400">{alert.message}</div>
            {alert.detail && (
              <div className="text-xs text-red-500/70 dark:text-red-400/60 mt-0.5">{alert.detail}</div>
            )}
          </div>
        </div>
      ))}
      {warnings.map((alert, i) => (
        <div
          key={`w-${i}`}
          className="flex items-start gap-2.5 rounded-lg bg-amber-500/10 border border-amber-500/25 px-3.5 py-2.5"
        >
          {alert.flavor ? (
            <span className="inline-block w-2.5 h-2.5 rounded-full shrink-0 mt-0.5" style={{ background: FLAVOR_COLORS[alert.flavor] || '#999' }} />
          ) : (
            <span className="text-amber-500 text-sm shrink-0 mt-px">!</span>
          )}
          <div className="min-w-0">
            <div className="text-sm font-medium text-amber-600 dark:text-amber-400">{alert.message}</div>
            {alert.detail && (
              <div className="text-xs text-amber-500/70 dark:text-amber-400/60 mt-0.5">{alert.detail}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
