import { useMemo } from 'react'
import { useOrderStore } from '@/store/order-store'
import { useInventoryStore } from '@/store/inventory-store'
import { useCookPlanStore } from '@/store/cook-plan-store'
import {
  FLAVORS,
  DRUM_BOTTLES,
  OLLA_YIELDS,
  BATCHES_PER_OLLA,
  UNITS,
  DELIVERY_FEE,
  SORT_ORDER,
  getRecipe,
} from '@/data/tango-constants'

export function useCookCalculations() {
  const orders = useOrderStore(s => s.orders)
  const packed = useInventoryStore(s => s.packed)
  const packed25 = useInventoryStore(s => s.packed25)
  const drums = useInventoryStore(s => s.drums)
  const ingredientInventory = useInventoryStore(s => s.ingredients)
  const ollas = useCookPlanStore(s => s.ollas)

  // Demand totals (bottles per flavor from active orders)
  const demandTotals = useMemo(() => {
    const t: Record<string, number> = {}
    for (const order of orders) {
      if (order.stage !== 'order' && order.stage !== 'cook') continue
      for (const item of order.items) {
        t[item.flavor] = (t[item.flavor] || 0) + item.cases * 6
      }
    }
    return t
  }, [orders])

  // Inventory per flavor
  const inventory = useMemo(() => {
    const inv: Record<string, { packed: number; drumBottles: number; total: number }> = {}
    for (const f of FLAVORS) {
      const p = (packed[f] || 0) + (packed25[f] || 0)
      const dw = (drums[f] || 0) * DRUM_BOTTLES
      inv[f] = { packed: p, drumBottles: dw, total: p + dw }
    }
    return inv
  }, [packed, packed25, drums])

  // Gap analysis
  const gaps = useMemo(() => {
    const g: Record<string, number> = {}
    for (const f of FLAVORS) {
      g[f] = (demandTotals[f] || 0) - (inventory[f]?.total || 0)
    }
    return g
  }, [demandTotals, inventory])

  // Cook plan calculations
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

  // Raw ingredient needs (from cook plan)
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

  // Ingredient rows with inventory subtraction
  const ingredientRows = useMemo(() => {
    const keys = Object.keys(ingredients).sort(
      (a, b) => (SORT_ORDER.indexOf(a) === -1 ? 99 : SORT_ORDER.indexOf(a)) -
                (SORT_ORDER.indexOf(b) === -1 ? 99 : SORT_ORDER.indexOf(b))
    )

    let totalLo = 0
    let totalHi = 0

    const rows: {
      ing: string; rawAmt: number; onHand: number; netNeed: number;
      pkgs: number; ordered: number; leftover: number;
      costLo: number; costHi: number; unit: string;
      u: typeof UNITS[string]
    }[] = []

    for (const ing of keys) {
      const n = ingredients[ing]
      const u = UNITS[ing]
      if (!u) continue

      const rawAmt = Math.round(n.amt)
      const onHand = ingredientInventory[ing]?.onHand || 0
      const netNeed = Math.max(0, n.amt - onHand)
      const pkgs = Math.ceil(netNeed / u.pkg)
      const ordered = pkgs * u.pkg
      const leftover = Math.round(ordered - netNeed)
      const costLo = pkgs * u.pLo
      const costHi = pkgs * u.pHi
      totalLo += costLo
      totalHi += costHi

      rows.push({ ing, rawAmt, onHand, netNeed: Math.round(netNeed), pkgs, ordered, leftover, costLo, costHi, unit: n.unit, u })
    }

    totalLo += DELIVERY_FEE
    totalHi += DELIVERY_FEE

    return { rows, totalLo, totalHi }
  }, [ingredients, ingredientInventory])

  // Tight spots
  const tightSpots = useMemo(() => {
    const spots: string[] = []
    for (const r of ingredientRows.rows) {
      if (r.netNeed <= 0) continue
      const ratio = r.ordered / r.netNeed
      if (ratio < 1.05 && r.netNeed > 0) {
        spots.push(`${r.u.name}: need ${r.netNeed}${r.unit}, ordering ${r.ordered}${r.unit}`)
      }
    }
    return spots
  }, [ingredientRows])

  // Grand totals
  const totalDemandBottles = Object.values(demandTotals).reduce((a, b) => a + b, 0)
  const totalInventoryBottles = FLAVORS.reduce((sum, f) => sum + (inventory[f]?.total || 0), 0)
  const totalGap = totalDemandBottles - totalInventoryBottles

  return {
    demandTotals,
    inventory,
    gaps,
    cookCalc,
    ingredients,
    ingredientRows,
    tightSpots,
    totalDemandBottles,
    totalInventoryBottles,
    totalGap,
  }
}
