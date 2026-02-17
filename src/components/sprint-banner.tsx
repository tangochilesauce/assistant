'use client'

import { Flame } from 'lucide-react'

// ── Sprint Config ────────────────────────────────────────────────
// Edit these values to change the active sprint.
// Set SPRINT to null to hide the banner.

const SPRINT = {
  name: '14-DAY MONEY SPRINT',
  start: '2026-02-14',
  end: '2026-02-28',
  goal: 'Ship pallet · Restart PPC · Drop single · Launch FFEEDD',
  target: '$5,000 new revenue',
  color: '#f97316', // orange
}

// ── Component ────────────────────────────────────────────────────

function getDayInfo(start: string, end: string) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const [sy, sm, sd] = start.split('-').map(Number)
  const [ey, em, ed] = end.split('-').map(Number)
  const startDate = new Date(sy, sm - 1, sd)
  const endDate = new Date(ey, em - 1, ed)

  const totalDays = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  const elapsed = Math.round((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  const dayNum = Math.max(1, Math.min(elapsed + 1, totalDays))
  const daysLeft = Math.max(0, totalDays - elapsed)
  const pct = Math.min((elapsed / totalDays) * 100, 100)
  const isOver = today > endDate

  return { totalDays, dayNum, daysLeft, pct, isOver }
}

export function SprintBanner() {
  if (!SPRINT) return null

  const { totalDays, dayNum, daysLeft, pct, isOver } = getDayInfo(SPRINT.start, SPRINT.end)

  if (isOver) return null

  return (
    <div
      className="mx-4 sm:mx-6 mt-4 rounded-xl overflow-hidden"
      style={{ backgroundColor: SPRINT.color + '15', borderLeft: `4px solid ${SPRINT.color}` }}
    >
      <div className="px-4 py-3">
        <div className="flex items-center gap-3 mb-2">
          <Flame className="size-4 shrink-0" style={{ color: SPRINT.color }} />
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: SPRINT.color }}>
            {SPRINT.name}
          </span>
          <span className="text-[10px] text-muted-foreground ml-auto tabular-nums">
            Day {dayNum} of {totalDays} · {daysLeft}d left
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-accent/20 rounded-full overflow-hidden mb-2">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${pct}%`, backgroundColor: SPRINT.color }}
          />
        </div>

        <div className="flex items-baseline justify-between gap-4">
          <span className="text-[11px] text-muted-foreground">{SPRINT.goal}</span>
          <span className="text-[11px] font-semibold shrink-0" style={{ color: SPRINT.color }}>
            {SPRINT.target}
          </span>
        </div>
      </div>
    </div>
  )
}
