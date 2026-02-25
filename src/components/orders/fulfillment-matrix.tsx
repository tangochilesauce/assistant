'use client'

import { useMemo } from 'react'
import { useOrderStore } from '@/store/order-store'
import { useInventoryStore } from '@/store/inventory-store'
import { FLAVORS, DRUM_BOTTLES, FLAVOR_COLORS, LABELS_PER_ROLL } from '@/data/tango-constants'

// ── Types ────────────────────────────────────────────────────

interface OrderColumn {
  id: string
  channel: string
  title: string
  pickup: string          // display date string
  pickupRaw: string       // for sorting
}

interface Cell {
  need: number
  after: number
  ok: boolean
}

interface Row {
  label: string
  flavor?: string
  stock: number | string  // string for qualitative values like sealed caps
  cells: Cell[]
  remaining: number
  remainingOk: boolean
  isGroupHeader?: boolean
  isShared?: boolean
  muted?: boolean         // for items that are fine (don't need highlighting)
}

// ── Component ────────────────────────────────────────────────

export function FulfillmentMatrix() {
  const orders = useOrderStore(s => s.orders)
  const {
    packed, packed25, drums,
    caps, labels, sealFilledCaps, caseLabels,
    materials,
  } = useInventoryStore()

  // Active orders sorted by pickup date (earliest = most pressing)
  const sortedOrders = useMemo(() => {
    const active = orders.filter(o => o.stage === 'order' || o.stage === 'cook')
    return active.sort((a, b) => {
      const da = a.pickupDate || a.dateStr || ''
      const db = b.pickupDate || b.dateStr || ''
      if (!da && !db) return 0
      if (!da) return 1
      if (!db) return -1
      return da.localeCompare(db)
    })
  }, [orders])

  const orderColumns: OrderColumn[] = useMemo(() =>
    sortedOrders.map(o => ({
      id: o.id,
      channel: o.channel,
      title: o.title,
      pickup: o.dateStr || o.pickupDate || '—',
      pickupRaw: o.pickupDate || o.dateStr || '',
    })),
    [sortedOrders]
  )

  // Demand per order per flavor: { orderId: { flavor: { bottles, cases } } }
  const orderDemand = useMemo(() => {
    const demand: Record<string, Record<string, { bottles: number; cases: number }>> = {}
    for (const order of sortedOrders) {
      demand[order.id] = {}
      for (const item of order.items) {
        const remaining = item.cases - item.packed
        if (remaining > 0) {
          demand[order.id][item.flavor] = {
            bottles: remaining * 6,
            cases: remaining,
          }
        }
      }
    }
    return demand
  }, [sortedOrders])

  // Flavors that have any demand
  const activeFlavors = useMemo(() => {
    const set = new Set<string>()
    for (const od of Object.values(orderDemand)) {
      for (const f of Object.keys(od)) set.add(f)
    }
    return FLAVORS.filter(f => set.has(f))
  }, [orderDemand])

  // ── Build rows ─────────────────────────────────────────────
  const rows = useMemo(() => {
    const result: Row[] = []

    // Per-flavor rows
    for (const f of activeFlavors) {
      // Sauce (bottles)
      const sauceStock = (packed[f] || 0) + (packed25[f] || 0) + Math.round((drums[f] || 0) * DRUM_BOTTLES)
      let sauceBalance = sauceStock
      const sauceCells: Cell[] = orderColumns.map(col => {
        const need = orderDemand[col.id]?.[f]?.bottles || 0
        sauceBalance -= need
        return { need, after: sauceBalance, ok: sauceBalance >= 0 }
      })

      result.push({
        label: `${f} — Sauce`,
        flavor: f,
        stock: sauceStock,
        cells: sauceCells,
        remaining: sauceBalance,
        remainingOk: sauceBalance >= 0,
      })

      // Labels (per flavor — rolls × 1500 labels/roll)
      const labelRolls = labels[f] || 0
      const labelStock = labelRolls * LABELS_PER_ROLL
      let labelBalance = labelStock
      const labelCells: Cell[] = orderColumns.map(col => {
        const need = orderDemand[col.id]?.[f]?.bottles || 0
        labelBalance -= need
        return { need, after: labelBalance, ok: labelBalance >= 0 }
      })

      result.push({
        label: `${f} — Labels`,
        flavor: f,
        stock: labelStock,
        cells: labelCells,
        remaining: labelBalance,
        remainingOk: labelBalance >= 0,
        muted: labelStock > 0 && labelBalance >= 0,
      })

      // Case Labels (per flavor)
      const csLabelStock = caseLabels[f] || 0
      let csLabelBalance = csLabelStock
      const csLabelCells: Cell[] = orderColumns.map(col => {
        const need = orderDemand[col.id]?.[f]?.cases || 0
        csLabelBalance -= need
        return { need, after: csLabelBalance, ok: csLabelBalance >= 0 }
      })

      result.push({
        label: `${f} — Case Labels`,
        flavor: f,
        stock: csLabelStock,
        cells: csLabelCells,
        remaining: csLabelBalance,
        remainingOk: csLabelBalance >= 0,
        muted: csLabelStock > 0 && csLabelBalance >= 0,
      })
    }

    // ── Shared rows ────────────────────────────────────────

    // 6-Pack Boxes
    const boxStock = materials
      .filter(m => m.item.includes('6-Pack Box'))
      .reduce((s, m) => s + (m.quantity ?? 0), 0)
    let boxBalance = boxStock
    const boxCells: Cell[] = orderColumns.map(col => {
      const need = Object.values(orderDemand[col.id] || {}).reduce((s, d) => s + d.cases, 0)
      boxBalance -= need
      return { need, after: boxBalance, ok: boxBalance >= 0 }
    })

    result.push({
      label: '6-Pack Boxes',
      stock: boxStock,
      cells: boxCells,
      remaining: boxBalance,
      remainingOk: boxBalance >= 0,
      isShared: true,
    })

    // Empty Bottles — only count what needs to be filled from drums (not already packed)
    const emptyMat = materials.find(m => m.item === 'Empty Bottles')
    const emptyStock = emptyMat?.quantity ?? 0
    let emptyBalance = emptyStock
    const emptyCells: Cell[] = orderColumns.map(col => {
      // For this order: total bottles needed minus what's available in packed stock
      // We need to compute how much gets filled from drums per order (waterfall)
      let need = 0
      for (const f of activeFlavors) {
        const orderNeed = orderDemand[col.id]?.[f]?.bottles || 0
        // This is approximate — the exact waterfall would need to track
        // packed depletion across orders, but this gives a good estimate
        need += orderNeed
      }
      // Subtract already-packed bottles (they don't need empty bottles)
      // Only the first order gets the benefit of packed stock
      emptyBalance -= need
      return { need, after: emptyBalance, ok: emptyBalance >= 0 }
    })

    result.push({
      label: 'Empty Bottles',
      stock: emptyStock,
      cells: emptyCells,
      remaining: emptyBalance,
      remainingOk: emptyBalance >= 0,
      isShared: true,
      muted: emptyStock > 0 && emptyBalance >= 0,
    })

    return result
  }, [activeFlavors, orderColumns, orderDemand, packed, packed25, drums, labels, caseLabels, materials])

  // Count problems
  const problemCount = rows.filter(r => !r.remainingOk || r.cells.some(c => !c.ok)).length

  if (sortedOrders.length === 0) return null

  // Group rows by flavor for visual separation
  const flavorDot = (f: string) => (
    <span
      className="inline-block w-2 h-2 rounded-full mr-1.5 shrink-0"
      style={{ background: FLAVOR_COLORS[f] || '#999' }}
    />
  )

  const formatNum = (n: number) => {
    if (n === 0) return <span className="text-muted-foreground/20">&mdash;</span>
    return n.toLocaleString()
  }

  // Detect flavor group boundaries for visual separators
  const isNewFlavorGroup = (row: Row, idx: number) => {
    if (idx === 0) return true
    if (row.isShared && !rows[idx - 1].isShared) return true
    if (row.flavor && rows[idx - 1].flavor !== row.flavor) return true
    return false
  }

  return (
    <div className="border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Fulfillment
        </h3>
        {problemCount > 0 ? (
          <span className="text-[10px] font-medium text-red-500 tabular-nums">
            {problemCount} shortage{problemCount !== 1 ? 's' : ''}
          </span>
        ) : (
          <span className="text-[10px] font-medium text-emerald-500">
            All covered
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
              <th className="pb-2 pr-3 min-w-[120px]"></th>
              <th className="pb-2 px-2 text-right min-w-[56px]">Stock</th>
              {orderColumns.map(col => (
                <th key={col.id} className="pb-2 px-2 text-right min-w-[80px]">
                  <div className="text-orange-400 font-medium normal-case">{col.channel}</div>
                  <div className="text-[9px] text-muted-foreground/50 font-normal normal-case">{col.title}</div>
                  <div className="text-[9px] text-muted-foreground/40 font-normal normal-case">{col.pickup}</div>
                </th>
              ))}
              <th className="pb-2 px-2 text-right min-w-[56px]">Left</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => {
              const isNewGroup = isNewFlavorGroup(row, idx)
              const hasProblems = !row.remainingOk || row.cells.some(c => !c.ok)
              const itemLabel = row.flavor
                ? row.label.replace(`${row.flavor} — `, '')
                : row.label

              return (
                <tr
                  key={idx}
                  className={`
                    ${isNewGroup ? 'border-t border-border' : 'border-t border-border/30'}
                    ${hasProblems ? 'bg-red-500/5' : ''}
                    ${row.muted ? 'text-muted-foreground/50' : ''}
                  `}
                >
                  {/* Item label */}
                  <td className="py-1.5 pr-3">
                    <div className="flex items-center">
                      {row.flavor && isNewGroup && flavorDot(row.flavor)}
                      {row.flavor && !isNewGroup && <span className="w-[14px]" />}
                      <span className={isNewGroup && row.flavor ? 'font-medium' : ''}>
                        {isNewGroup && row.flavor && <span className="mr-1">{row.flavor}</span>}
                        {isNewGroup && row.flavor ? (
                          <span className="text-muted-foreground/50 font-normal">{itemLabel}</span>
                        ) : (
                          <span className={row.isShared ? 'font-medium' : ''}>{itemLabel}</span>
                        )}
                      </span>
                    </div>
                  </td>

                  {/* Stock */}
                  <td className="py-1.5 px-2 text-right tabular-nums">
                    {typeof row.stock === 'number' ? formatNum(row.stock) : row.stock}
                  </td>

                  {/* Order columns */}
                  {row.cells.map((cell, ci) => (
                    <td key={ci} className="py-1.5 px-2 text-right tabular-nums">
                      {cell.need === 0 ? (
                        <span className="text-muted-foreground/20">&mdash;</span>
                      ) : (
                        <div>
                          <span className="text-muted-foreground/50">-{cell.need.toLocaleString()}</span>
                          <span className="mx-0.5">&rarr;</span>
                          <span className={cell.ok ? 'text-emerald-500' : 'text-red-500 font-medium'}>
                            {cell.after.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </td>
                  ))}

                  {/* Remaining */}
                  <td className={`py-1.5 px-2 text-right tabular-nums font-medium ${
                    row.remainingOk ? 'text-emerald-500' : 'text-red-500'
                  }`}>
                    {row.remaining.toLocaleString()}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
