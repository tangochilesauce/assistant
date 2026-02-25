import { create } from 'zustand'
import { loadSetting, saveSetting, SETTINGS_KEYS } from '@/lib/settings'
import {
  FLAVORS,
  DRUM_BOTTLES,
  DEFAULT_MATERIALS,
  INGREDIENT_KEYS,
  UNITS,
  type MaterialItem,
  type IngredientInventory,
} from '@/data/tango-constants'

// ── Types ────────────────────────────────────────────────────

interface InventoryState {
  initialized: boolean
  loading: boolean

  // Sauce inventory — packed bottles + drums per flavor
  packed: Record<string, number>    // bottles in 6-packs (ready to palletize)
  packed25: Record<string, number>  // bottles in 25-packs (need reboxing)
  drums: Record<string, number>

  // Ingredient inventory (fridge)
  ingredients: Record<string, IngredientInventory>

  // Packaging / materials (non-flavor items)
  materials: MaterialItem[]

  // Per-flavor packaging
  caps: Record<string, number>
  labels: Record<string, number>
  sealFilledCaps: Record<string, string>
  boxes: Record<string, number>
  caseLabels: Record<string, number>

  // Pack day manual overrides
  packDayFlavors: string[]

  // Actions
  fetchInventory: () => Promise<void>
  refetchInventory: () => Promise<void>
  setPacked: (flavor: string, value: number) => void
  setPacked25: (flavor: string, value: number) => void
  setDrums: (flavor: string, value: number) => void
  setIngredient: (key: string, onHand: number, note?: string) => void
  setMaterialNote: (index: number, note: string) => void
  setMaterialQuantity: (index: number, quantity: number | null) => void
  setCaps: (flavor: string, value: number) => void
  setLabels: (flavor: string, value: number) => void
  setSealFilledCaps: (flavor: string, value: string) => void
  setBoxes: (flavor: string, value: number) => void
  setCaseLabels: (flavor: string, value: number) => void
  setPackDayFlavors: (flavors: string[]) => void

  // Computed
  getTotalInventory: (flavor: string) => number
}

// ── Store ────────────────────────────────────────────────────

export const useInventoryStore = create<InventoryState>((set, get) => ({
  initialized: false,
  loading: false,
  packed: {},
  packed25: {},
  drums: {},
  ingredients: {},
  materials: DEFAULT_MATERIALS,
  caps: {},
  labels: {},
  sealFilledCaps: {},
  boxes: {},
  caseLabels: {},
  packDayFlavors: [],

  refetchInventory: async () => {
    set({ initialized: false })
    await get().fetchInventory()
  },

  fetchInventory: async () => {
    if (get().initialized) return
    set({ loading: true })

    const [packedData, packed25Data, drumsData, ingredientsData, materialsData, capsData, labelsData, sealFilledCapsData, boxesData, caseLabelsData, packDayData] = await Promise.all([
      loadSetting<{ packed?: { flavor: string; bottles: number }[] }>(SETTINGS_KEYS.packed),
      loadSetting<{ packed?: { flavor: string; bottles: number }[] }>(SETTINGS_KEYS.packed25),
      loadSetting<{ drums?: { flavor: string; drums: number }[] }>(SETTINGS_KEYS.drums),
      loadSetting<Record<string, IngredientInventory>>(SETTINGS_KEYS.ingredients),
      loadSetting<{ materials?: MaterialItem[] }>(SETTINGS_KEYS.materials),
      loadSetting<Record<string, number>>(SETTINGS_KEYS.caps),
      loadSetting<Record<string, number>>(SETTINGS_KEYS.labels),
      loadSetting<Record<string, string>>(SETTINGS_KEYS.sealFilledCaps),
      loadSetting<Record<string, number>>(SETTINGS_KEYS.boxes),
      loadSetting<Record<string, number>>(SETTINGS_KEYS.caseLabels),
      loadSetting<{ flavors?: string[]; date?: string }>(SETTINGS_KEYS.packDay),
    ])

    const packed: Record<string, number> = {}
    const packed25: Record<string, number> = {}
    const drums: Record<string, number> = {}

    if (packedData?.packed) {
      for (const p of packedData.packed) packed[p.flavor] = p.bottles || 0
    }

    if (packed25Data?.packed) {
      for (const p of packed25Data.packed) packed25[p.flavor] = p.bottles || 0
    }

    if (drumsData?.drums) {
      for (const d of drumsData.drums) drums[d.flavor] = d.drums || 0
    }

    // Ingredients — init defaults for any missing keys
    const ingredients: Record<string, IngredientInventory> = {}
    for (const key of INGREDIENT_KEYS) {
      const u = UNITS[key]
      ingredients[key] = ingredientsData?.[key] || {
        onHand: 0,
        unit: u?.unit || 'lb',
        lastUpdated: '',
        note: '',
      }
    }

    let materials = DEFAULT_MATERIALS
    if (materialsData?.materials && materialsData.materials.length > 0) {
      materials = materialsData.materials
    }

    const caps: Record<string, number> = {}
    const labels: Record<string, number> = {}
    const sealFilledCaps: Record<string, string> = {}
    const boxes: Record<string, number> = {}
    const caseLabels: Record<string, number> = {}
    for (const f of FLAVORS) {
      caps[f] = capsData?.[f] || 0
      labels[f] = labelsData?.[f] || 0
      sealFilledCaps[f] = sealFilledCapsData?.[f] || 'none'
      boxes[f] = boxesData?.[f] || 0
      caseLabels[f] = caseLabelsData?.[f] || 0
    }

    const packDayFlavors = packDayData?.flavors || []

    set({ packed, packed25, drums, ingredients, materials, caps, labels, sealFilledCaps, boxes, caseLabels, packDayFlavors, initialized: true, loading: false })
  },

  setPacked: (flavor: string, value: number) => {
    const v = Math.max(0, value)
    set(s => ({ packed: { ...s.packed, [flavor]: v } }))

    const packed = get().packed
    const arr = Object.entries(packed).map(([f, bottles]) => ({ flavor: f, bottles }))
    saveSetting(SETTINGS_KEYS.packed, {
      packed: arr,
      updated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    })
  },

  setPacked25: (flavor: string, value: number) => {
    const v = Math.max(0, value)
    set(s => ({ packed25: { ...s.packed25, [flavor]: v } }))

    const packed25 = get().packed25
    const arr = Object.entries(packed25).map(([f, bottles]) => ({ flavor: f, bottles }))
    saveSetting(SETTINGS_KEYS.packed25, {
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
    saveSetting(SETTINGS_KEYS.drums, { drums: arr })
  },

  setIngredient: (key: string, onHand: number, note?: string) => {
    set(s => {
      const prev = s.ingredients[key] || { onHand: 0, unit: 'lb', lastUpdated: '', note: '' }
      const updated: IngredientInventory = {
        ...prev,
        onHand: Math.max(0, onHand),
        lastUpdated: new Date().toISOString(),
        ...(note !== undefined ? { note } : {}),
      }
      const ingredients = { ...s.ingredients, [key]: updated }
      saveSetting(SETTINGS_KEYS.ingredients, ingredients)
      return { ingredients }
    })
  },

  setMaterialNote: (index: number, note: string) => {
    set(s => {
      const materials = [...s.materials]
      materials[index] = { ...materials[index], note }
      saveSetting(SETTINGS_KEYS.materials, { materials })
      return { materials }
    })
  },

  setMaterialQuantity: (index: number, quantity: number | null) => {
    set(s => {
      const materials = [...s.materials]
      materials[index] = { ...materials[index], quantity }
      saveSetting(SETTINGS_KEYS.materials, { materials })
      return { materials }
    })
  },

  setCaps: (flavor: string, value: number) => {
    const v = Math.max(0, Math.round(value))
    set(s => ({ caps: { ...s.caps, [flavor]: v } }))
    saveSetting(SETTINGS_KEYS.caps, get().caps)
  },

  setLabels: (flavor: string, value: number) => {
    const v = Math.max(0, Math.round(value))
    set(s => ({ labels: { ...s.labels, [flavor]: v } }))
    saveSetting(SETTINGS_KEYS.labels, get().labels)
  },

  setSealFilledCaps: (flavor: string, value: string) => {
    set(s => ({ sealFilledCaps: { ...s.sealFilledCaps, [flavor]: value } }))
    saveSetting(SETTINGS_KEYS.sealFilledCaps, get().sealFilledCaps)
  },

  setBoxes: (flavor: string, value: number) => {
    const v = Math.max(0, Math.round(value))
    set(s => ({ boxes: { ...s.boxes, [flavor]: v } }))
    saveSetting(SETTINGS_KEYS.boxes, get().boxes)
  },

  setCaseLabels: (flavor: string, value: number) => {
    const v = Math.max(0, Math.round(value))
    set(s => ({ caseLabels: { ...s.caseLabels, [flavor]: v } }))
    saveSetting(SETTINGS_KEYS.caseLabels, get().caseLabels)
  },

  setPackDayFlavors: (flavors: string[]) => {
    set({ packDayFlavors: flavors })
    saveSetting(SETTINGS_KEYS.packDay, {
      flavors,
      date: new Date().toISOString().slice(0, 10),
    })
  },

  getTotalInventory: (flavor: string) => {
    const s = get()
    return (s.packed[flavor] || 0) + (s.packed25[flavor] || 0) + (s.drums[flavor] || 0) * DRUM_BOTTLES
  },
}))
