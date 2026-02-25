import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

// ── Types ──────────────────────────────────────────────────────

export const FLAVORS = ['Hot', 'Mild', 'Mango', 'Truffle', 'Sriracha', 'Thai'] as const
export type Flavor = typeof FLAVORS[number]
export const FLAVOR_LC = FLAVORS.map(f => f.toLowerCase())

// Supabase settings keys
const KEYS = {
  packed:     'tango_production_packed',
  drums:      'tango_production_drums',
  cookPlan:   'tango_production_cook_plan',
  materials:  'tango_production_materials',
  quickCount: 'tango_production_quick_count',
} as const

// ── Constants ──────────────────────────────────────────────────

export const DRUM_BOTTLES = 625

export const OLLA_YIELDS: Record<string, number> = {
  Hot: 400, Mild: 400, Truffle: 400, Thai: 400, Sriracha: 400,
  Mango: 450,
}

export const BATCHES_PER_OLLA: Record<string, number> = {
  Hot: 4, Mild: 4, Truffle: 4, Thai: 4, Sriracha: 4,
  Mango: 2,
}

// Per-batch ingredient needs — HOT (from kitchen card, updated 5/10/24)
export const HOT_BATCH: Record<string, { amt: number; unit: string }> = {
  carrots:  { amt: 26.46, unit: 'lb' },  // 12000g
  garlic:   { amt: 8.82,  unit: 'lb' },  // 4000g
  lime:     { amt: 1.45,  unit: 'gal' }, // 5500g
  culantro: { amt: 3.75,  unit: 'lb' },  // 1700g
  habanero: { amt: 2.20,  unit: 'lb' },  // 1000g
  acv:      { amt: 3.01,  unit: 'gal' }, // 11400g
  salt:     { amt: 4.85,  unit: 'lb' },  // 2200g
}

// Per-batch — MILD / TRUFFLE (from kitchen card, updated 5/20/24)
export const MILD_BATCH: Record<string, { amt: number; unit: string }> = {
  carrots:  { amt: 26.46, unit: 'lb' },  // 12000g
  garlic:   { amt: 8.82,  unit: 'lb' },  // 4000g
  lime:     { amt: 1.45,  unit: 'gal' }, // 5500g
  culantro: { amt: 3.09,  unit: 'lb' },  // 1400g
  habanero: { amt: 1.10,  unit: 'lb' },  // 500g
  acv:      { amt: 3.01,  unit: 'gal' }, // 11400g
  salt:     { amt: 4.41,  unit: 'lb' },  // 2000g
}

// Alias for backward compat
export const STD_BATCH = HOT_BATCH

// Per-batch — THAI (updated from 2021 card + 2024 garlic correction, confirmed by Dan)
export const THAI_BATCH: Record<string, { amt: number; unit: string }> = {
  carrots:    { amt: 26.46, unit: 'lb' },  // 12000g
  garlic:     { amt: 8.82,  unit: 'lb' },  // 4000g (was 2700g pre-2024)
  lime:       { amt: 1.45,  unit: 'gal' }, // 5500g
  culantro:   { amt: 4.41,  unit: 'lb' },  // 2000g
  habanero:   { amt: 4.41,  unit: 'lb' },  // 2000g
  thai_chili: { amt: 6.61,  unit: 'lb' },  // 3000g
  acv:        { amt: 3.01,  unit: 'gal' }, // 11400g
  salt:       { amt: 4.85,  unit: 'lb' },  // 2200g
}

// Per-batch for Sriracha (confirmed correct by Dan)
export const SRI_BATCH: Record<string, { amt: number; unit: string; kitchen?: boolean }> = {
  red_jalapeno: { amt: 25, unit: 'lb' },
  garlic:       { amt: 13, unit: 'lb' },
  sugar:        { amt: 4,  unit: 'lb' },
  salt:         { amt: 3,  unit: 'lb' },
  white_vinegar:{ amt: 11, unit: 'lb', kitchen: true },
  water:        { amt: 10, unit: 'lb', kitchen: true },
}

// Per-batch for Mango (updated from 2021 card + 2024 garlic correction, confirmed by Dan)
export const MANGO_BATCH: Record<string, { amt: number; unit: string }> = {
  mango_fruit: { amt: 50,    unit: 'lb' },        // 50lb
  carrots:     { amt: 26.46, unit: 'lb' },         // 12000g
  garlic:      { amt: 8.82,  unit: 'lb' },         // 4000g (was 2700g pre-2024)
  lime:        { amt: 1.45,  unit: 'gal' },        // 5500g
  culantro:    { amt: 4.41,  unit: 'lb' },         // 2000g
  habanero:    { amt: 1.10,  unit: 'lb' },         // 500g
  acv:         { amt: 3.01,  unit: 'gal' },        // 11400g
  agave:       { amt: 2.20,  unit: 'lb' },         // 1000g
  salt:        { amt: 4.85,  unit: 'lb' },         // 2200g
}

// Purchasable units from Deep + pricing
export const UNITS: Record<string, {
  pkg: number; unit: string; label: string; name: string; pLo: number; pHi: number
}> = {
  carrots:      { pkg: 25,  unit: 'lb',  label: '25lb bag',    name: 'carrots',             pLo: 14.95, pHi: 14.95 },
  garlic:       { pkg: 30,  unit: 'lb',  label: '30lb box',    name: 'garlic',              pLo: 84,    pHi: 84 },
  lime:         { pkg: 4,   unit: 'gal', label: 'case (4gal)', name: 'lime juice',          pLo: 59.50, pHi: 59.50 },
  culantro:     { pkg: 14,  unit: 'lb',  label: '14lb box',    name: 'culantro',            pLo: 69,    pHi: 69 },
  habanero:     { pkg: 10,  unit: 'lb',  label: '~10lb box',   name: 'habanero',            pLo: 34.50, pHi: 34.50 },
  acv:          { pkg: 4,   unit: 'gal', label: 'case (4gal)', name: 'apple cider vinegar', pLo: 39.75, pHi: 39.75 },
  salt:         { pkg: 50,  unit: 'lb',  label: '50lb bag',    name: 'salt',                pLo: 14.95, pHi: 14.95 },
  red_jalapeno: { pkg: 25,  unit: 'lb',  label: '~25lb case',  name: 'red jalapeno',        pLo: 44.75, pHi: 44.75 },
  sugar:        { pkg: 50,  unit: 'lb',  label: '50lb bag',    name: 'cane sugar',          pLo: 37,    pHi: 37 },
  mango_fruit:  { pkg: 30,  unit: 'lb',  label: '30lb case',   name: 'mango',               pLo: 46.50, pHi: 46.50 },
  thai_chili:   { pkg: 30,  unit: 'lb',  label: '30lb case',   name: 'thai chilies',        pLo: 49.50, pHi: 49.50 },
  agave:        { pkg: 10,  unit: 'lb',  label: '~10lb jug',   name: 'agave nectar',        pLo: 25,    pHi: 30 },
  white_vinegar:{ pkg: 4,   unit: 'gal', label: 'case (4gal)', name: 'white vinegar',       pLo: 20,    pHi: 20 },
}

export const DELIVERY_FEE = 80
export const SORT_ORDER = ['carrots', 'garlic', 'lime', 'culantro', 'habanero', 'acv', 'salt', 'red_jalapeno', 'sugar', 'mango_fruit']

// Material items (default set)
const DEFAULT_MATERIALS: MaterialItem[] = [
  { item: 'Empty Bottles', status: 'Have', note: '' },
  { item: 'Foil Seals', status: 'Order', note: '' },
  { item: '6-Pack Boxes', status: 'Have', note: '' },
  { item: '25-Pack Boxes', status: 'Order', note: '' },
  { item: 'Caps — Hot', status: 'Have', note: '' },
  { item: 'Caps — Mild', status: 'Have', note: '' },
  { item: 'Caps — Mango', status: 'Have', note: '' },
  { item: 'Caps — Truffle', status: 'Have', note: '' },
  { item: 'Caps — Sriracha', status: 'Have', note: '' },
  { item: 'Caps — Thai', status: 'Have', note: '' },
  { item: 'Labels — Hot', status: 'Have', note: '' },
  { item: 'Labels — Mild', status: 'Have', note: '' },
  { item: 'Labels — Mango', status: 'Have', note: '' },
  { item: 'Labels — Truffle', status: 'Have', note: '' },
  { item: 'Labels — Sriracha', status: 'Have', note: '' },
  { item: 'Labels — Thai', status: 'Have', note: '' },
  { item: 'Stickers (case)', status: 'Have', note: '' },
  { item: 'Packing Tape', status: 'Have', note: '' },
]

export type MaterialStatus = 'Have' | 'Low' | 'Order' | 'OTW'
export const MATERIAL_STATUSES: MaterialStatus[] = ['Have', 'Low', 'Order', 'OTW']

export interface MaterialItem {
  item: string
  status: MaterialStatus | string
  note: string
}

// ── Helper ─────────────────────────────────────────────────────

async function loadSetting(key: string): Promise<Record<string, unknown> | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', key)
    .single()
  if (error || !data) return null
  return data.value as Record<string, unknown>
}

async function saveSetting(key: string, value: unknown): Promise<void> {
  if (!supabase) return
  await supabase.from('settings').upsert({
    key,
    value,
    updated_at: new Date().toISOString(),
  })
}

export function getRecipe(flavor: string) {
  if (flavor === 'Sriracha') return SRI_BATCH
  if (flavor === 'Mango') return MANGO_BATCH
  if (flavor === 'Mild' || flavor === 'Truffle') return MILD_BATCH
  if (flavor === 'Thai') return THAI_BATCH
  return HOT_BATCH
}

// ── Store Interface ────────────────────────────────────────────

interface ProductionState {
  initialized: boolean
  loading: boolean

  // Inventory — bottles packed per flavor
  packed: Record<string, number>
  // Inventory — drums per flavor (each drum = ~625 bottles)
  drums: Record<string, number>
  // Cook plan — ollas per flavor
  ollas: Record<string, number>
  // Materials tracking
  materials: MaterialItem[]

  // Actions
  fetchProduction: () => Promise<void>
  setPacked: (flavor: string, value: number) => void
  setDrums: (flavor: string, value: number) => void
  setOllas: (flavor: string, value: number) => void
  cycleMaterialStatus: (index: number) => void
  setMaterialNote: (index: number, note: string) => void

  // Computed helpers
  getTotalInventory: (flavor: string) => number
  getBottlesProduced: (flavor: string) => number
}

// ── Store ──────────────────────────────────────────────────────

export const useProductionStore = create<ProductionState>((set, get) => ({
  initialized: false,
  loading: false,
  packed: {},
  drums: {},
  ollas: {},
  materials: DEFAULT_MATERIALS,

  fetchProduction: async () => {
    if (get().initialized) return
    set({ loading: true })

    const [packedData, drumsData, cookPlanData, materialsData] = await Promise.all([
      loadSetting(KEYS.packed),
      loadSetting(KEYS.drums),
      loadSetting(KEYS.cookPlan),
      loadSetting(KEYS.materials),
    ])

    const packed: Record<string, number> = {}
    const drums: Record<string, number> = {}
    const ollas: Record<string, number> = {}

    if (packedData) {
      const arr = (packedData as { packed?: { flavor: string; bottles: number }[] }).packed || []
      for (const p of arr) packed[p.flavor] = p.bottles || 0
    }

    if (drumsData) {
      const arr = (drumsData as { drums?: { flavor: string; drums: number }[] }).drums || []
      for (const d of arr) drums[d.flavor] = d.drums || 0
    }

    if (cookPlanData) {
      const o = (cookPlanData as { ollas?: Record<string, number> }).ollas || {}
      for (const f of FLAVORS) ollas[f] = o[f] || o[f.toLowerCase()] || 0
    }

    let materials = DEFAULT_MATERIALS
    if (materialsData) {
      const arr = (materialsData as { materials?: MaterialItem[] }).materials
      if (arr && arr.length > 0) materials = arr
    }

    set({ packed, drums, ollas, materials, initialized: true, loading: false })
  },

  setPacked: (flavor: string, value: number) => {
    const v = Math.max(0, value)
    set(s => ({ packed: { ...s.packed, [flavor]: v } }))

    // Save to Supabase
    const packed = get().packed
    const arr = Object.entries(packed).map(([f, bottles]) => ({ flavor: f, bottles }))
    saveSetting(KEYS.packed, {
      packed: arr,
      updated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    })
  },

  setDrums: (flavor: string, value: number) => {
    const v = Math.max(0, value)
    set(s => ({ drums: { ...s.drums, [flavor]: v } }))

    const drums = get().drums
    const arr = Object.entries(drums).map(([f, d]) => ({
      flavor: f,
      drums: d,
      bottles_worth: d * DRUM_BOTTLES,
    }))
    saveSetting(KEYS.drums, { drums: arr })
  },

  setOllas: (flavor: string, value: number) => {
    const v = Math.max(0, Math.min(9, value))
    set(s => ({ ollas: { ...s.ollas, [flavor]: v } }))

    const ollas = get().ollas
    saveSetting(KEYS.cookPlan, { ollas })
  },

  cycleMaterialStatus: (index: number) => {
    set(s => {
      const materials = [...s.materials]
      const mat = { ...materials[index] }
      const ci = MATERIAL_STATUSES.indexOf(mat.status as MaterialStatus)
      mat.status = MATERIAL_STATUSES[(ci + 1) % MATERIAL_STATUSES.length]
      materials[index] = mat

      saveSetting(KEYS.materials, { materials })
      return { materials }
    })
  },

  setMaterialNote: (index: number, note: string) => {
    set(s => {
      const materials = [...s.materials]
      materials[index] = { ...materials[index], note }

      saveSetting(KEYS.materials, { materials })
      return { materials }
    })
  },

  getTotalInventory: (flavor: string) => {
    const s = get()
    return (s.packed[flavor] || 0) + (s.drums[flavor] || 0) * DRUM_BOTTLES
  },

  getBottlesProduced: (flavor: string) => {
    return (get().ollas[flavor] || 0) * OLLA_YIELDS[flavor]
  },
}))
