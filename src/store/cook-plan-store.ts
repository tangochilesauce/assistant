import { create } from 'zustand'
import { loadSetting, saveSetting, SETTINGS_KEYS } from '@/lib/settings'
import { FLAVORS, OLLA_YIELDS } from '@/data/tango-constants'

// ── Types ────────────────────────────────────────────────────

interface CookPlanState {
  initialized: boolean
  loading: boolean
  ollas: Record<string, number>

  // Actions
  fetchCookPlan: () => Promise<void>
  refetchCookPlan: () => Promise<void>
  setOllas: (flavor: string, value: number) => void
  autoPlan: (gaps: Record<string, number>) => void

  // Computed
  getBottlesProduced: (flavor: string) => number
}

// ── Store ────────────────────────────────────────────────────

export const useCookPlanStore = create<CookPlanState>((set, get) => ({
  initialized: false,
  loading: false,
  ollas: {},

  refetchCookPlan: async () => {
    set({ initialized: false })
    await get().fetchCookPlan()
  },

  fetchCookPlan: async () => {
    if (get().initialized) return
    set({ loading: true })

    const data = await loadSetting<{ ollas?: Record<string, number> }>(SETTINGS_KEYS.cookPlan)
    const ollas: Record<string, number> = {}

    if (data?.ollas) {
      for (const f of FLAVORS) {
        ollas[f] = data.ollas[f] || data.ollas[f.toLowerCase()] || 0
      }
    }

    set({ ollas, initialized: true, loading: false })
  },

  setOllas: (flavor: string, value: number) => {
    const v = Math.max(0, Math.min(9, value))
    set(s => ({ ollas: { ...s.ollas, [flavor]: v } }))
    saveSetting(SETTINGS_KEYS.cookPlan, { ollas: get().ollas })
  },

  // Auto-plan: compute minimum ollas to close all gaps
  autoPlan: (gaps: Record<string, number>) => {
    const ollas: Record<string, number> = {}
    for (const f of FLAVORS) {
      const gap = gaps[f] || 0
      if (gap <= 0) {
        ollas[f] = 0
      } else {
        // Ceiling: how many ollas to produce enough bottles
        ollas[f] = Math.min(9, Math.ceil(gap / OLLA_YIELDS[f]))
      }
    }
    set({ ollas })
    saveSetting(SETTINGS_KEYS.cookPlan, { ollas })
  },

  getBottlesProduced: (flavor: string) => {
    return (get().ollas[flavor] || 0) * OLLA_YIELDS[flavor]
  },
}))
