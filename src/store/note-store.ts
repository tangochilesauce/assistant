import { create } from 'zustand'
import { supabase, type NoteRow } from '@/lib/supabase'

export interface Note {
  id: string
  projectSlug: string
  content: string
  tags: string[]
  pinned: boolean
  createdAt: string
  updatedAt: string
}

interface NoteState {
  notes: Note[]
  loading: boolean
  initialized: boolean
  fetchNotes: () => Promise<void>
  addNote: (projectSlug: string, content: string) => Promise<void>
  updateNote: (id: string, changes: Partial<Pick<Note, 'content' | 'tags' | 'pinned'>>) => Promise<void>
  deleteNote: (id: string) => Promise<void>
  togglePin: (id: string) => Promise<void>
}

function rowToNote(row: NoteRow): Note {
  return {
    id: row.id,
    projectSlug: row.project_slug,
    content: row.content,
    tags: row.tags ?? [],
    pinned: row.pinned ?? false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  loading: false,
  initialized: false,

  fetchNotes: async () => {
    if (get().initialized) return
    set({ loading: true })

    if (supabase) {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('pinned', { ascending: false })
        .order('created_at', { ascending: false })

      if (!error && data) {
        set({ notes: data.map(rowToNote), loading: false, initialized: true })
        return
      }
    }

    set({ notes: [], loading: false, initialized: true })
  },

  addNote: async (projectSlug: string, content: string) => {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    const newNote: Note = {
      id,
      projectSlug,
      content,
      tags: [],
      pinned: false,
      createdAt: now,
      updatedAt: now,
    }

    set(state => ({ notes: [newNote, ...state.notes] }))

    if (supabase) {
      await supabase.from('notes').insert({
        id,
        project_slug: projectSlug,
        content,
        tags: [],
        pinned: false,
      })
    }
  },

  updateNote: async (id: string, changes: Partial<Pick<Note, 'content' | 'tags' | 'pinned'>>) => {
    const now = new Date().toISOString()
    set(state => ({
      notes: state.notes.map(n =>
        n.id === id ? { ...n, ...changes, updatedAt: now } : n
      ),
    }))

    if (supabase) {
      const row: Record<string, unknown> = { updated_at: now }
      if (changes.content !== undefined) row.content = changes.content
      if (changes.tags !== undefined) row.tags = changes.tags
      if (changes.pinned !== undefined) row.pinned = changes.pinned
      await supabase.from('notes').update(row).eq('id', id)
    }
  },

  deleteNote: async (id: string) => {
    set(state => ({ notes: state.notes.filter(n => n.id !== id) }))

    if (supabase) {
      await supabase.from('notes').delete().eq('id', id)
    }
  },

  togglePin: async (id: string) => {
    const note = get().notes.find(n => n.id === id)
    if (!note) return
    const newPinned = !note.pinned
    const now = new Date().toISOString()

    set(state => ({
      notes: state.notes.map(n =>
        n.id === id ? { ...n, pinned: newPinned, updatedAt: now } : n
      ),
    }))

    if (supabase) {
      await supabase.from('notes').update({ pinned: newPinned, updated_at: now }).eq('id', id)
    }
  },
}))
