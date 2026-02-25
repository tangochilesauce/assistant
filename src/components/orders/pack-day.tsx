'use client'

import { useMemo, useEffect } from 'react'
import { useOrderStore } from '@/store/order-store'
import { useInventoryStore } from '@/store/inventory-store'
import { FLAVORS, FLAVOR_COLORS } from '@/data/tango-constants'

// ── Pack order priority ──────────────────────────────────────
// Sriracha always first, Truffle always last, middle sorted by demand.

const PACK_PRIORITY: Record<string, number> = {
  Sriracha: 0,
  Mild: 1,
  Hot: 2,
  Mango: 3,
  Thai: 4,
  Truffle: 99,
}

function sortPackOrder(flavors: string[], bottlesNeeded: Record<string, number>) {
  return [...flavors].sort((a, b) => {
    const pa = PACK_PRIORITY[a] ?? 50
    const pb = PACK_PRIORITY[b] ?? 50
    if (pa !== pb) return pa - pb
    // Tiebreak middle flavors by demand (most needed first)
    return (bottlesNeeded[b] || 0) - (bottlesNeeded[a] || 0)
  })
}

// ── Component ────────────────────────────────────────────────

export function PackDay() {
  const orders = useOrderStore(s => s.orders)
  const {
    packed, drums, sealFilledCaps, labels, materials,
    packDayFlavors, setPackDayFlavors,
  } = useInventoryStore()

  // Orders in pack stage
  const packOrders = useMemo(
    () => orders.filter(o => o.stage === 'pack'),
    [orders]
  )

  // Bottles needed per flavor from pack-stage orders
  const bottlesNeeded = useMemo(() => {
    const need: Record<string, number> = {}
    for (const order of packOrders) {
      for (const item of order.items) {
        const remaining = (item.cases - item.packed) * 6
        if (remaining > 0) {
          need[item.flavor] = (need[item.flavor] || 0) + remaining
        }
      }
    }
    return need
  }, [packOrders])

  // Auto-suggested flavors from pack-stage orders
  const suggestedFlavors = useMemo(
    () => sortPackOrder(Object.keys(bottlesNeeded), bottlesNeeded),
    [bottlesNeeded]
  )

  // Merged selection: start with suggested, layer manual overrides
  const selectedFlavors = useMemo(() => {
    if (packDayFlavors.length === 0) return suggestedFlavors
    // Keep manual list but filter to valid flavors
    const valid = new Set(FLAVORS as readonly string[])
    return sortPackOrder(
      packDayFlavors.filter(f => valid.has(f)),
      bottlesNeeded
    )
  }, [packDayFlavors, suggestedFlavors, bottlesNeeded])

  // Auto-sync: when suggested changes and user has no manual overrides, reset
  useEffect(() => {
    if (packDayFlavors.length === 0 && suggestedFlavors.length > 0) return
    // If user has overrides but there are no pack orders, clear
    if (suggestedFlavors.length === 0 && packDayFlavors.length > 0) {
      // Don't auto-clear — user might be prepping ahead
    }
  }, [suggestedFlavors, packDayFlavors])

  // Toggle a flavor on/off
  const toggleFlavor = (flavor: string) => {
    const current = selectedFlavors.includes(flavor)
    let next: string[]
    if (current) {
      next = selectedFlavors.filter(f => f !== flavor)
    } else {
      next = [...selectedFlavors, flavor]
    }
    setPackDayFlavors(next)
  }

  // Readiness checks
  const getReadiness = (flavor: string) => {
    const hasSauce = (packed[flavor] || 0) > 0 || (drums[flavor] || 0) > 0
    const hasCaps = sealFilledCaps[flavor] !== 'none' && sealFilledCaps[flavor] !== undefined
    const hasLabels = (labels[flavor] || 0) > 0
    return { hasSauce, hasCaps, hasLabels }
  }

  const emptyBottleMat = materials.find(m => m.item === 'Empty Bottles')
  const hasEmptyBottles = emptyBottleMat ? (emptyBottleMat.quantity ?? 0) > 0 : false

  // Prep issues
  const prepIssues = useMemo(() => {
    const issues: { flavor: string; message: string }[] = []
    for (const flavor of selectedFlavors) {
      const { hasSauce, hasCaps, hasLabels } = getReadiness(flavor)
      if (!hasCaps) issues.push({ flavor, message: `Stuff seals into ${flavor} caps` })
      if (!hasLabels) issues.push({ flavor, message: `Need ${flavor} labels` })
      if (!hasSauce) issues.push({ flavor, message: `No ${flavor} sauce ready (no drums or packed bottles)` })
    }
    if (!hasEmptyBottles && selectedFlavors.length > 0) {
      issues.push({ flavor: '', message: 'Need empty bottles' })
    }
    return issues
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFlavors, packed, drums, sealFilledCaps, labels, materials])

  const totalBottles = selectedFlavors.reduce((s, f) => s + (bottlesNeeded[f] || 0), 0)
  const allPrepped = prepIssues.length === 0 && selectedFlavors.length > 0

  // Flavor dot helper
  const flavorDot = (f: string) => (
    <span
      className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
      style={{ background: FLAVOR_COLORS[f] || '#999' }}
    />
  )

  const checkMark = (ok: boolean) => (
    <span className={ok ? 'text-emerald-500' : 'text-red-400'}>
      {ok ? '\u2713' : '\u2717'}
    </span>
  )

  if (packOrders.length === 0 && packDayFlavors.length === 0) {
    return (
      <div className="border border-border rounded-lg p-4">
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">Pack Day</h3>
        <p className="text-sm text-muted-foreground/50 text-center py-4">
          No orders in pack stage. Move orders from Cook &rarr; Pack when ready.
        </p>
      </div>
    )
  }

  return (
    <div className="border border-border rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Pack Day</h3>
          {selectedFlavors.length > 0 && (
            <p className="text-[11px] text-muted-foreground/60 mt-0.5 tabular-nums">
              {selectedFlavors.length} flavor{selectedFlavors.length !== 1 ? 's' : ''} &middot; {totalBottles.toLocaleString()} bottles
            </p>
          )}
        </div>
      </div>

      {/* Flavor toggles */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {FLAVORS.map(f => {
          const isSelected = selectedFlavors.includes(f)
          const isSuggested = suggestedFlavors.includes(f)
          const btls = bottlesNeeded[f] || 0
          return (
            <button
              key={f}
              onClick={() => toggleFlavor(f)}
              className={`
                inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                transition-all cursor-pointer select-none
                ${isSelected
                  ? isSuggested
                    ? 'text-white shadow-sm'
                    : 'border-2 text-foreground shadow-sm'
                  : 'border border-border text-muted-foreground/50 hover:text-muted-foreground hover:border-border/80'
                }
              `}
              style={
                isSelected && isSuggested
                  ? { background: FLAVOR_COLORS[f] || '#999' }
                  : isSelected
                    ? { borderColor: FLAVOR_COLORS[f] || '#999' }
                    : undefined
              }
            >
              {f}
              {btls > 0 && (
                <span className={`tabular-nums text-[10px] ${isSelected && isSuggested ? 'opacity-80' : 'opacity-50'}`}>
                  {btls}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {selectedFlavors.length === 0 && (
        <p className="text-sm text-muted-foreground/50 text-center py-3">
          Select flavors to pack above.
        </p>
      )}

      {selectedFlavors.length > 0 && (
        <div className="space-y-5">
          {/* Section A — Prep (Night-Before) */}
          <div>
            <h4 className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-2">
              Prep &middot; Night Before
            </h4>
            {allPrepped ? (
              <div className="rounded-md bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                All prepped &mdash; ready to pack
              </div>
            ) : (
              <div className="space-y-1">
                {prepIssues.map((issue, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-md bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 text-xs text-amber-700 dark:text-amber-400">
                    {issue.flavor ? flavorDot(issue.flavor) : <span className="inline-block w-2.5 h-2.5 rounded-full bg-muted-foreground/30 shrink-0" />}
                    <span>{issue.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section B — Pack Order (Morning-of) */}
          <div>
            <h4 className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-2">
              Pack Order &middot; Morning Of
            </h4>
            <div className="space-y-1">
              {selectedFlavors.map((flavor, idx) => {
                const btls = bottlesNeeded[flavor] || 0
                const { hasSauce, hasCaps, hasLabels } = getReadiness(flavor)
                return (
                  <div
                    key={flavor}
                    className="flex items-center gap-3 rounded-md border border-border/50 px-3 py-2"
                  >
                    <span className="text-xs font-bold tabular-nums text-muted-foreground/40 w-4 text-right">
                      {idx + 1}.
                    </span>
                    {flavorDot(flavor)}
                    <span className="text-sm font-medium flex-1">{flavor}</span>
                    <span className="text-xs tabular-nums text-muted-foreground mr-2">
                      {btls > 0 ? `${btls} btls` : 'stock'}
                    </span>
                    <span className="flex items-center gap-2 text-xs tabular-nums">
                      <span title="Sauce">{checkMark(hasSauce)} <span className="text-muted-foreground/50">sauce</span></span>
                      <span title="Caps">{checkMark(hasCaps)} <span className="text-muted-foreground/50">caps</span></span>
                      <span title="Labels">{checkMark(hasLabels)} <span className="text-muted-foreground/50">labels</span></span>
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
