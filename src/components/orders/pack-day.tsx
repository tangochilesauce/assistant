'use client'

import { useMemo, useEffect } from 'react'
import { useOrderStore } from '@/store/order-store'
import { useInventoryStore } from '@/store/inventory-store'
import { FLAVORS, DRUM_BOTTLES, FLAVOR_COLORS } from '@/data/tango-constants'

// ── Pack rate (bottles per hour) ─────────────────────────────
// Based on real data: 2600 btl/8hr at peak, 1200 btl/8hr at slowest.
const PACK_RATE_FAST = 325   // bottles/hr (peak)
const PACK_RATE_SLOW = 150   // bottles/hr (sloppy day)

function formatTimeRange(bottles: number): string {
  if (bottles <= 0) return ''
  const fastMin = Math.round((bottles / PACK_RATE_FAST) * 60)
  const slowMin = Math.round((bottles / PACK_RATE_SLOW) * 60)
  const fmt = (m: number) => m >= 60 ? `${Math.floor(m / 60)}h${m % 60 ? ` ${m % 60}m` : ''}` : `${m}m`
  if (fastMin === slowMin) return fmt(fastMin)
  return `${fmt(fastMin)}–${fmt(slowMin)}`
}

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
    packed, packed25, drums, sealFilledCaps, labels, caseLabels, materials,
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
    const withDemand = packDayFlavors.filter(f => valid.has(f) && (bottlesDemand[f] || 0) > 0)
    return withDemand.length > 0 ? sortPackOrder(withDemand, bottlesDemand) : suggestedFlavors
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

  // Per-order case breakdown per flavor (SORTED by pickup date — earliest first)
  const orderBreakdown = useMemo(() => {
    const breakdown: Record<string, { title: string; channel: string; cases: number; pickupDate: string | null }[]> = {}
    // Sort cook orders by pickup date (earliest first, null = last)
    const sorted = [...cookOrders].sort((a, b) => {
      const da = a.pickupDate || a.dateStr || ''
      const db = b.pickupDate || b.dateStr || ''
      if (!da && !db) return 0
      if (!da) return 1
      if (!db) return -1
      return da.localeCompare(db)
    })
    for (const order of sorted) {
      for (const item of order.items) {
        const remaining = item.cases - item.packed
        if (remaining > 0) {
          if (!breakdown[item.flavor]) breakdown[item.flavor] = []
          breakdown[item.flavor].push({
            title: order.title,
            channel: order.channel,
            cases: remaining,
            pickupDate: order.pickupDate || order.dateStr || null,
          })
        }
      }
    }
    return breakdown
  }, [cookOrders])

  // Waterfall allocation: for each flavor, allocate stock across orders in priority order
  const flavorWaterfall = useMemo(() => {
    const result: Record<string, {
      steps: {
        title: string
        channel: string
        cases: number
        bottles: number
        from6pk: number
        from25pk: number
        fromDrums: number
        fulfilled: boolean
      }[]
      remaining6pk: number
      remaining25pk: number
      remainingDrumBtls: number
    }> = {}

    for (const f of FLAVORS) {
      const orders = orderBreakdown[f] || []
      let avail6 = packed[f] || 0
      let avail25 = packed25[f] || 0
      let availDrumBtls = Math.round((drums[f] || 0) * DRUM_BOTTLES)

      const steps = orders.map(ob => {
        const bottles = ob.cases * 6
        let remaining = bottles

        // Draw from 6-packs first (already boxed)
        const from6pk = Math.min(avail6, remaining)
        avail6 -= from6pk
        remaining -= from6pk

        // Then 25-packs (need reboxing)
        const from25pk = Math.min(avail25, remaining)
        avail25 -= from25pk
        remaining -= from25pk

        // Then fill from drums
        const fromDrums = Math.min(availDrumBtls, remaining)
        availDrumBtls -= fromDrums
        remaining -= fromDrums

        return {
          title: ob.title,
          channel: ob.channel,
          cases: ob.cases,
          bottles,
          from6pk,
          from25pk,
          fromDrums,
          fulfilled: remaining === 0,
        }
      })

      result[f] = {
        steps,
        remaining6pk: avail6,
        remaining25pk: avail25,
        remainingDrumBtls: availDrumBtls,
      }
    }
    return result
  }, [orderBreakdown, packed, packed25, drums])

  // Total box pool (shared across all flavors)
  const totalBoxesAvailable = useMemo(() => {
    return materials
      .filter(m => m.item.includes('6-Pack Box'))
      .reduce((s, m) => s + (m.quantity ?? 0), 0)
  }, [materials])

  const totalCasesNeeded = selectedFlavors.reduce((s, f) => s + (casesNeeded[f] || 0), 0)

  // Readiness checks
  const getReadiness = (flavor: string) => {
    const hasSauce = (packed[flavor] || 0) > 0 || (packed25[flavor] || 0) > 0 || (drums[flavor] || 0) > 0
    const hasCaps = sealFilledCaps[flavor] !== 'none' && sealFilledCaps[flavor] !== undefined
    const hasLabels = (labels[flavor] || 0) > 0
    const hasCaseLabels = (caseLabels[flavor] || 0) >= (casesNeeded[flavor] || 0)
    return { hasSauce, hasCaps, hasLabels, hasCaseLabels }
  }

  const emptyBottleMat = materials.find(m => m.item === 'Empty Bottles')
  const hasEmptyBottles = emptyBottleMat ? (emptyBottleMat.quantity ?? 0) > 0 : false

  // Prep issues
  const prepIssues = useMemo(() => {
    const issues: { flavor: string; message: string }[] = []
    for (const flavor of selectedFlavors) {
      const { hasSauce, hasCaps, hasLabels, hasCaseLabels } = getReadiness(flavor)
      const in25 = packed25[flavor] || 0
      if (in25 > 0) {
        issues.push({ flavor, message: `Rebox ${in25} ${flavor} bottles from 25-packs to 6-packs` })
      }
      if (!hasCaps) {
        const netToFill = Math.max(0, (bottlesDemand[flavor] || 0) - (packed[flavor] || 0) - (packed25[flavor] || 0))
        if (netToFill > 0) {
          issues.push({ flavor, message: `Stuff seals into ${netToFill} ${flavor} caps` })
        }
      }
      if (!hasCaseLabels) {
        const need = casesNeeded[flavor] || 0
        const have = caseLabels[flavor] || 0
        issues.push({ flavor, message: `Need ${need - have} ${flavor} case labels (have ${have}, need ${need})` })
      }
      if (!hasLabels) issues.push({ flavor, message: `Need ${flavor} labels` })
      if (!hasSauce) issues.push({ flavor, message: `No ${flavor} sauce ready (no drums or packed bottles)` })
    }
    // Total box check (shared pool)
    if (totalCasesNeeded > totalBoxesAvailable && selectedFlavors.length > 0) {
      const short = totalCasesNeeded - totalBoxesAvailable
      issues.push({ flavor: '', message: `${totalBoxesAvailable} boxes available, ${totalCasesNeeded} needed — ${short} short` })
    }
    if (!hasEmptyBottles && selectedFlavors.length > 0) {
      issues.push({ flavor: '', message: 'Need empty bottles' })
    }
    return issues
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFlavors, packed, packed25, drums, sealFilledCaps, labels, caseLabels, materials, casesNeeded, totalBoxesAvailable, totalCasesNeeded, bottlesDemand])

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
              {totalDemand > 0 && (
                <> &middot; ~{formatTimeRange(totalDemand)}</>
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
          const demand = bottlesDemand[f] || 0
          return (
            <button
              key={f}
              onClick={() => toggleFlavor(f)}
              className={`
                inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                transition-all cursor-pointer select-none text-white
                ${isSelected ? 'shadow-sm' : 'opacity-40 hover:opacity-60'}
              `}
              style={{ background: FLAVOR_COLORS[f] || '#999' }}
            >
              {f}
              <span className="tabular-nums text-[10px] opacity-80">
                {demand || 0}
              </span>
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
                const in25 = packed25[flavor] || 0
                const drumCount = drums[flavor] || 0
                const drumBtls = Math.round(drumCount * DRUM_BOTTLES)
                const wf = flavorWaterfall[flavor]
                const { hasSauce, hasCaps, hasLabels, hasCaseLabels } = getReadiness(flavor)

                return (
                  <div
                    key={flavor}
                    className="rounded-md border border-border/50 px-3 py-2.5"
                  >
                    {/* Row 1: step + flavor + demand */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold tabular-nums text-muted-foreground/40 w-4 text-right">
                        {idx + 1}.
                      </span>
                      {flavorDot(flavor)}
                      <span className="text-sm font-medium">{flavor}</span>
                      <span className="text-xs tabular-nums text-muted-foreground ml-auto">
                        {demand > 0 ? (
                          <>
                            {demand} btls &middot; {demandCases} cs
                            <span className="text-muted-foreground/40 ml-1">~{formatTimeRange(demand)}</span>
                          </>
                        ) : 'stock run'}
                      </span>
                    </div>

                    {/* Stock snapshot */}
                    {demand > 0 && (
                      <div className="ml-7 flex gap-4 flex-wrap text-[11px] tabular-nums text-muted-foreground/50 mb-2">
                        <span>6-pk: <span className={in6 > 0 ? 'text-emerald-500' : ''}>{in6}</span></span>
                        <span>25-pk: <span className={in25 > 0 ? 'text-amber-400' : ''}>{in25}</span></span>
                        <span>drums: {drumCount > 0 ? <>{drumCount} ({drumBtls} btls)</> : <span className="text-muted-foreground/30">0</span>}</span>
                      </div>
                    )}

                    {/* Waterfall: per-order allocation */}
                    {wf && wf.steps.length > 0 && (
                      <div className="ml-7 space-y-2 mb-2">
                        {wf.steps.map((step, si) => {
                          const sources: string[] = []
                          if (step.from6pk > 0) sources.push(`${step.from6pk} from 6-pk stock`)
                          if (step.from25pk > 0) sources.push(`${step.from25pk} from 25-pk \u2192 rebox`)
                          if (step.fromDrums > 0) sources.push(`${step.fromDrums} from drums`)
                          const filled = step.from6pk + step.from25pk + step.fromDrums
                          const short = step.bottles - filled

                          return (
                            <div key={si} className="border-l-2 pl-2.5 py-0.5" style={{ borderColor: step.fulfilled ? '#22c55e' : '#ef4444' }}>
                              <div className="flex items-center gap-1.5 text-[11px]">
                                <span className="font-medium text-orange-400">{step.channel}</span>
                                <span className="text-muted-foreground/60">{step.title}</span>
                                <span className="text-muted-foreground/40 tabular-nums ml-auto">
                                  {step.cases} cs &middot; {step.bottles} btls &middot; ~{formatTimeRange(step.bottles)}
                                </span>
                              </div>
                              <div className="text-[11px] tabular-nums text-muted-foreground/70 mt-0.5">
                                {sources.length > 0 ? (
                                  <span>&rarr; {sources.join(', ')}</span>
                                ) : (
                                  <span className="text-red-400">&rarr; no stock available</span>
                                )}
                              </div>
                              {step.fulfilled ? (
                                <div className="text-[11px] text-emerald-500 font-medium mt-0.5">
                                  &#10003; covered
                                </div>
                              ) : (
                                <div className="text-[11px] text-red-400 font-medium mt-0.5">
                                  &rarr; {short} bottles short — need more drums
                                </div>
                              )}
                            </div>
                          )
                        })}

                        {/* Post-orders leftover */}
                        {(wf.remaining6pk > 0 || wf.remaining25pk > 0 || wf.remainingDrumBtls > 0) && (
                          <div className="text-[11px] tabular-nums text-muted-foreground/50 pt-1 border-t border-border/30">
                            <span className="text-muted-foreground/40">leftover after orders:</span>{' '}
                            {[
                              wf.remaining6pk > 0 && `${wf.remaining6pk} in 6-pks`,
                              wf.remaining25pk > 0 && `${wf.remaining25pk} in 25-pks`,
                              wf.remainingDrumBtls > 0 && `${wf.remainingDrumBtls} in drums`,
                            ].filter(Boolean).join(', ')}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Readiness checks */}
                    <div className="ml-7 flex items-center gap-3 text-xs tabular-nums flex-wrap">
                      <span>{checkMark(hasSauce)} <span className="text-muted-foreground/50">sauce</span></span>
                      <span>{checkMark(hasCaps)} <span className="text-muted-foreground/50">caps</span></span>
                      <span>{checkMark(hasLabels)} <span className="text-muted-foreground/50">labels</span></span>
                      <span>{checkMark(hasCaseLabels)} <span className="text-muted-foreground/50">case lbl</span></span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Verdict — bottom of card */}
          <div className="text-sm text-muted-foreground italic pt-1 border-t border-border/30 mt-1">
            {verdict}
          </div>
        </div>
      )}
    </div>
  )
}
