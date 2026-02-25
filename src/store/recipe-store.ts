import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

// ── Types ──────────────────────────────────────────────────────

const SETTINGS_KEY = 'tango_recipe_notes'

export interface RecipeNote {
  id: string
  text: string
}

export type RecipeNotes = Record<string, RecipeNote[]>

interface RecipeState {
  initialized: boolean
  notes: RecipeNotes
  fetchNotes: () => Promise<void>
  addNote: (flavor: string, text: string) => void
  deleteNote: (flavor: string, noteId: string) => void
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
          // Handle migration from old string format
          if (typeof v === 'string') {
            notes[k] = v ? [{ id: crypto.randomUUID(), text: v }] : []
          } else if (Array.isArray(v)) {
            notes[k] = v
          }
        }
      }
    }
    set({ notes, initialized: true })
  },

  addNote: (flavor: string, text: string) => {
    set(s => {
      const existing = s.notes[flavor] || []
      const notes = {
        ...s.notes,
        [flavor]: [...existing, { id: crypto.randomUUID(), text }],
      }
      saveSetting(SETTINGS_KEY, { notes })
      return { notes }
    })
  },

  deleteNote: (flavor: string, noteId: string) => {
    set(s => {
      const existing = s.notes[flavor] || []
      const notes = {
        ...s.notes,
        [flavor]: existing.filter(n => n.id !== noteId),
      }
      saveSetting(SETTINGS_KEY, { notes })
      return { notes }
    })
  },
}))
