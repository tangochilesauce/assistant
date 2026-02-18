'use client'

import { useState } from 'react'
import { CalendarDays, ChevronDown, ChevronRight } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { useTodoStore, type Todo } from '@/store/todo-store'
import { getProject } from '@/data/projects'

// ── Helpers ──────────────────────────────────────────────────────

function todayPST(): Date {
  const str = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' })
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

function toDateStr(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatDayLabel(date: Date, today: Date): string {
  const todayStr = toDateStr(today)
  const dateStr = toDateStr(date)
  const tomorrow = addDays(today, 1)
  const tomorrowStr = toDateStr(tomorrow)

  if (dateStr === todayStr) return 'Today'
  if (dateStr === tomorrowStr) return 'Tomorrow'
  return `${DAY_NAMES[date.getDay()]} ${MONTH_NAMES[date.getMonth()]} ${date.getDate()}`
}

// ── Task Row ─────────────────────────────────────────────────────

function WeekTaskRow({ todo }: { todo: Todo }) {
  const { toggleTodo } = useTodoStore()
  const project = getProject(todo.projectSlug)
  const accentColor = project?.color ?? '#666'

  return (
    <div className="flex items-center gap-2 py-1 px-1 rounded hover:bg-accent/20 transition-colors">
      <Checkbox
        checked={todo.completed}
        onCheckedChange={() => toggleTodo(todo.id)}
        className="shrink-0"
      />
      <span className={`text-xs flex-1 truncate ${
        todo.completed ? 'line-through text-muted-foreground/40' : ''
      }`}>
        {todo.title}
      </span>
      <span
        className="text-[9px] uppercase tracking-wider shrink-0"
        style={{ color: accentColor, opacity: 0.6 }}
      >
        {project?.emoji}
      </span>
    </div>
  )
}

// ── Day Column ───────────────────────────────────────────────────

function DayColumn({ date, today, todos }: { date: Date; today: Date; todos: Todo[] }) {
  const dateStr = toDateStr(date)
  const isToday = dateStr === toDateStr(today)
  const isPast = date < today && !isToday

  return (
    <div className={`min-w-[140px] flex-1 ${isPast ? 'opacity-50' : ''}`}>
      <div className={`text-[10px] font-medium uppercase tracking-wider mb-1.5 px-1 ${
        isToday ? 'text-orange-400' : 'text-muted-foreground/60'
      }`}>
        {formatDayLabel(date, today)}
      </div>
      {todos.length === 0 ? (
        <div className="text-[10px] text-muted-foreground/30 px-1 py-2">—</div>
      ) : (
        <div className="space-y-0.5">
          {todos.map(todo => (
            <WeekTaskRow key={todo.id} todo={todo} />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main Component ───────────────────────────────────────────────

export function ThisWeek() {
  const [open, setOpen] = useState(false)
  const { todos } = useTodoStore()

  const today = todayPST()

  // Build 7 days starting from today
  const days: Date[] = []
  for (let i = 0; i < 7; i++) {
    days.push(addDays(today, i))
  }

  // Group todos by their dueDate into the 7-day buckets
  const dayBuckets = new Map<string, Todo[]>()
  for (const d of days) {
    dayBuckets.set(toDateStr(d), [])
  }

  // Also collect tasks with no due date but status "this-week"
  const unscheduled: Todo[] = []

  for (const todo of todos) {
    if (todo.completed || todo.status === 'archived' || todo.status === 'done') continue

    if (todo.dueDate) {
      const bucket = dayBuckets.get(todo.dueDate)
      if (bucket) {
        bucket.push(todo)
      }
    } else if (todo.status === 'this-week') {
      unscheduled.push(todo)
    }
  }

  // Count total items this week
  let totalThisWeek = unscheduled.length
  for (const [, todos] of dayBuckets) {
    totalThisWeek += todos.length
  }

  return (
    <div className="mx-4 sm:mx-6 mt-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full text-left py-1.5 hover:opacity-80 transition-opacity"
      >
        {open ? (
          <ChevronDown className="size-3.5 text-muted-foreground/60" />
        ) : (
          <ChevronRight className="size-3.5 text-muted-foreground/60" />
        )}
        <CalendarDays className="size-3.5 text-muted-foreground/60" />
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          This Week
        </span>
        <span className="text-[10px] text-muted-foreground/50 tabular-nums ml-auto">
          {totalThisWeek} {totalThisWeek === 1 ? 'task' : 'tasks'}
        </span>
      </button>

      {open && (
        <div className="mt-2 pb-3 overflow-x-auto">
          <div className="flex gap-3 min-w-max">
            {days.map(date => {
              const dateStr = toDateStr(date)
              const dayTodos = dayBuckets.get(dateStr) ?? []
              return (
                <DayColumn
                  key={dateStr}
                  date={date}
                  today={today}
                  todos={dayTodos}
                />
              )
            })}
          </div>

          {/* Unscheduled "this-week" items */}
          {unscheduled.length > 0 && (
            <div className="mt-3 pt-2 border-t border-border/30">
              <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60 mb-1.5 px-1">
                This Week (no date)
              </div>
              <div className="space-y-0.5">
                {unscheduled.map(todo => (
                  <WeekTaskRow key={todo.id} todo={todo} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
