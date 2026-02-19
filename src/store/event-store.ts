import { create } from 'zustand'
import { supabase, type EventRow } from '@/lib/supabase'

export interface CalendarEvent {
  id: string
  title: string
  date: string           // YYYY-MM-DD
  time: string | null     // HH:MM or null
  color: string           // hex color
  projectSlug: string | null
  createdAt: string
}

interface EventState {
  events: CalendarEvent[]
  loading: boolean
  initialized: boolean
  fetchEvents: () => Promise<void>
  addEvent: (title: string, date: string, color?: string, time?: string, projectSlug?: string) => Promise<string>
  updateEvent: (id: string, changes: Partial<Pick<CalendarEvent, 'title' | 'date' | 'time' | 'color' | 'projectSlug'>>) => Promise<void>
  deleteEvent: (id: string) => Promise<void>
}

function rowToEvent(row: EventRow): CalendarEvent {
  return {
    id: row.id,
    title: row.title,
    date: row.date,
    time: row.time,
    color: row.color,
    projectSlug: row.project_slug,
    createdAt: row.created_at,
  }
}

const DEFAULT_COLOR = '#6b7280' // gray
const TANGO_COLOR = '#f97316'  // orange

function getDefaultEvents(): CalendarEvent[] {
  return [
    { id: 'seed-foodies-copack-0223', title: 'Foodies Co-Pack 9-1pm ($400)', date: '2026-02-23', time: '09:00', color: TANGO_COLOR, projectSlug: 'tango-production', createdAt: '2026-02-18T00:00:00Z' },
    { id: 'seed-foodies-copack-0226', title: 'Foodies Co-Pack 9-1pm ($400)', date: '2026-02-26', time: '09:00', color: TANGO_COLOR, projectSlug: 'tango-production', createdAt: '2026-02-18T00:00:00Z' },
    { id: 'seed-foodies-storage-03', title: 'Foodies Storage Due ($350)', date: '2026-03-01', time: null, color: TANGO_COLOR, projectSlug: 'tango-production', createdAt: '2026-02-18T00:00:00Z' },
    { id: 'seed-foodies-invoice', title: 'Pay Foodies Invoice #13883 ($1,900)', date: '2026-02-23', time: null, color: '#ef4444', projectSlug: 'tango-production', createdAt: '2026-02-18T00:00:00Z' },
  ]
}

export const useEventStore = create<EventState>((set, get) => ({
  events: [],
  loading: false,
  initialized: false,

  fetchEvents: async () => {
    if (get().initialized) return
    set({ loading: true })

    if (supabase) {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true })

      if (!error && data) {
        set({ events: data.map(rowToEvent), loading: false, initialized: true })
        return
      }
    }

    // Fallback: seed events
    set({ events: getDefaultEvents(), loading: false, initialized: true })
  },

  addEvent: async (title: string, date: string, color?: string, time?: string, projectSlug?: string) => {
    const id = crypto.randomUUID()
    const newEvent: CalendarEvent = {
      id,
      title,
      date,
      time: time ?? null,
      color: color ?? DEFAULT_COLOR,
      projectSlug: projectSlug ?? null,
      createdAt: new Date().toISOString(),
    }

    set(state => ({ events: [...state.events, newEvent] }))

    if (supabase) {
      await supabase.from('events').insert({
        id,
        title,
        date,
        time: time ?? null,
        color: color ?? DEFAULT_COLOR,
        project_slug: projectSlug ?? null,
        created_at: newEvent.createdAt,
      })
    }

    return id
  },

  updateEvent: async (id: string, changes: Partial<Pick<CalendarEvent, 'title' | 'date' | 'time' | 'color' | 'projectSlug'>>) => {
    set(state => ({
      events: state.events.map(e =>
        e.id === id ? { ...e, ...changes } : e
      ),
    }))

    if (supabase) {
      const row: Record<string, unknown> = {}
      if (changes.title !== undefined) row.title = changes.title
      if (changes.date !== undefined) row.date = changes.date
      if (changes.time !== undefined) row.time = changes.time
      if (changes.color !== undefined) row.color = changes.color
      if (changes.projectSlug !== undefined) row.project_slug = changes.projectSlug
      await supabase.from('events').update(row).eq('id', id)
    }
  },

  deleteEvent: async (id: string) => {
    set(state => ({ events: state.events.filter(e => e.id !== id) }))

    if (supabase) {
      await supabase.from('events').delete().eq('id', id)
    }
  },
}))
