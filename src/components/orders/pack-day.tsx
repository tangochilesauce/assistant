'use client'

import { useMemo, useEffect } from 'react'
import { useOrderStore } from '@/store/order-store'
import { useInventoryStore } from '@/store/inventory-store'
import { FLAVORS, DRUM_BOTTLES, FLAVOR_COLORS } from '@/data/tango-constants'

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
    return (bottlesNeeded[b] || 0) - (bottlesNeeded[a] || 0)
  })
}

// ── Verdict quips ────────────────────────────────────────────

const ALL_GOOD_LINES = [
  "You're good to go big chief",
  "Nothing to cook, nothing to sweat",
  "Bottles are covered. Go take a lap",
  "Sauce math checks out. You're golden",
  "All accounted for. Just pack and stack",
  "Zero bottles short. That's a W",
]

function getVerdictLine(totalNet: number, flavorsShort: string[]) {
  if (totalNet === 0) {
    return ALL_GOOD_LINES[Math.floor(Math.random() * ALL_GOOD_LINES.length)]
  }
  if (flavorsShort.length === 1) {
    return `Need to bottle ${totalNet} more ${flavorsShort[0]}. Everything else is covered`
  }
  return `Still ${totalNet.toLocaleString()} bottles short across ${flavorsShort.join(', ')}. Fire up the drums`
}

// ── Component ────────────────────────────────────────────────

export function PackDay() {
  const orders = useOrderStore(s => s.orders)
  const {
    packed, packed25, drums, sealFilledCaps, labels, boxes, materials,
    packDayFlavors, setPackDayFlavors,
  } = useInventoryStore()

  // Orders in cook stage only
  const cookOrders = useMemo(
    () => orders.filter(o => o.stage === 'cook'),
    [orders]
  )

  // Total bottles needed per flavor from cook-stage orders (gross demand)
  const bottlesDemand = useMemo(() => {
    const need: Record<string, number> = {}
    for (const order of cookOrders) {
      for (const item of order.items) {
        const remaining = (item.cases - item.packed) * 6
        if (remaining > 0) {
          need[item.flavor] = (need[item.flavor] || 0) + remaining
        }
      }
    }
    return need
  }, [cookOrders])

  // Available bottles per flavor (packed 6-pk + packed 25-pk)
  const bottlesAvailable = useMemo(() => {
    const avail: Record<string, number> = {}
    for (const f of FLAVORS) {
      avail[f] = (packed[f] || 0) + (packed25[f] || 0)
    }
    return avail
  }, [packed, packed25])

  // Net bottles still needed (demand - available, floored at 0)
  const bottlesNet = useMemo(() => {
    const net: Record<string, number> = {}
    for (const f of Object.keys(bottlesDemand)) {
      net[f] = Math.max(0, (bottlesDemand[f] || 0) - (bottlesAvailable[f] || 0))
    }
    return net
  }, [bottlesDemand, bottlesAvailable])

  // Auto-suggested flavors from cook-stage orders
  const suggestedFlavors = useMemo(
    () => sortPackOrder(Object.keys(bottlesDemand), bottlesDemand),
    [bottlesDemand]
  )

  // Merged selection: start with suggested, layer manual overrides
  const selectedFlavors = useMemo(() => {
    if (packDayFlavors.length === 0) return suggestedFlavors
    const valid = new Set(FLAVORS as readonly string[])
    return sortPackOrder(
      packDayFlavors.filter(f => valid.has(f)),
      bottlesDemand
    )
  }, [packDayFlavors, suggestedFlavors, bottlesDemand])

  // Auto-sync: no-op for now (don't auto-clear manual overrides)
  useEffect(() => {}, [suggestedFlavors, packDayFlavors])

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

  // Cases needed per flavor (for box check)
  const casesNeeded = useMemo(() => {
    const need: Record<string, number> = {}
    for (const f of Object.keys(bottlesDemand)) {
      need[f] = Math.ceil((bottlesDemand[f] || 0) / 6)
    }
    return need
  }, [bottlesDemand])

  // Readiness checks
  const getReadiness = (flavor: string) => {
    const hasSauce = (packed[flavor] || 0) > 0 || (packed25[flavor] || 0) > 0 || (drums[flavor] || 0) > 0
    const hasCaps = sealFilledCaps[flavor] !== 'none' && sealFilledCaps[flavor] !== undefined
    const hasLabels = (labels[flavor] || 0) > 0
    const hasBoxes = (boxes[flavor] || 0) >= (casesNeeded[flavor] || 0)
    return { hasSauce, hasCaps, hasLabels, hasBoxes }
  }

  const emptyBottleMat = materials.find(m => m.item === 'Empty Bottles')
  const hasEmptyBottles = emptyBottleMat ? (emptyBottleMat.quantity ?? 0) > 0 : false

  // Prep issues
  const prepIssues = useMemo(() => {
    const issues: { flavor: string; message: string }[] = []
    for (const flavor of selectedFlavors) {
      const { hasSauce, hasCaps, hasLabels, hasBoxes } = getReadiness(flavor)
      const in25 = packed25[flavor] || 0
      if (in25 > 0) {
        issues.push({ flavor, message: `Rebox ${in25} ${flavor} bottles from 25-packs to 6-packs` })
      }
      if (!hasBoxes) {
        const need = casesNeeded[flavor] || 0
        const have = boxes[flavor] || 0
        issues.push({ flavor, message: `Make ${need - have} ${flavor} boxes (have ${have}, need ${need})` })
      }
      if (!hasCaps) issues.push({ flavor, message: `Stuff seals into ${flavor} caps` })
      if (!hasLabels) issues.push({ flavor, message: `Need ${flavor} labels` })
      if (!hasSauce) issues.push({ flavor, message: `No ${flavor} sauce ready (no drums or packed bottles)` })
    }
    if (!hasEmptyBottles && selectedFlavors.length > 0) {
      issues.push({ flavor: '', message: 'Need empty bottles' })
    }
    return issues
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFlavors, packed, packed25, drums, sealFilledCaps, labels, boxes, materials, casesNeeded])

  const totalDemand = selectedFlavors.reduce((s, f) => s + (bottlesDemand[f] || 0), 0)
  const totalNet = selectedFlavors.reduce((s, f) => s + (bottlesNet[f] || 0), 0)
  const flavorsShort = selectedFlavors.filter(f => (bottlesNet[f] || 0) > 0)
  const allPrepped = prepIssues.length === 0 && selectedFlavors.length > 0

  // Stable verdict (memoized so it doesn't re-roll on every render)
  const verdict = useMemo(
    () => selectedFlavors.length > 0 ? getVerdictLine(totalNet, flavorsShort) : '',
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [totalNet, flavorsShort.join(',')]
  )

  // Helpers
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

  if (cookOrders.length === 0 && packDayFlavors.length === 0) {
    return (
      <div className="border border-border rounded-lg p-4">
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">Pack Day</h3>
        <p className="text-sm text-muted-foreground/50 text-center py-4">
          No orders in cook stage.
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
              {selectedFlavors.length} flavor{selectedFlavors.length !== 1 ? 's' : ''} &middot;{' '}
              {totalDemand.toLocaleString()} needed
              {totalNet < totalDemand && (
                <> &middot; {totalNet.toLocaleString()} to fill</>
              )}
            </p>
          )}
        </div>
      </div>

      {/* Order breakdown — why we're packing */}
      <div className="mb-4">
        <h4 className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-2">
          Orders Driving Demand
        </h4>
        <div className="space-y-1.5">
          {cookOrders.map(order => {
            const items = order.items.filter(i => (i.cases - i.packed) > 0)
            if (items.length === 0) return null
            const totalCases = items.reduce((s, i) => s + (i.cases - i.packed), 0)
            return (
              <div key={order.id} className="flex items-start gap-2 text-xs">
                <span className="text-orange-400 font-medium shrink-0 mt-px">{order.channel}</span>
                <span className="text-muted-foreground/70 shrink-0">{order.title}</span>
                <span className="text-muted-foreground/40 flex-1 truncate">
                  {items.map(i => `${i.cases - i.packed} ${i.flavor}`).join(', ')}
                </span>
                <span className="tabular-nums text-muted-foreground/50 shrink-0">
                  {totalCases} cs
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Flavor toggles */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {FLAVORS.map(f => {
          const isSelected = selectedFlavors.includes(f)
          const isSuggested = suggestedFlavors.includes(f)
          const demand = bottlesDemand[f] || 0
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
              {demand > 0 && (
                <span className={`tabular-nums text-[10px] ${isSelected && isSuggested ? 'opacity-80' : 'opacity-50'}`}>
                  {demand}
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
              <div className="rounded-md bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-400">
                <span className="font-medium">All prepped &mdash; ready to pack</span>
                <div className="mt-1 opacity-80 italic">{verdict}</div>
              </div>
            ) : (
              <div className="space-y-1">
                {prepIssues.map((issue, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-md bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 text-xs text-amber-700 dark:text-amber-400">
                    {issue.flavor ? flavorDot(issue.flavor) : <span className="inline-block w-2.5 h-2.5 rounded-full bg-muted-foreground/30 shrink-0" />}
                    <span>{issue.message}</span>
                  </div>
                ))}
                {/* Verdict under the issues too */}
                <div className="text-[11px] text-muted-foreground/50 italic pt-1 px-1">
                  {verdict}
                </div>
              </div>
            )}
          </div>

          {/* Section B — Pack Order (Morning-of) with full math */}
          <div>
            <h4 className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-2">
              Pack Order &middot; Morning Of
            </h4>
            <div className="space-y-2">
              {selectedFlavors.map((flavor, idx) => {
                const demand = bottlesDemand[flavor] || 0
                const demandCases = casesNeeded[flavor] || 0
                const in6 = packed[flavor] || 0
                const in6cases = Math.floor(in6 / 6)
                const in25 = packed25[flavor] || 0
                const drumCount = drums[flavor] || 0
                const drumBtls = Math.round(drumCount * DRUM_BOTTLES)
                const net = bottlesNet[flavor] || 0
                const netCases = Math.ceil(net / 6)
                const boxHave = boxes[flavor] || 0
                const boxNeed = demandCases
                const boxMake = Math.max(0, boxNeed - boxHave)
                const { hasSauce, hasCaps, hasLabels, hasBoxes } = getReadiness(flavor)

                return (
                  <div
                    key={flavor}
                    className="rounded-md border border-border/50 px-3 py-2.5"
                  >
                    {/* Row 1: step + flavor + demand */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold tabular-nums text-muted-foreground/40 w-4 text-right">
                        {idx + 1}.
                      </span>
                      {flavorDot(flavor)}
                      <span className="text-sm font-medium">{flavor}</span>
                      <span className="text-xs tabular-nums text-muted-foreground ml-auto">
                        {demand > 0 ? `${demand} btls \u00b7 ${demandCases} cases needed` : 'stock run'}
                      </span>
                    </div>

                    {/* Row 2: inventory math */}
                    {demand > 0 && (
                      <div className="ml-7 space-y-0.5 text-[11px] tabular-nums text-muted-foreground/70 mb-2">
                        <div className="flex gap-4 flex-wrap">
                          <span>
                            <span className="text-muted-foreground/40">6-pk:</span>{' '}
                            <span className={in6 > 0 ? 'text-emerald-500' : ''}>
                              {in6} btls ({in6cases} cs)
                            </span>
                          </span>
                          <span>
                            <span className="text-muted-foreground/40">25-pk:</span>{' '}
                            <span className={in25 > 0 ? 'text-amber-400' : ''}>
                              {in25} btls
                            </span>
                            {in25 > 0 && <span className="text-amber-400/60"> &rarr; rebox</span>}
                          </span>
                          <span>
                            <span className="text-muted-foreground/40">drums:</span>{' '}
                            {drumCount > 0
                              ? <>{drumCount} ({drumBtls} btls)</>
                              : <span className="text-muted-foreground/30">0</span>
                            }
                          </span>
                        </div>
                        <div className="pt-0.5">
                          {net > 0 ? (
                            <span className="text-foreground font-medium">
                              &rarr; bottle {net} from drums &rarr; box into {netCases} cases
                            </span>
                          ) : (
                            <span className="text-emerald-500 font-medium">
                              &rarr; covered &mdash; {in6 + in25} btls ready
                              {in25 > 0 && ` (${in25} need reboxing)`}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Row 3: readiness checks */}
                    <div className="ml-7 flex items-center gap-3 text-xs tabular-nums flex-wrap">
                      <span>{checkMark(hasSauce)} <span className="text-muted-foreground/50">sauce</span></span>
                      <span>{checkMark(hasCaps)} <span className="text-muted-foreground/50">caps</span></span>
                      <span>{checkMark(hasLabels)} <span className="text-muted-foreground/50">labels</span></span>
                      <span>
                        {checkMark(hasBoxes)} <span className="text-muted-foreground/50">boxes</span>
                        {demand > 0 && (
                          <span className="text-muted-foreground/40 ml-1">
                            ({boxHave}/{boxNeed}{boxMake > 0 && <>, make {boxMake}</>})
                          </span>
                        )}
                      </span>
                    </div>
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
