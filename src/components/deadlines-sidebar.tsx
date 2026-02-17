'use client'

import { CalendarClock } from 'lucide-react'
import { useTodoStore, type Todo } from '@/store/todo-store'
import { getProject } from '@/data/projects'

// Extract a date string from the todo title, e.g. "(Feb 16)", "(Mar 1)", "(Feb 23)"
function extractDate(title: string): Date | null {
  // Match patterns like "Feb 16", "Mar 1", "Feb 23" (with or without parens)
  const match = title.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2})\b/)
  if (!match) return null
  const months: Record<string, number> = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
  }
  const month = months[match[1]]
  const day = parseInt(match[2])
  const now = new Date()
  const year = now.getFullYear()
  return new Date(year, month, day)
}

function formatDeadline(date: Date): string {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diff = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diff < 0) return `${Math.abs(diff)}d overdue`
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  return `${diff}d`
}

function urgencyColor(date: Date): string {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diff = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diff < 0) return 'text-red-400'
  if (diff === 0) return 'text-orange-400'
  if (diff <= 2) return 'text-yellow-400'
  return 'text-muted-foreground'
}

interface DeadlineItem {
  todo: Todo
  date: Date
}

export function DeadlinesSidebar() {
  const { todos } = useTodoStore()

  // Find all incomplete todos with dates in title
  const deadlines: DeadlineItem[] = todos
    .filter(t => !t.completed)
    .map(t => ({ todo: t, date: extractDate(t.title) }))
    .filter((d): d is DeadlineItem => d.date !== null)
    .sort((a, b) => a.date.getTime() - b.date.getTime())

  if (deadlines.length === 0) return null

  return (
    <div className="w-[220px] shrink-0 hidden lg:block">
      <div className="sticky top-0">
        <div className="flex items-center gap-2 px-2 py-2.5 mb-2">
          <CalendarClock className="size-3.5 text-muted-foreground/60" />
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Deadlines
          </span>
        </div>

        <div className="space-y-1">
          {deadlines.map(({ todo, date }) => {
            const project = getProject(todo.projectSlug)
            const accentColor = project?.color ?? '#666'

            return (
              <div
                key={todo.id}
                className="px-2 py-1.5 rounded-md hover:bg-accent/30 transition-colors"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-xs truncate flex-1">{todo.title}</span>
                  <span className={`text-[10px] font-medium tabular-nums shrink-0 ${urgencyColor(date)}`}>
                    {formatDeadline(date)}
                  </span>
                </div>
                <span
                  className="text-[9px] uppercase tracking-wider"
                  style={{ color: accentColor, opacity: 0.6 }}
                >
                  {project?.name}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
