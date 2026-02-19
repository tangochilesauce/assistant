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

const NOW_ISO = '2026-02-18T00:00:00Z'
const FFEEDD_COLOR = '#22c55e'
const MADDER_COLOR = '#0ea5e9'
const DREAM_COLOR = '#8b5cf6'
const LIFE_COLOR = '#ffffff'
const FREELANCE_COLOR = '#94a3b8'
const RED = '#ef4444'

function getDefaultEvents(): CalendarEvent[] {
  return [
    // ── Production (existing) ──────────────────────────────────────
    { id: 'seed-foodies-copack-0223', title: 'Foodies Co-Pack 9-1pm ($400)', date: '2026-02-23', time: '09:00', color: TANGO_COLOR, projectSlug: 'tango-production', createdAt: NOW_ISO },
    { id: 'seed-foodies-copack-0226', title: 'Foodies Co-Pack 9-1pm ($400)', date: '2026-02-26', time: '09:00', color: TANGO_COLOR, projectSlug: 'tango-production', createdAt: NOW_ISO },
    { id: 'seed-foodies-storage-03', title: 'Foodies Storage Due ($350)', date: '2026-03-01', time: null, color: TANGO_COLOR, projectSlug: 'tango-production', createdAt: NOW_ISO },
    { id: 'seed-foodies-invoice', title: 'Pay Foodies/Aria ($1,100)', date: '2026-02-23', time: null, color: RED, projectSlug: 'tango-production', createdAt: NOW_ISO },

    // ── Life Admin ─────────────────────────────────────────────────
    { id: 'seed-cancel-subs', title: '🟡 Cancel Topaz, Illustrator, Fox One (-$82/mo)', date: '2026-02-19', time: null, color: LIFE_COLOR, projectSlug: 'life-admin', createdAt: NOW_ISO },
    { id: 'seed-cap-one-call', title: '🟡 Call Capital One re: hardship program', date: '2026-02-20', time: null, color: LIFE_COLOR, projectSlug: 'life-admin', createdAt: NOW_ISO },
    { id: 'seed-rent-due', title: '💰 RENT DUE ($2,878)', date: '2026-03-01', time: null, color: RED, projectSlug: 'life-admin', createdAt: NOW_ISO },
    { id: 'seed-berlin-half', title: '💰 Berlin Packaging half (~$2,064)', date: '2026-02-28', time: null, color: RED, projectSlug: 'life-admin', createdAt: NOW_ISO },

    // ── Amazon PPC ─────────────────────────────────────────────────
    { id: 'seed-ppc-cleanup', title: '🟠 Pause SR-PHRASE-TEST + TT-AUTO-LOOSE', date: '2026-02-19', time: null, color: TANGO_COLOR, projectSlug: 'tango-amazon', createdAt: NOW_ISO },
    { id: 'seed-ppc-bids', title: '🟠 Check bids on 3 winning campaigns', date: '2026-02-19', time: null, color: TANGO_COLOR, projectSlug: 'tango-amazon', createdAt: NOW_ISO },
    { id: 'seed-amazon-payout', title: '💰 Amazon payout ($553)', date: '2026-02-28', time: null, color: TANGO_COLOR, projectSlug: 'tango-amazon', createdAt: NOW_ISO },

    // ── DTC / Site Redesign ────────────────────────────────────────
    { id: 'seed-dtc-redesign-start', title: '🟠 Start site redesign', date: '2026-02-18', time: null, color: TANGO_COLOR, projectSlug: 'tango-dtc', createdAt: NOW_ISO },
    { id: 'seed-dtc-redesign-done', title: '🟠 Complete site redesign', date: '2026-02-21', time: null, color: TANGO_COLOR, projectSlug: 'tango-dtc', createdAt: NOW_ISO },
    { id: 'seed-dtc-email-templates', title: '🟠 Redesign email templates', date: '2026-02-23', time: null, color: TANGO_COLOR, projectSlug: 'tango-dtc', createdAt: NOW_ISO },
    { id: 'seed-dtc-deliverability', title: '🟠 Deliverability test (small batch)', date: '2026-02-24', time: null, color: TANGO_COLOR, projectSlug: 'tango-dtc', createdAt: NOW_ISO },
    { id: 'seed-dtc-first-campaign', title: '🟠 First campaign — Tier 1 (115 VIPs)', date: '2026-02-26', time: null, color: TANGO_COLOR, projectSlug: 'tango-dtc', createdAt: NOW_ISO },

    // ── Costco ─────────────────────────────────────────────────────
    { id: 'seed-moses-call', title: '🟠 Call Moses re: roadshows', date: '2026-02-25', time: null, color: TANGO_COLOR, projectSlug: 'tango-costco', createdAt: NOW_ISO },

    // ── UNFI ───────────────────────────────────────────────────────
    { id: 'seed-unfi-mor', title: '💰 UNFI MOR income ($3,422)', date: '2026-02-23', time: null, color: TANGO_COLOR, projectSlug: 'tango-unfi', createdAt: NOW_ISO },
    { id: 'seed-unfi-john', title: '🟠 Follow up John Lawson — Mango NE', date: '2026-03-03', time: null, color: TANGO_COLOR, projectSlug: 'tango-unfi', createdAt: NOW_ISO },
    { id: 'seed-unfi-ne-pickup', title: '🟠 UNFI NE PO pickup (84cs Mild + 36cs Hot)', date: '2026-03-25', time: null, color: TANGO_COLOR, projectSlug: 'tango-unfi', createdAt: NOW_ISO },

    // ── Madder ─────────────────────────────────────────────────────
    { id: 'seed-madder-single', title: '🔵 Madder single drop (YouTube + socials)', date: '2026-02-22', time: null, color: MADDER_COLOR, projectSlug: 'madder', createdAt: NOW_ISO },
    { id: 'seed-madder-distrokid', title: '🔵 Upload to DistroKid', date: '2026-02-23', time: null, color: MADDER_COLOR, projectSlug: 'madder', createdAt: NOW_ISO },
    { id: 'seed-madder-ep', title: '🔵 Madder EP drops', date: '2026-03-03', time: null, color: MADDER_COLOR, projectSlug: 'madder', createdAt: NOW_ISO },

    // ── FFEEDD ──────────────────────────────────────────────────────
    { id: 'seed-ffeedd-build', title: '🟢 FFEEDD final build', date: '2026-02-19', time: null, color: FFEEDD_COLOR, projectSlug: 'ffeedd', createdAt: NOW_ISO },
    { id: 'seed-ffeedd-submit', title: '🟢 Submit to App Store', date: '2026-02-20', time: null, color: FFEEDD_COLOR, projectSlug: 'ffeedd', createdAt: NOW_ISO },
    { id: 'seed-ffeedd-live', title: '🟢 FFEEDD live + announce', date: '2026-02-22', time: null, color: FFEEDD_COLOR, projectSlug: 'ffeedd', createdAt: NOW_ISO },

    // ── Dream Beds ─────────────────────────────────────────────────
    { id: 'seed-dream-ongoing', title: '🟣 Dream Beds: keep uploading 2-3x/week', date: '2026-02-19', time: null, color: DREAM_COLOR, projectSlug: 'dream-beds', createdAt: NOW_ISO },

    // ── Freelance / Consulting ─────────────────────────────────────
    { id: 'seed-upwork-profile', title: '💼 Create Upwork profile (AI-powered builds)', date: '2026-02-21', time: null, color: FREELANCE_COLOR, projectSlug: null, createdAt: NOW_ISO },
    { id: 'seed-toptal-profile', title: '💼 Create Toptal/Gun.io profile', date: '2026-02-28', time: null, color: FREELANCE_COLOR, projectSlug: null, createdAt: NOW_ISO },
    { id: 'seed-linkedin-update', title: '💼 Update LinkedIn — signal availability', date: '2026-02-28', time: null, color: FREELANCE_COLOR, projectSlug: null, createdAt: NOW_ISO },

    // ── EXP (later) ────────────────────────────────────────────────
    { id: 'seed-exp-income', title: '💰 EXP invoice income (~$3,400)', date: '2026-03-21', time: null, color: TANGO_COLOR, projectSlug: null, createdAt: NOW_ISO },
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
