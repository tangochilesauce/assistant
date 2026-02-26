'use client'

import { useMemo } from 'react'
import { useOrderStore } from '@/store/order-store'
import { useInventoryStore } from '@/store/inventory-store'
import { FLAVORS, DRUM_BOTTLES, FLAVOR_COLORS, LABELS_PER_ROLL, CAPS_PER_BOX } from '@/data/tango-constants'

interface Alert {
  severity: 'critical' | 'warning'
  message: string
  detail?: string
  flavor?: string
}

export function OrderAlerts() {
  const orders = useOrderStore(s => s.orders)
  const {
    packed, packed25, drums,
    caps, labels, sealFilledCaps, caseLabels,
    materials,
  } = useInventoryStore()

  const activeOrders = useMemo(
    () => orders.filter(o => o.stage === 'order' || o.stage === 'cook'),
    [orders]
  )

  const alerts = useMemo(() => {
    if (activeOrders.length === 0) return []

    const result: Alert[] = []

    // ── Demand totals ──────────────────────────────────────────
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
    const totalBottlesNeeded = Object.values(demandBottles).reduce((s, v) => s + v, 0)

    // ── Shared materials ───────────────────────────────────────

    // 6-Pack Boxes (shared pool)
    const totalBoxes = materials
      .filter(m => m.item.includes('6-Pack Box'))
      .reduce((s, m) => s + (m.quantity ?? 0), 0)
    if (totalCasesNeeded > totalBoxes) {
      const short = totalCasesNeeded - totalBoxes
      result.push({
        severity: 'critical',
        message: `${short} boxes short`,
        detail: `${totalBoxes} available, ${totalCasesNeeded} needed`,
      })
    }

    // Empty Bottles
    const emptyBottleMat = materials.find(m => m.item === 'Empty Bottles')
    const emptyBottles = emptyBottleMat?.quantity ?? 0
    const alreadyPacked = FLAVORS.reduce((s, f) => s + (packed[f] || 0) + (packed25[f] || 0), 0)
    const bottlesToFill = Math.max(0, totalBottlesNeeded - alreadyPacked)
    if (bottlesToFill > 0 && emptyBottles < bottlesToFill) {
      const short = bottlesToFill - emptyBottles
      result.push({
        severity: emptyBottles === 0 ? 'critical' : 'warning',
        message: `${short} empty bottles short`,
        detail: `${emptyBottles} available, ${bottlesToFill} to fill`,
      })
    }

    // ── Per-flavor checks ──────────────────────────────────────
    for (const f of FLAVORS) {
      const demandBtl = demandBottles[f] || 0
      const demandCs = demandCases[f] || 0
      if (demandBtl === 0) continue

      const availBottles = (packed[f] || 0) + (packed25[f] || 0) + Math.round((drums[f] || 0) * DRUM_BOTTLES)
      const toFillFromDrums = Math.max(0, demandBtl - (packed[f] || 0) - (packed25[f] || 0))

      // Sauce shortage
      if (availBottles < demandBtl) {
        const short = demandBtl - availBottles
        result.push({
          severity: 'critical',
          message: `${f}: ${short} bottles short`,
          detail: `${demandBtl} needed, ${availBottles} available`,
          flavor: f,
        })
      }

      // Caps
      const capCount = (caps[f] || 0) * CAPS_PER_BOX
      if (toFillFromDrums > 0 && capCount < toFillFromDrums) {
        const short = toFillFromDrums - capCount
        result.push({
          severity: capCount === 0 ? 'critical' : 'warning',
          message: `${f}: ${short} caps short`,
          detail: `${capCount} available, ${toFillFromDrums} to fill`,
          flavor: f,
        })
      }

      // Sealed caps
      if (toFillFromDrums > 0 && (sealFilledCaps[f] === 'none' || !sealFilledCaps[f])) {
        result.push({
          severity: 'critical',
          message: `${f}: no sealed caps`,
          detail: `${toFillFromDrums} to fill, no seal-stuffed caps ready`,
          flavor: f,
        })
      }

      // Labels (rolls × 1500 = individual labels)
      const labelRolls = labels[f] || 0
      const labelCount = labelRolls * LABELS_PER_ROLL
      if (labelRolls === 0) {
        result.push({
          severity: 'critical',
          message: `No ${f} labels`,
          detail: `${demandBtl} bottles needed, 0 rolls`,
          flavor: f,
        })
      } else if (labelCount < demandBtl) {
        const short = demandBtl - labelCount
        result.push({
          severity: 'warning',
          message: `${f}: ~${short} labels short`,
          detail: `${labelRolls} roll${labelRolls !== 1 ? 's' : ''} (~${labelCount.toLocaleString()}), ${demandBtl} needed`,
          flavor: f,
        })
      }

      // Case labels
      const caseLabelCount = caseLabels[f] || 0
      if (caseLabelCount < demandCs) {
        const short = demandCs - caseLabelCount
        result.push({
          severity: caseLabelCount === 0 ? 'critical' : 'warning',
          message: `${f}: ${short} case labels short`,
          detail: `${caseLabelCount} available, ${demandCs} needed`,
          flavor: f,
        })
      }
    }

    result.sort((a, b) => {
      if (a.severity === b.severity) return 0
      return a.severity === 'critical' ? -1 : 1
    })

    return result
  }, [activeOrders, packed, packed25, drums, caps, labels, sealFilledCaps, caseLabels, materials])

  if (alerts.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1">
      {alerts.map((alert, i) => {
        const isCritical = alert.severity === 'critical'
        return (
          <div
            key={i}
            className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs ${
              isCritical
                ? 'bg-red-500/10 border border-red-500/25 text-red-600 dark:text-red-400'
                : 'bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400'
            }`}
            title={alert.detail}
          >
            {alert.flavor && (
              <span className="inline-block w-2 h-2 rounded-full shrink-0" style={{ background: FLAVOR_COLORS[alert.flavor] || '#999' }} />
            )}
            <span className="font-medium">{alert.message}</span>
          </div>
        )
      })}
    </div>
  )
}
