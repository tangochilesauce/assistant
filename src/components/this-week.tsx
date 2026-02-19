'use client'

import { useState, useRef, useEffect } from 'react'
import { CalendarDays, ChevronDown, ChevronRight, Plus, X } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { useTodoStore, type Todo } from '@/store/todo-store'
import { useEventStore, type CalendarEvent } from '@/store/event-store'
import { getProject, PROJECTS } from '@/data/projects'

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

// ── Event Row ────────────────────────────────────────────────────

function WeekEventRow({ event }: { event: CalendarEvent }) {
  const { deleteEvent } = useEventStore()

  return (
    <div
      className="group flex items-center gap-2 py-1 px-1.5 rounded-sm"
      style={{ backgroundColor: event.color + '15' }}
    >
      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: event.color }} />
      <span className="text-xs flex-1 truncate" style={{ color: event.color }}>
        {event.time && <span className="opacity-60">{event.time} </span>}
        {event.title}
      </span>
      <button
        onClick={() => deleteEvent(event.id)}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0"
      >
        <X className="size-3" />
      </button>
    </div>
  )
}

// ── Task Row ─────────────────────────────────────────────────────

function WeekTaskRow({ todo }: { todo: Todo }) {
  const { toggleTodo, deleteTodo } = useTodoStore()
  const project = getProject(todo.projectSlug)
  const accentColor = project?.color ?? '#666'

  return (
    <div className="group flex items-center gap-2 py-1 px-1 rounded hover:bg-accent/20 transition-colors">
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
      <button
        onClick={() => deleteTodo(todo.id)}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0"
      >
        <X className="size-3" />
      </button>
    </div>
  )
}

// ── Day Column ───────────────────────────────────────────────────

const activeProjects = PROJECTS.filter(p => !p.parentSlug && p.weight > 0)

function DayColumn({ date, today, todos, events }: { date: Date; today: Date; todos: Todo[]; events: CalendarEvent[] }) {
  const dateStr = toDateStr(date)
  const isToday = dateStr === toDateStr(today)
  const isPast = date < today && !isToday
  const { addTodo } = useTodoStore()

  const [adding, setAdding] = useState(false)
  const [value, setValue] = useState('')
  const [projectSlug, setProjectSlug] = useState('tango')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (adding) {
      inputRef.current?.focus()
    }
  }, [adding])

  const handleAdd = () => {
    const trimmed = value.trim()
    if (trimmed) {
      addTodo(projectSlug, trimmed, undefined, undefined, dateStr)
      setValue('')
      // Keep input open for rapid entry
      setTimeout(() => inputRef.current?.focus(), 50)
      return
    }
    setAdding(false)
  }

  const currentProject = getProject(projectSlug)

  return (
    <div className={`min-w-[140px] flex-1 ${isPast ? 'opacity-50' : ''}`}>
      <div className="flex items-center gap-1 mb-1.5 px-1">
        <span className={`text-[10px] font-medium uppercase tracking-wider flex-1 ${
          isToday ? 'text-orange-400' : 'text-muted-foreground/60'
        }`}>
          {formatDayLabel(date, today)}
        </span>
        {!isPast && (
          <button
            onClick={() => setAdding(true)}
            className="text-muted-foreground/30 hover:text-muted-foreground transition-colors"
          >
            <Plus className="size-3" />
          </button>
        )}
      </div>

      {todos.length === 0 && events.length === 0 && !adding ? (
        <div className="text-[10px] text-muted-foreground/30 px-1 py-2">—</div>
      ) : (
        <div className="space-y-0.5">
          {events.map(event => (
            <WeekEventRow key={event.id} event={event} />
          ))}
          {todos.map(todo => (
            <WeekTaskRow key={todo.id} todo={todo} />
          ))}
        </div>
      )}

      {/* Quick-add input */}
      {adding && (
        <div className="mt-1 rounded border border-border/50 bg-accent/20 p-1.5">
          <div className="flex gap-1 mb-1.5">
            {activeProjects.map(p => (
              <button
                key={p.slug}
                onClick={() => setProjectSlug(p.slug)}
                className={`text-[9px] px-1.5 py-0.5 rounded transition-colors ${
                  projectSlug === p.slug
                    ? 'bg-accent text-foreground'
                    : 'text-muted-foreground/40 hover:text-muted-foreground'
                }`}
                title={p.name}
              >
                {p.emoji}
              </button>
            ))}
          </div>
          <input
            ref={inputRef}
            value={value}
            onChange={e => setValue(e.target.value)}
            onBlur={handleAdd}
            onKeyDown={e => {
              if (e.key === 'Enter') handleAdd()
              if (e.key === 'Escape') { setValue(''); setAdding(false) }
            }}
            placeholder={`Add to ${currentProject?.name ?? 'project'}...`}
            className="w-full text-[11px] bg-transparent outline-none placeholder:text-muted-foreground/30"
          />
        </div>
      )}
    </div>
  )
}

// ── Main Component ───────────────────────────────────────────────

export function ThisWeek() {
  const [open, setOpen] = useState(false)
  const { todos } = useTodoStore()
  const { events, fetchEvents } = useEventStore()

  useEffect(() => { fetchEvents() }, [fetchEvents])

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

  // Group events by date
  const eventBuckets = new Map<string, CalendarEvent[]>()
  for (const d of days) {
    eventBuckets.set(toDateStr(d), [])
  }
  for (const event of events) {
    const bucket = eventBuckets.get(event.date)
    if (bucket) bucket.push(event)
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
  for (const [, evts] of eventBuckets) {
    totalThisWeek += evts.length
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
              const dayEvents = eventBuckets.get(dateStr) ?? []
              return (
                <DayColumn
                  key={dateStr}
                  date={date}
                  today={today}
                  todos={dayTodos}
                  events={dayEvents}
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
