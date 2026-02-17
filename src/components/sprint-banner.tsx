'use client'

import Link from 'next/link'
import { Zap, ChevronRight } from 'lucide-react'
import { useTodoStore } from '@/store/todo-store'

// ── Sprint Config ────────────────────────────────────────────────
// Edit these values to change the active sprint.
// Set SPRINT to null to hide the banner.

const SPRINT = {
  name: '14-DAY MONEY SPRINT',
  slug: 'sprint',           // matches the project slug
  start: '2026-02-14',
  end: '2026-02-28',
  target: '$5,000 new revenue',
  color: '#84cc16', // lime green
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
  const { todos } = useTodoStore()

  if (isOver) return null

  // Pull incomplete sprint todos as the preview items
  const sprintTodos = todos
    .filter(t => t.projectSlug === SPRINT.slug && !t.completed && t.status !== 'done' && t.status !== 'archived')
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, 4) // max 4 preview items

  return (
    <Link
      href={`/projects/${SPRINT.slug}`}
      className="block mx-4 sm:mx-6 mt-4 rounded-xl overflow-hidden hover:brightness-110 transition-all"
      style={{ backgroundColor: SPRINT.color + '15', borderLeft: `4px solid ${SPRINT.color}` }}
    >
      <div className="px-4 py-3">
        <div className="flex items-center gap-3 mb-2">
          <Zap className="size-4 shrink-0" style={{ color: SPRINT.color }} />
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

        {/* Sprint todo preview */}
        {sprintTodos.length > 0 ? (
          <div className="flex flex-wrap gap-x-4 gap-y-1 mb-1">
            {sprintTodos.map(todo => (
              <span key={todo.id} className="text-[11px] text-muted-foreground flex items-center gap-1">
                <span className="inline-block w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: SPRINT.color }} />
                {todo.title}
              </span>
            ))}
          </div>
        ) : (
          <div className="text-[11px] text-muted-foreground mb-1">All sprint items complete 🎉</div>
        )}

        <div className="flex items-center justify-between gap-4">
          <span className="text-[11px] font-semibold" style={{ color: SPRINT.color }}>
            {SPRINT.target}
          </span>
          <ChevronRight className="size-3 text-muted-foreground/40" />
        </div>
      </div>
    </Link>
  )
}
