'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { useOrderStore } from '@/store/order-store'
import {
  useProductionStore,
  FLAVORS,
  OLLA_YIELDS,
  BATCHES_PER_OLLA,
  DRUM_BOTTLES,
  UNITS,
  DELIVERY_FEE,
  SORT_ORDER,
  MATERIAL_STATUSES,
  getRecipe,
} from '@/store/production-store'
import type { MaterialStatus } from '@/store/production-store'

// ── Flavor colors ──────────────────────────────────────────────

const FLAVOR_COLORS: Record<string, string> = {
  Hot: '#CC0000',
  Mild: '#3BA226',
  Mango: '#F5D623',
  Truffle: '#1A1A1A',
  Sriracha: '#2B6EC2',
  Thai: '#F5D623',
}

const STATUS_COLORS: Record<MaterialStatus, string> = {
  Have: 'bg-green-500/15 text-green-700 dark:text-green-400',
  Low: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400',
  Order: 'bg-red-500/15 text-red-600 dark:text-red-400',
  OTW: 'bg-orange-500/15 text-orange-700 dark:text-orange-400',
}

// ── Component ──────────────────────────────────────────────────

export function CookPlanner() {
  const orders = useOrderStore(s => s.orders)

  const {
    initialized, fetchProduction,
    packed, drums, ollas, materials,
    setPacked, setDrums, setOllas,
    cycleMaterialStatus, setMaterialNote,
  } = useProductionStore()

  const [copied, setCopied] = useState(false)

  useEffect(() => { fetchProduction() }, [fetchProduction])

  // ── Demand totals (bottles per flavor from active orders) ────
  const demandTotals = useMemo(() => {
    const t: Record<string, number> = {}
    for (const order of orders) {
      if (order.stage !== 'new' && order.stage !== 'processing') continue
      for (const item of order.items) {
        t[item.flavor] = (t[item.flavor] || 0) + item.cases * 6
      }
    }
    return t
  }, [orders])

  // ── Inventory per flavor ────────────────────────────────────
  const inventory = useMemo(() => {
    const inv: Record<string, { packed: number; drumBottles: number; total: number }> = {}
    for (const f of FLAVORS) {
      const p = packed[f] || 0
      const dw = (drums[f] || 0) * DRUM_BOTTLES
      inv[f] = { packed: p, drumBottles: dw, total: p + dw }
    }
    return inv
  }, [packed, drums])

  // ── Gap analysis ────────────────────────────────────────────
  const gaps = useMemo(() => {
    const g: Record<string, number> = {}
    for (const f of FLAVORS) {
      g[f] = (demandTotals[f] || 0) - (inventory[f]?.total || 0)
    }
    return g
  }, [demandTotals, inventory])

  // ── Cook plan calculations ──────────────────────────────────
  const cookCalc = useMemo(() => {
    const totalOllas = FLAVORS.reduce((sum, f) => sum + (ollas[f] || 0), 0)
    const produced: Record<string, number> = {}
    const postCook: Record<string, number> = {}
    const surplus: Record<string, number> = {}

    for (const f of FLAVORS) {
      produced[f] = (ollas[f] || 0) * OLLA_YIELDS[f]
      postCook[f] = (inventory[f]?.total || 0) + produced[f]
      surplus[f] = postCook[f] - (demandTotals[f] || 0)
    }

    return { totalOllas, produced, postCook, surplus }
  }, [ollas, inventory, demandTotals])

  // ── Ingredients ─────────────────────────────────────────────
  const ingredients = useMemo(() => {
    const needs: Record<string, { amt: number; unit: string }> = {}
    for (const f of FLAVORS) {
      const o = ollas[f] || 0
      if (o <= 0) continue
      const batches = o * BATCHES_PER_OLLA[f]
      const recipe = getRecipe(f)
      for (const [ing, r] of Object.entries(recipe)) {
        if ('kitchen' in r && r.kitchen) continue
        if (!needs[ing]) needs[ing] = { amt: 0, unit: r.unit }
        needs[ing].amt += r.amt * batches
      }
    }
    return needs
  }, [ollas])

  const ingredientRows = useMemo(() => {
    const keys = Object.keys(ingredients).sort(
      (a, b) => (SORT_ORDER.indexOf(a) === -1 ? 99 : SORT_ORDER.indexOf(a)) -
                (SORT_ORDER.indexOf(b) === -1 ? 99 : SORT_ORDER.indexOf(b))
    )

    let totalLo = 0
    let totalHi = 0

    const rows: {
      ing: string; rawAmt: number; pkgs: number; ordered: number;
      leftover: number; costLo: number; costHi: number; unit: string;
      u: typeof UNITS[string]
    }[] = []

    for (const ing of keys) {
      const n = ingredients[ing]
      const u = UNITS[ing]
      if (!u) continue

      const rawAmt = Math.round(n.amt)
      const pkgs = Math.ceil(n.amt / u.pkg)
      const ordered = pkgs * u.pkg
      const leftover = Math.round(ordered - n.amt)
      const costLo = pkgs * u.pLo
      const costHi = pkgs * u.pHi
      totalLo += costLo
      totalHi += costHi

      rows.push({ ing, rawAmt, pkgs, ordered, leftover, costLo, costHi, unit: n.unit, u })
    }

    totalLo += DELIVERY_FEE
    totalHi += DELIVERY_FEE

    return { rows, totalLo, totalHi }
  }, [ingredients])

  // ── Tight spots (ingredients where ordered barely covers need) ──
  const tightSpots = useMemo(() => {
    const spots: string[] = []
    for (const r of ingredientRows.rows) {
      const ratio = r.ordered / r.rawAmt
      if (ratio < 1.05 && r.rawAmt > 0) {
        spots.push(`${r.u.name}: need ${r.rawAmt}${r.unit}, ordering ${r.ordered}${r.unit}`)
      }
    }
    return spots
  }, [ingredientRows])

  // ── Copy text ───────────────────────────────────────────────
  const copyText = useMemo(() => {
    return ingredientRows.rows.map(r => {
      if (r.unit === 'gal') {
        return `${r.ordered} gallons ${r.u.name} (${r.pkgs} cases)`
      }
      return `${r.ordered}lb ${r.u.name} (${r.pkgs} ${r.u.label}${r.pkgs > 1 ? 's' : ''})`
    }).join('\n')
  }, [ingredientRows])

  // ── Handlers ────────────────────────────────────────────────

  const handleCopy = useCallback(async () => {
    if (!copyText) return
    await navigator.clipboard.writeText(copyText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [copyText])

  if (!initialized) {
    return (
      <div className="text-sm text-muted-foreground text-center py-8">
        Loading production data...
      </div>
    )
  }

  // ── Render helpers ──────────────────────────────────────────

  const numCell = (val: number, opts?: { color?: 'green' | 'red' | 'auto'; bold?: boolean; dash?: boolean }) => {
    if (opts?.dash && val === 0) {
      return <span className="text-muted-foreground/20">&mdash;</span>
    }
    let cls = 'tabular-nums'
    if (opts?.bold) cls += ' font-semibold'
    if (opts?.color === 'green') cls += ' text-green-600'
    if (opts?.color === 'red') cls += ' text-red-500'
    if (opts?.color === 'auto') cls += val < 0 ? ' text-red-500' : ' text-green-600'
    return <span className={cls}>{val >= 0 && opts?.color === 'auto' ? '+' : ''}{val.toLocaleString()}</span>
  }

  const flavorDot = (f: string) => (
    <span
      className="inline-block w-2 h-2 rounded-full mr-1.5 relative top-[-1px]"
      style={{ background: FLAVOR_COLORS[f] || '#999' }}
    />
  )

  const sectionHeader = (title: string, badge?: string) => (
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      {badge && (
        <span className="text-[10px] text-muted-foreground/50 tabular-nums">
          {badge}
        </span>
      )}
    </div>
  )

  const flavorHeaders = (
    <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
      <th className="pb-2 pr-4"></th>
      {FLAVORS.map(f => (
        <th key={f} className="pb-2 text-right px-2 min-w-[52px]">
          {flavorDot(f)}{f}
        </th>
      ))}
    </tr>
  )

  // ── Grand totals for the header badges ──────────────────────

  const totalDemandBottles = Object.values(demandTotals).reduce((a, b) => a + b, 0)
  const totalInventoryBottles = FLAVORS.reduce((sum, f) => sum + (inventory[f]?.total || 0), 0)
  const totalGap = totalDemandBottles - totalInventoryBottles

  return (
    <div className="space-y-6">

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 🔥 FLAVOR SNAPSHOT — What We Have                         */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="border border-border rounded-lg p-4">
        {sectionHeader('🔥 Flavor Snapshot', `${totalInventoryBottles.toLocaleString()} bottles total`)}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>{flavorHeaders}</thead>
            <tbody>
              {/* Packed Bottles (editable) */}
              <tr className="border-t border-border/50">
                <td className="py-1.5 pr-4 font-medium">Packed Bottles</td>
                {FLAVORS.map(f => (
                  <td key={f} className="py-1.5 text-right px-2">
                    <input
                      type="number"
                      min={0}
                      value={packed[f] || 0}
                      onChange={e => setPacked(f, parseInt(e.target.value) || 0)}
                      className="w-14 text-right tabular-nums bg-transparent border border-border/50 rounded px-1.5 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-foreground/20"
                    />
                  </td>
                ))}
              </tr>

              {/* 6-Packs (cases) */}
              <tr className="border-t border-border/50 text-muted-foreground text-xs">
                <td className="py-1 pr-4">→ Cases (÷6)</td>
                {FLAVORS.map(f => (
                  <td key={f} className="py-1 text-right tabular-nums px-2">
                    {numCell(Math.floor((packed[f] || 0) / 6), { dash: true })}
                  </td>
                ))}
              </tr>

              {/* Botes / Drums (editable) */}
              <tr className="border-t border-border/50">
                <td className="py-1.5 pr-4 font-medium">Botes (drums)</td>
                {FLAVORS.map(f => (
                  <td key={f} className="py-1.5 text-right px-2">
                    <input
                      type="number"
                      min={0}
                      value={drums[f] || 0}
                      onChange={e => setDrums(f, parseInt(e.target.value) || 0)}
                      className="w-14 text-right tabular-nums bg-transparent border border-border/50 rounded px-1.5 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-foreground/20"
                    />
                  </td>
                ))}
              </tr>

              {/* Drum bottles */}
              <tr className="border-t border-border/50 text-muted-foreground text-xs">
                <td className="py-1 pr-4">→ Bottles (×{DRUM_BOTTLES})</td>
                {FLAVORS.map(f => (
                  <td key={f} className="py-1 text-right tabular-nums px-2">
                    {numCell(inventory[f]?.drumBottles || 0, { dash: true })}
                  </td>
                ))}
              </tr>

              {/* Total inventory */}
              <tr className="border-t border-border font-semibold">
                <td className="pt-2 pr-4">Total Inventory</td>
                {FLAVORS.map(f => (
                  <td key={f} className="pt-2 text-right tabular-nums px-2">
                    {numCell(inventory[f]?.total || 0, { bold: true, dash: true })}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 📊 GAP ANALYSIS — Have vs Need                            */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="border border-border rounded-lg p-4">
        {sectionHeader('📊 Gap Analysis', totalGap > 0 ? `${totalGap.toLocaleString()} bottles short` : 'Fully stocked')}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>{flavorHeaders}</thead>
            <tbody>
              <tr className="border-t border-border/50">
                <td className="py-1.5 pr-4 font-medium">Order Demand</td>
                {FLAVORS.map(f => (
                  <td key={f} className="py-1.5 text-right tabular-nums px-2">
                    {numCell(demandTotals[f] || 0, { dash: true })}
                  </td>
                ))}
              </tr>
              <tr className="border-t border-border/50">
                <td className="py-1.5 pr-4 font-medium">Have (total)</td>
                {FLAVORS.map(f => (
                  <td key={f} className="py-1.5 text-right tabular-nums px-2">
                    {numCell(inventory[f]?.total || 0, { dash: true, color: (inventory[f]?.total || 0) > 0 ? 'green' : undefined })}
                  </td>
                ))}
              </tr>
              <tr className="border-t border-border font-semibold">
                <td className="pt-2 pr-4">Gap</td>
                {FLAVORS.map(f => {
                  const gap = gaps[f]
                  if ((demandTotals[f] || 0) === 0 && (inventory[f]?.total || 0) === 0) {
                    return (
                      <td key={f} className="pt-2 text-right tabular-nums px-2">
                        <span className="text-muted-foreground/20">&mdash;</span>
                      </td>
                    )
                  }
                  return (
                    <td key={f} className="pt-2 text-right tabular-nums px-2">
                      {numCell(gap <= 0 ? Math.abs(gap) : -gap, { color: 'auto', bold: true })}
                    </td>
                  )
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 🍳 COOK PLANNER — Plan Your Ollas                         */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="border border-border rounded-lg p-4">
        {sectionHeader(
          '🍳 Cook Planner',
          cookCalc.totalOllas > 0
            ? `${cookCalc.totalOllas} olla${cookCalc.totalOllas > 1 ? 's' : ''} planned`
            : 'Set ollas below'
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>{flavorHeaders}</thead>
            <tbody>
              {/* Ollas (editable) */}
              <tr className="border-t border-border/50">
                <td className="py-1.5 pr-4 font-medium">Ollas to Cook</td>
                {FLAVORS.map(f => (
                  <td key={f} className="py-1.5 text-right px-2">
                    <input
                      type="number"
                      min={0}
                      max={9}
                      value={ollas[f] || 0}
                      onChange={e => setOllas(f, parseInt(e.target.value) || 0)}
                      className="w-12 text-right tabular-nums bg-transparent border border-border/50 rounded px-1.5 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-foreground/20"
                    />
                  </td>
                ))}
              </tr>

              {/* Bottles produced */}
              <tr className="border-t border-border/50">
                <td className="py-1.5 pr-4 font-medium">Bottles Produced</td>
                {FLAVORS.map(f => (
                  <td key={f} className="py-1.5 text-right tabular-nums px-2">
                    {numCell(cookCalc.produced[f], { dash: true })}
                  </td>
                ))}
              </tr>

              {/* Post-Cook Total */}
              <tr className="border-t border-border/50">
                <td className="py-1.5 pr-4 font-medium">Post-Cook Total</td>
                {FLAVORS.map(f => (
                  <td key={f} className="py-1.5 text-right tabular-nums px-2">
                    {numCell(cookCalc.postCook[f], { dash: true })}
                  </td>
                ))}
              </tr>

              {/* Surplus After Orders */}
              <tr className="border-t border-border font-semibold">
                <td className="pt-2 pr-4">Surplus After Orders</td>
                {FLAVORS.map(f => {
                  const s = cookCalc.surplus[f]
                  if (cookCalc.produced[f] === 0 && (demandTotals[f] || 0) === 0 && (inventory[f]?.total || 0) === 0) {
                    return (
                      <td key={f} className="pt-2 text-right tabular-nums px-2">
                        <span className="text-muted-foreground/20">&mdash;</span>
                      </td>
                    )
                  }
                  return (
                    <td key={f} className="pt-2 text-right tabular-nums px-2">
                      {numCell(s, { color: 'auto', bold: true })}
                    </td>
                  )
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 🥕 DEEP ORDER — Ingredient Shopping List                   */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {ingredientRows.rows.length > 0 && (
        <div className="border border-border rounded-lg p-4">
          {sectionHeader('🥕 Deep Order', 'Auto-calculated from cook plan')}

          {/* Tight spots warning */}
          {tightSpots.length > 0 && (
            <div className="mb-3 p-2 rounded bg-yellow-500/10 border border-yellow-500/20 text-xs text-yellow-700 dark:text-yellow-400">
              <span className="font-medium">⚠️ Tight fit:</span>{' '}
              {tightSpots.join(' · ')}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                  <th className="pb-2 pr-4">Ingredient</th>
                  <th className="pb-2 text-right px-2">Need</th>
                  <th className="pb-2 text-right px-2">Ordering</th>
                  <th className="pb-2 text-right px-2">Est. Cost</th>
                  <th className="pb-2 text-right px-2">Leftover</th>
                </tr>
              </thead>
              <tbody>
                {ingredientRows.rows.map(r => {
                  const costStr = r.costLo === r.costHi
                    ? `$${r.costLo.toFixed(0)}`
                    : `$${r.costLo.toFixed(0)}–$${r.costHi.toFixed(0)}`

                  return (
                    <tr key={r.ing} className="border-t border-border/50">
                      <td className="py-1.5 pr-4 font-medium capitalize">{r.u.name}</td>
                      <td className="py-1.5 text-right tabular-nums px-2">
                        {r.rawAmt} {r.unit}
                      </td>
                      <td className="py-1.5 text-right tabular-nums px-2 font-semibold">
                        <div>{r.ordered} {r.unit}</div>
                        <div className="text-[10px] text-muted-foreground/50 font-normal">
                          {r.pkgs} × {r.u.label}
                        </div>
                      </td>
                      <td className="py-1.5 text-right tabular-nums px-2">{costStr}</td>
                      <td className={`py-1.5 text-right tabular-nums px-2 ${
                        r.leftover <= 0 ? 'text-muted-foreground/40' : 'text-green-600'
                      }`}>
                        {r.leftover <= 0 ? '~0' : `${r.leftover} ${r.unit}`}
                      </td>
                    </tr>
                  )
                })}
                {/* Delivery */}
                <tr className="border-t border-border/50">
                  <td className="py-1.5 pr-4 font-medium">Delivery</td>
                  <td className="py-1.5" />
                  <td className="py-1.5" />
                  <td className="py-1.5 text-right tabular-nums px-2">${DELIVERY_FEE}</td>
                  <td className="py-1.5" />
                </tr>
              </tbody>
              <tfoot>
                <tr className="border-t border-border font-semibold">
                  <td className="pt-2 pr-4">Total</td>
                  <td className="pt-2" />
                  <td className="pt-2" />
                  <td className="pt-2 text-right tabular-nums px-2">
                    {ingredientRows.totalLo === ingredientRows.totalHi
                      ? `$${ingredientRows.totalLo.toFixed(0)}`
                      : `$${ingredientRows.totalLo.toFixed(0)}–$${ingredientRows.totalHi.toFixed(0)}`
                    }
                  </td>
                  <td className="pt-2" />
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Copy button */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleCopy}
              className="text-xs font-medium uppercase tracking-wider px-4 py-2 rounded-full border border-foreground/20 hover:bg-foreground hover:text-background transition-colors"
            >
              {copied ? '✅ Copied!' : '📋 Copy Deep List'}
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 📦 MATERIALS — Caps, Labels, Packaging                     */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="border border-border rounded-lg p-4">
        {sectionHeader('📦 Materials', 'Tap status to cycle')}

        {/* Generic materials (non-flavor-specific) */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="pb-2 pr-4">Item</th>
                <th className="pb-2 px-2 w-20">Status</th>
                <th className="pb-2 px-2">Note</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((mat, idx) => {
                // Skip caps and labels — they get the flavor grid below
                if (mat.item.startsWith('Caps —') || mat.item.startsWith('Labels —')) return null
                return (
                  <tr key={mat.item} className="border-t border-border/50">
                    <td className="py-1.5 pr-4 font-medium">{mat.item}</td>
                    <td className="py-1.5 px-2">
                      <button
                        onClick={() => cycleMaterialStatus(idx)}
                        className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full cursor-pointer select-none active:scale-95 transition-transform ${
                          STATUS_COLORS[mat.status as MaterialStatus] || STATUS_COLORS.Have
                        }`}
                      >
                        {mat.status}
                      </button>
                    </td>
                    <td className="py-1.5 px-2">
                      <input
                        type="text"
                        value={mat.note}
                        onChange={e => setMaterialNote(idx, e.target.value)}
                        placeholder="—"
                        className="w-full bg-transparent text-sm border-none focus:outline-none focus:ring-0 placeholder:text-muted-foreground/20"
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Caps & Labels — flavor grid */}
        <div className="overflow-x-auto mt-4 pt-4 border-t border-border/50">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="pb-2 pr-4"></th>
                {FLAVORS.map(f => (
                  <th key={f} className="pb-2 text-center px-1 min-w-[60px]">
                    {flavorDot(f)}{f}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(['Caps', 'Labels'] as const).map(category => (
                <tr key={category} className="border-t border-border/50">
                  <td className="py-2 pr-4 font-medium">{category}</td>
                  {FLAVORS.map(f => {
                    const matName = `${category} — ${f}`
                    const idx = materials.findIndex(m => m.item === matName)
                    if (idx === -1) return <td key={f} className="py-2 text-center px-1"><span className="text-muted-foreground/20">&mdash;</span></td>
                    const mat = materials[idx]
                    return (
                      <td key={f} className="py-2 text-center px-1">
                        <button
                          onClick={() => cycleMaterialStatus(idx)}
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full cursor-pointer select-none active:scale-95 transition-transform ${
                            STATUS_COLORS[mat.status as MaterialStatus] || STATUS_COLORS.Have
                          }`}
                        >
                          {mat.status}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
