import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

// ── Types ────────────────────────────────────────────────────────

export interface CalendarDay {
  date: string                                    // YYYY-MM-DD (ET — switching to PT next session)
  status: 'published' | 'queued' | 'empty'
  videoTitle: string | null
  youtubeUrl: string | null
  queuedBasename: string | null
  scheduledTime: string | null
}

// ── Helpers ──────────────────────────────────────────────────────

/** Get today's date string in Eastern Time */
function getTodayET(): string {
  const now = new Date()
  // Format in ET — handles DST automatically
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
  return parts // Returns YYYY-MM-DD
}

/** Add days to a YYYY-MM-DD string */
function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T12:00:00') // noon to avoid DST edge
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

/**
 * Calculate upload streak: consecutive days with published or queued
 * content, walking backwards from today (ET).
 */
function calculateStreak(days: CalendarDay[]): number {
  const today = getTodayET()
  const dateSet = new Set(
    days
      .filter(d => d.status === 'published' || d.status === 'queued')
      .map(d => d.date)
  )

  let streak = 0
  let checkDate = today

  while (dateSet.has(checkDate)) {
    streak++
    checkDate = addDays(checkDate, -1)
  }

  return streak
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToDay(row: any): CalendarDay {
  return {
    date: row.date,
    status: row.status ?? 'empty',
    videoTitle: row.video_title ?? null,
    youtubeUrl: row.youtube_url ?? null,
    queuedBasename: row.queued_basename ?? null,
    scheduledTime: row.scheduled_time ?? null,
  }
}

// ── Store ────────────────────────────────────────────────────────

interface DreamwatchCalendarState {
  days: CalendarDay[]
  streak: number
  loading: boolean
  initialized: boolean
  fetchCalendar: () => Promise<void>
  startPolling: () => void
  stopPolling: () => void
}

let pollInterval: ReturnType<typeof setInterval> | null = null

export const useDreamwatchCalendarStore = create<DreamwatchCalendarState>((set, get) => ({
  days: [],
  streak: 0,
  loading: false,
  initialized: false,

  fetchCalendar: async () => {
    if (!supabase) return

    const today = getTodayET()
    const start = addDays(today, -90)
    const end = addDays(today, 90)

    const { data, error } = await supabase
      .from('dreamwatch_calendar')
      .select('*')
      .gte('date', start)
      .lte('date', end)
      .order('date', { ascending: true })

    if (!error && data) {
      const days = data.map(rowToDay)
      set({
        days,
        streak: calculateStreak(days),
        loading: false,
        initialized: true,
      })
    }
  },

  startPolling: () => {
    if (pollInterval) return
    get().fetchCalendar()
    pollInterval = setInterval(() => get().fetchCalendar(), 60_000) // 60s
  },

  stopPolling: () => {
    if (pollInterval) {
      clearInterval(pollInterval)
      pollInterval = null
    }
  },
}))
