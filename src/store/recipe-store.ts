import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

// ── Types ──────────────────────────────────────────────────────

const SETTINGS_KEY = 'tango_recipe_notes'

export type RecipeNotes = Record<string, string>

interface RecipeState {
  initialized: boolean
  notes: RecipeNotes
  fetchNotes: () => Promise<void>
  setNote: (flavor: string, value: string) => void
}

// ── Supabase helpers ────────────────────────────────────────────

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

// ── Store ──────────────────────────────────────────────────────

export const useRecipeStore = create<RecipeState>((set, get) => ({
  initialized: false,
  notes: {},

  fetchNotes: async () => {
    if (get().initialized) return
    const data = await loadSetting(SETTINGS_KEY)
    const notes: RecipeNotes = {}
    if (data) {
      const saved = (data as { notes?: RecipeNotes }).notes
      if (saved) {
        for (const [k, v] of Object.entries(saved)) {
          notes[k] = v
        }
      }
    }
    set({ notes, initialized: true })
  },

  setNote: (flavor: string, value: string) => {
    set(s => {
      const notes = { ...s.notes, [flavor]: value }
      saveSetting(SETTINGS_KEY, { notes })
      return { notes }
    })
  },
}))
