'use client'

import { useState, useMemo, useCallback } from 'react'
import { useOrderStore } from '@/store/order-store'

const FLAVORS = ['Hot', 'Mild', 'Mango', 'Truffle', 'Sriracha', 'Thai'] as const

// Confirmed Feb 2026
const OLLA_YIELDS: Record<string, number> = {
  Hot: 325, Mild: 325, Truffle: 325, Thai: 325,
  Mango: 450, Sriracha: 450,
}

const BATCHES_PER_OLLA: Record<string, number> = {
  Hot: 4, Mild: 4, Truffle: 4, Thai: 4,
  Mango: 2, Sriracha: 2,
}

// Per-batch ingredient needs for standard flavors (Hot/Mild/Truffle/Thai)
// Derived from 3-olla / 12-batch baseline (400lb carrots, etc.)
const STD_BATCH: Record<string, { amt: number; unit: string }> = {
  carrots:  { amt: 33.33, unit: 'lb' },
  garlic:   { amt: 12.5,  unit: 'lb' },
  lime:     { amt: 1.67,  unit: 'gal' },
  culantro: { amt: 3.5,   unit: 'lb' },
  habanero: { amt: 1.67,  unit: 'lb' },
  acv:      { amt: 3.33,  unit: 'gal' },
  salt:     { amt: 4.17,  unit: 'lb' },
}

// Per-batch for Sriracha
const SRI_BATCH: Record<string, { amt: number; unit: string; kitchen?: boolean }> = {
  red_jalapeno: { amt: 25, unit: 'lb' },
  garlic:       { amt: 13, unit: 'lb' },
  sugar:        { amt: 4,  unit: 'lb' },
  salt:         { amt: 3,  unit: 'lb' },
  white_vinegar:{ amt: 11, unit: 'lb', kitchen: true },
  water:        { amt: 10, unit: 'lb', kitchen: true },
}

// Per-batch for Mango
const MANGO_BATCH: Record<string, { amt: number; unit: string }> = {
  mango_fruit: { amt: 50,    unit: 'lb' },
  carrots:     { amt: 33.33, unit: 'lb' },
  garlic:      { amt: 12.5,  unit: 'lb' },
  lime:        { amt: 1.67,  unit: 'gal' },
  culantro:    { amt: 3.5,   unit: 'lb' },
  habanero:    { amt: 1.67,  unit: 'lb' },
  acv:         { amt: 3.33,  unit: 'gal' },
  salt:        { amt: 4.17,  unit: 'lb' },
}

// Purchasable units from Deep + pricing
const UNITS: Record<string, {
  pkg: number; unit: string; label: string; name: string; pLo: number; pHi: number
}> = {
  carrots:      { pkg: 25,  unit: 'lb',  label: '25lb bag',    name: 'carrots',             pLo: 18,    pHi: 28 },
  garlic:       { pkg: 30,  unit: 'lb',  label: '30lb box',    name: 'garlic',              pLo: 80,    pHi: 109 },
  lime:         { pkg: 4,   unit: 'gal', label: 'case (4gal)', name: 'lime juice',          pLo: 58,    pHi: 58 },
  culantro:     { pkg: 14,  unit: 'lb',  label: '14lb box',    name: 'culantro',            pLo: 69,    pHi: 69 },
  habanero:     { pkg: 10,  unit: 'lb',  label: '~10lb box',   name: 'habanero',            pLo: 28,    pHi: 30 },
  acv:          { pkg: 4,   unit: 'gal', label: 'case (4gal)', name: 'apple cider vinegar', pLo: 38.75, pHi: 38.75 },
  salt:         { pkg: 50,  unit: 'lb',  label: '50lb bag',    name: 'salt',                pLo: 13,    pHi: 14 },
  red_jalapeno: { pkg: 25,  unit: 'lb',  label: '~25lb case',  name: 'red jalapeno',        pLo: 44.75, pHi: 44.75 },
  sugar:        { pkg: 50,  unit: 'lb',  label: '50lb bag',    name: 'cane sugar',          pLo: 37,    pHi: 37 },
  mango_fruit:  { pkg: 30,  unit: 'lb',  label: '30lb case',   name: 'mango',               pLo: 46.50, pHi: 46.50 },
}

const DELIVERY_FEE = 80

const SORT_ORDER = ['carrots', 'garlic', 'lime', 'culantro', 'habanero', 'acv', 'salt', 'red_jalapeno', 'sugar', 'mango_fruit']

function getRecipe(flavor: string) {
  if (flavor === 'Sriracha') return SRI_BATCH
  if (flavor === 'Mango') return MANGO_BATCH
  return STD_BATCH
}

export function CookPlanner() {
  const orders = useOrderStore(s => s.orders)
  const [ollas, setOllas] = useState<Record<string, number>>({})
  const [copied, setCopied] = useState(false)

  // Demand totals from active orders (bottles per flavor)
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

  const totalOllas = useMemo(
    () => FLAVORS.reduce((sum, f) => sum + (ollas[f] || 0), 0),
    [ollas]
  )

  // Calculate ingredients needed
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

  // Build copyable text
  const copyText = useMemo(() => {
    return ingredientRows.rows.map(r => {
      if (r.unit === 'gal') {
        return `${r.ordered} gallons ${r.u.name} (${r.pkgs} cases)`
      }
      return `${r.ordered}lb ${r.u.name} (${r.pkgs} ${r.u.label}${r.pkgs > 1 ? 's' : ''})`
    }).join('\n')
  }, [ingredientRows])

  const handleOllaChange = useCallback((flavor: string, value: number) => {
    setOllas(prev => ({ ...prev, [flavor]: Math.max(0, Math.min(9, value)) }))
  }, [])

  const handleCopy = useCallback(async () => {
    if (!copyText) return
    await navigator.clipboard.writeText(copyText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [copyText])

  return (
    <div className="space-y-6">
      {/* Cook Planner */}
      <div className="border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Cook Planner
          </h3>
          <span className="text-[10px] text-muted-foreground/50 tabular-nums">
            {totalOllas > 0 ? `${totalOllas} olla${totalOllas > 1 ? 's' : ''} planned` : 'Set ollas below'}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="pb-2 pr-4"></th>
                {FLAVORS.map(f => (
                  <th key={f} className="pb-2 text-right px-2 min-w-[52px]">{f}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Ollas to Cook (editable) */}
              <tr className="border-t border-border/50">
                <td className="py-1.5 pr-4 font-medium">Ollas to Cook</td>
                {FLAVORS.map(f => (
                  <td key={f} className="py-1.5 text-right px-2">
                    <input
                      type="number"
                      min={0}
                      max={9}
                      value={ollas[f] || 0}
                      onChange={e => handleOllaChange(f, parseInt(e.target.value) || 0)}
                      className="w-12 text-right tabular-nums bg-transparent border border-border/50 rounded px-1.5 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-foreground/20"
                    />
                  </td>
                ))}
              </tr>

              {/* Bottles Produced */}
              <tr className="border-t border-border/50">
                <td className="py-1.5 pr-4 font-medium">Bottles Produced</td>
                {FLAVORS.map(f => {
                  const v = (ollas[f] || 0) * OLLA_YIELDS[f]
                  return (
                    <td key={f} className="py-1.5 text-right tabular-nums px-2">
                      {v > 0 ? v.toLocaleString() : <span className="text-muted-foreground/20">&mdash;</span>}
                    </td>
                  )
                })}
              </tr>

              {/* Surplus After Orders */}
              <tr className="border-t border-border font-semibold">
                <td className="pt-2 pr-4">Surplus After Orders</td>
                {FLAVORS.map(f => {
                  const produced = (ollas[f] || 0) * OLLA_YIELDS[f]
                  const demand = demandTotals[f] || 0
                  const surplus = produced - demand
                  if (produced === 0 && demand === 0) {
                    return (
                      <td key={f} className="pt-2 text-right tabular-nums px-2">
                        <span className="text-muted-foreground/20">&mdash;</span>
                      </td>
                    )
                  }
                  return (
                    <td key={f} className={`pt-2 text-right tabular-nums px-2 ${
                      surplus < 0 ? 'text-red-500' : 'text-green-600'
                    }`}>
                      {surplus >= 0 ? '+' : ''}{surplus.toLocaleString()}
                    </td>
                  )
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Deep Order */}
      {ingredientRows.rows.length > 0 && (
        <div className="border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Deep Order
            </h3>
            <span className="text-[10px] text-muted-foreground/50">
              Auto-calculated from cook plan
            </span>
          </div>
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
                  const u = r.u
                  const costStr = r.costLo === r.costHi
                    ? `$${r.costLo.toFixed(0)}`
                    : `$${r.costLo.toFixed(0)}–$${r.costHi.toFixed(0)}`

                  return (
                    <tr key={r.ing} className="border-t border-border/50">
                      <td className="py-1.5 pr-4 font-medium capitalize">{u.name}</td>
                      <td className="py-1.5 text-right tabular-nums px-2">
                        {r.rawAmt} {r.unit}
                      </td>
                      <td className="py-1.5 text-right tabular-nums px-2 font-semibold">
                        <div>{r.ordered} {r.unit}</div>
                        <div className="text-[10px] text-muted-foreground/50 font-normal">
                          {r.pkgs} × {u.label}
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
                  <td className="py-1.5 text-right tabular-nums px-2"></td>
                  <td className="py-1.5 text-right tabular-nums px-2"></td>
                  <td className="py-1.5 text-right tabular-nums px-2">${DELIVERY_FEE}</td>
                  <td className="py-1.5 text-right tabular-nums px-2"></td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="border-t border-border font-semibold">
                  <td className="pt-2 pr-4">Total</td>
                  <td className="pt-2 text-right tabular-nums px-2"></td>
                  <td className="pt-2 text-right tabular-nums px-2"></td>
                  <td className="pt-2 text-right tabular-nums px-2">
                    {ingredientRows.totalLo === ingredientRows.totalHi
                      ? `$${ingredientRows.totalLo.toFixed(0)}`
                      : `$${ingredientRows.totalLo.toFixed(0)}–$${ingredientRows.totalHi.toFixed(0)}`
                    }
                  </td>
                  <td className="pt-2 text-right tabular-nums px-2"></td>
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
              {copied ? '✅ Copied!' : '📋 Copy List'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
