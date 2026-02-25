import { create } from 'zustand'
import { loadSetting, saveSetting, SETTINGS_KEYS } from '@/lib/settings'
import {
  FLAVORS,
  DRUM_BOTTLES,
  DEFAULT_MATERIALS,
  MATERIAL_STATUSES,
  INGREDIENT_KEYS,
  UNITS,
  type MaterialItem,
  type MaterialStatus,
  type IngredientInventory,
} from '@/data/tango-constants'

// ── Types ────────────────────────────────────────────────────

interface InventoryState {
  initialized: boolean
  loading: boolean

  // Sauce inventory — packed bottles + drums per flavor
  packed: Record<string, number>
  drums: Record<string, number>

  // Ingredient inventory (fridge)
  ingredients: Record<string, IngredientInventory>

  // Packaging / materials
  materials: MaterialItem[]

  // Actions
  fetchInventory: () => Promise<void>
  setPacked: (flavor: string, value: number) => void
  setDrums: (flavor: string, value: number) => void
  setIngredient: (key: string, onHand: number, note?: string) => void
  cycleMaterialStatus: (index: number) => void
  setMaterialNote: (index: number, note: string) => void
  setMaterialQuantity: (index: number, quantity: number | null) => void

  // Computed
  getTotalInventory: (flavor: string) => number
}

// ── Store ────────────────────────────────────────────────────

export const useInventoryStore = create<InventoryState>((set, get) => ({
  initialized: false,
  loading: false,
  packed: {},
  drums: {},
  ingredients: {},
  materials: DEFAULT_MATERIALS,

  fetchInventory: async () => {
    if (get().initialized) return
    set({ loading: true })

    const [packedData, drumsData, ingredientsData, materialsData] = await Promise.all([
      loadSetting<{ packed?: { flavor: string; bottles: number }[] }>(SETTINGS_KEYS.packed),
      loadSetting<{ drums?: { flavor: string; drums: number }[] }>(SETTINGS_KEYS.drums),
      loadSetting<Record<string, IngredientInventory>>(SETTINGS_KEYS.ingredients),
      loadSetting<{ materials?: MaterialItem[] }>(SETTINGS_KEYS.materials),
    ])

    const packed: Record<string, number> = {}
    const drums: Record<string, number> = {}

    if (packedData?.packed) {
      for (const p of packedData.packed) packed[p.flavor] = p.bottles || 0
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

    set({ packed, drums, ingredients, materials, initialized: true, loading: false })
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

  cycleMaterialStatus: (index: number) => {
    set(s => {
      const materials = [...s.materials]
      const mat = { ...materials[index] }
      const ci = MATERIAL_STATUSES.indexOf(mat.status as MaterialStatus)
      mat.status = MATERIAL_STATUSES[(ci + 1) % MATERIAL_STATUSES.length]
      materials[index] = mat
      saveSetting(SETTINGS_KEYS.materials, { materials })
      return { materials }
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

  getTotalInventory: (flavor: string) => {
    const s = get()
    return (s.packed[flavor] || 0) + (s.drums[flavor] || 0) * DRUM_BOTTLES
  },
}))
