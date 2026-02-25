'use client'

import { useEffect, useRef } from 'react'
import {
  useDreamwatchCalendarStore,
  type CalendarDay,
} from '@/store/dreamwatch-calendar-store'

// ── Helpers ──────────────────────────────────────────────────────

/** Get today's date string in Eastern Time (matches publish schedule) */
function getTodayET(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

/** Parse a YYYY-MM-DD string into date parts */
function parseDateStr(s: string) {
  const [y, m, d] = s.split('-').map(Number)
  return { year: y, month: m, day: d }
}

/** Get day of month from YYYY-MM-DD */
function dayNum(s: string): number {
  return parseDateStr(s).day
}

/** Short month name from YYYY-MM-DD */
function monthLabel(s: string): string {
  const { year, month, day } = parseDateStr(s)
  return new Date(year, month - 1, day).toLocaleString('en-US', { month: 'short' })
}

/** Add days to a date string */
function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + 'T12:00:00')
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

/** Day of week initial (M T W T F S S) */
function dowInitial(dateStr: string): string {
  const { year, month, day } = parseDateStr(dateStr)
  const d = new Date(year, month - 1, day)
  return ['S', 'M', 'T', 'W', 'T', 'F', 'S'][d.getDay()]
}

// ── Motivational Messages ────────────────────────────────────────

const DRILL_MESSAGES = [
  { emoji: '🪖', message: 'Zero days. Queue is empty. Get a video in there, soldier.' },
  { emoji: '💀', message: 'The streak is dead. Only YOU can revive it.' },
  { emoji: '😤', message: 'No streak. No excuses. Drop a pair into the queue.' },
  { emoji: '🔥', message: 'The fire went out. Light it back up.' },
  { emoji: '🫵', message: "Day zero. YouTube doesn't know you exist yet." },
]

function getMotivation(streak: number): { emoji: string; message: string } {
  if (streak === 0) {
    // Deterministic "random" based on day-of-year so it doesn't flicker on re-render
    const doy = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
    )
    return DRILL_MESSAGES[doy % DRILL_MESSAGES.length]
  }
  if (streak <= 3)
    return { emoji: '🌱', message: `${streak} day streak. Fragile. Keep feeding it.` }
  if (streak <= 7)
    return { emoji: '🔥', message: `${streak} days straight. You're building something real.` }
  if (streak <= 14)
    return { emoji: '💪', message: `${streak} day streak. The algorithm is LOVING you right now.` }
  if (streak <= 29)
    return { emoji: '🚀', message: `${streak} days. You're a publishing machine. Don't stop.` }
  return { emoji: '👑', message: `${streak} DAY STREAK. You absolute legend.` }
}

// ── Calendar Cell ────────────────────────────────────────────────

function CalendarCell({
  date,
  status,
  isToday,
  title,
}: {
  date: string
  status: 'published' | 'queued' | 'empty'
  isToday: boolean
  title: string | null
}) {
  const day = dayNum(date)
  const dow = dowInitial(date)

  // Dot color
  const dotClass =
    status === 'published'
      ? 'bg-emerald-400'
      : status === 'queued'
        ? 'bg-amber-400'
        : 'bg-zinc-800'

  // Today ring
  const ringClass = isToday
    ? 'ring-1 ring-violet-500/60'
    : ''

  // Future dates are slightly dimmer if empty
  const today = getTodayET()
  const isFuture = date > today
  const cellOpacity = isFuture && status === 'empty' ? 'opacity-40' : ''

  return (
    <div
      className={`flex flex-col items-center gap-0.5 w-7 shrink-0 rounded-md py-1 ${ringClass} ${cellOpacity}`}
      title={title ? `${date}: ${title}` : date}
    >
      {/* Day of week */}
      <span className="text-[8px] text-zinc-600 leading-none">{dow}</span>
      {/* Day number */}
      <span
        className={`text-[10px] leading-none tabular-nums ${
          isToday ? 'text-violet-300 font-bold' : 'text-zinc-500'
        }`}
      >
        {day}
      </span>
      {/* Status dot */}
      <div className={`w-2 h-2 rounded-full ${dotClass}`} />
    </div>
  )
}

// ── Month Divider ────────────────────────────────────────────────

function MonthDivider({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-end w-8 shrink-0 pb-1">
      <span className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider">
        {label}
      </span>
    </div>
  )
}

// ── Build Calendar Window ────────────────────────────────────────

interface CalendarEntry {
  type: 'day' | 'month'
  date?: string
  status?: 'published' | 'queued' | 'empty'
  title?: string | null
  monthLabel?: string
}

function buildCalendarWindow(
  days: CalendarDay[],
  pastDays: number,
  futureDays: number
): CalendarEntry[] {
  const today = getTodayET()
  const start = addDays(today, -pastDays)
  const end = addDays(today, futureDays)
  const dayMap = new Map(days.map(d => [d.date, d]))

  const entries: CalendarEntry[] = []
  let cursor = start
  let lastMonth = ''

  while (cursor <= end) {
    const ml = monthLabel(cursor)

    // Add month divider at month boundaries
    if (ml !== lastMonth) {
      entries.push({ type: 'month', monthLabel: ml })
      lastMonth = ml
    }

    const found = dayMap.get(cursor)
    entries.push({
      type: 'day',
      date: cursor,
      status: found?.status ?? 'empty',
      title: found?.videoTitle ?? null,
    })

    cursor = addDays(cursor, 1)
  }

  return entries
}

// ── Streak Header ────────────────────────────────────────────────

export function StreakHeader() {
  const { days, streak, initialized, startPolling, stopPolling } =
    useDreamwatchCalendarStore()
  const scrollRef = useRef<HTMLDivElement>(null)
  const todayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    startPolling()
    return () => stopPolling()
  }, [startPolling, stopPolling])

  // Scroll to today on mount
  useEffect(() => {
    if (initialized && todayRef.current && scrollRef.current) {
      const container = scrollRef.current
      const todayEl = todayRef.current
      const offset = todayEl.offsetLeft - container.clientWidth / 2 + todayEl.clientWidth / 2
      container.scrollLeft = Math.max(0, offset)
    }
  }, [initialized])

  if (!initialized) return null

  const today = getTodayET()
  const motivation = getMotivation(streak)
  const calendarEntries = buildCalendarWindow(days, 30, 30)

  const publishedCount = days.filter(d => d.status === 'published').length
  const queuedCount = days.filter(d => d.status === 'queued').length

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-3">
      {/* ── Row 1: Streak + Message ── */}
      <div className="flex items-center gap-4">
        {/* Streak number */}
        <div className="text-center min-w-[60px]">
          <div className="text-3xl leading-none">{motivation.emoji}</div>
          <div
            className={`text-2xl font-bold tabular-nums mt-1 ${
              streak > 0 ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {streak}
          </div>
          <div className="text-[9px] uppercase tracking-wider text-zinc-600 mt-0.5">
            {streak === 1 ? 'day' : 'days'}
          </div>
        </div>

        {/* Message + stats */}
        <div className="flex-1 min-w-0">
          <div className="text-sm text-zinc-300 leading-snug">
            {motivation.message}
          </div>
          <div className="flex gap-4 mt-2 text-[10px] text-zinc-600">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              {publishedCount} published
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
              {queuedCount} queued
            </span>
          </div>
        </div>
      </div>

      {/* ── Row 2: Calendar Strip ── */}
      <div
        ref={scrollRef}
        className="overflow-x-auto scrollbar-hide -mx-1 px-1"
        style={{ scrollBehavior: 'smooth' }}
      >
        <div className="flex gap-0 min-w-max">
          {calendarEntries.map((entry, i) => {
            if (entry.type === 'month') {
              return (
                <MonthDivider key={`month-${i}`} label={entry.monthLabel!} />
              )
            }

            const date = entry.date!
            const isToday = date === today

            return (
              <div key={date} ref={isToday ? todayRef : undefined}>
                <CalendarCell
                  date={date}
                  status={entry.status!}
                  isToday={isToday}
                  title={entry.title ?? null}
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Legend ── */}
      <div className="flex items-center gap-3 text-[9px] text-zinc-700">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
          Published
        </span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
          Queued
        </span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-800 inline-block" />
          Empty
        </span>
        <span className="ml-auto">5:00 PM ET · 2:00 PM PT daily</span>
      </div>
    </div>
  )
}
