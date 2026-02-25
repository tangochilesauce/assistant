'use client'

import { useMemo } from 'react'
import { useOrderStore } from '@/store/order-store'
import { useInventoryStore } from '@/store/inventory-store'
import { FLAVORS, DRUM_BOTTLES, FLAVOR_COLORS } from '@/data/tango-constants'

export function PackReadiness() {
  const orders = useOrderStore(s => s.orders)
  const { packed, packed25, drums, materials } = useInventoryStore()

  // Orders in cook stage (what we're prepping to pack)
  const packOrders = useMemo(
    () => orders.filter(o => o.stage === 'cook'),
    [orders]
  )

  // Sauce available per flavor
  const sauceAvailable = useMemo(() => {
    const avail: Record<string, { packed: number; drumBottles: number; total: number }> = {}
    for (const f of FLAVORS) {
      const p = (packed[f] || 0) + (packed25[f] || 0)
      const dw = (drums[f] || 0) * DRUM_BOTTLES
      avail[f] = { packed: p, drumBottles: dw, total: p + dw }
    }
    return avail
  }, [packed, packed25, drums])

  // Total bottles needed for pack orders
  const bottlesNeeded = useMemo(() => {
    const need: Record<string, number> = {}
    for (const order of packOrders) {
      for (const item of order.items) {
        need[item.flavor] = (need[item.flavor] || 0) + (item.cases - item.packed) * 6
      }
    }
    return need
  }, [packOrders])

  // Packaging check
  const packagingIssues = useMemo(() => {
    const issues: string[] = []
    for (const mat of materials) {
      if (mat.status === 'Order' || mat.status === 'Low') {
        issues.push(`${mat.item}: ${mat.status}`)
      }
    }
    return issues
  }, [materials])

  const flavorDot = (f: string) => (
    <span className="inline-block w-2 h-2 rounded-full mr-1.5 relative top-[-1px]" style={{ background: FLAVOR_COLORS[f] || '#999' }} />
  )

  if (packOrders.length === 0) {
    return (
      <div className="border border-border rounded-lg p-4">
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">Pack Readiness</h3>
        <p className="text-sm text-muted-foreground/50 text-center py-4">No orders in cook stage.</p>
      </div>
    )
  }

  return (
    <div className="border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Pack Readiness</h3>
        <span className="text-[10px] text-muted-foreground/50 tabular-nums">
          {packOrders.length} order{packOrders.length > 1 ? 's' : ''} to pack
        </span>
      </div>

      {/* Packaging warnings */}
      {packagingIssues.length > 0 && (
        <div className="mb-3 p-2 rounded bg-yellow-500/10 border border-yellow-500/20 text-xs text-yellow-700 dark:text-yellow-400">
          <span className="font-medium">Packaging alert:</span>{' '}
          {packagingIssues.join(' \u00b7 ')}
        </div>
      )}

      {/* Drum/bottle readiness by flavor */}
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
              <td className="py-1.5 pr-4 font-medium">Bottles Needed</td>
              {FLAVORS.map(f => (
                <td key={f} className="py-1.5 text-right tabular-nums px-2">
                  {(bottlesNeeded[f] || 0) > 0
                    ? <span className="font-medium">{bottlesNeeded[f]}</span>
                    : <span className="text-muted-foreground/20">&mdash;</span>
                  }
                </td>
              ))}
            </tr>
            <tr className="border-t border-border/50">
              <td className="py-1.5 pr-4 font-medium">Available</td>
              {FLAVORS.map(f => {
                const avail = sauceAvailable[f]?.total || 0
                const need = bottlesNeeded[f] || 0
                const enough = avail >= need
                return (
                  <td key={f} className={`py-1.5 text-right tabular-nums px-2 ${
                    need === 0 ? 'text-muted-foreground/20' : enough ? 'text-green-600' : 'text-red-500 font-medium'
                  }`}>
                    {need === 0 ? '\u2014' : avail.toLocaleString()}
                  </td>
                )
              })}
            </tr>
            <tr className="border-t border-border/50">
              <td className="py-1.5 pr-4 font-medium">Drums Ready</td>
              {FLAVORS.map(f => {
                const d = drums[f] || 0
                return (
                  <td key={f} className="py-1.5 text-right tabular-nums px-2">
                    {d > 0 ? d : <span className="text-muted-foreground/20">&mdash;</span>}
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
