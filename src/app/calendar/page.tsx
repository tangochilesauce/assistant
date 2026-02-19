'use client'

import { useEffect, useState, useRef } from 'react'
import { ChevronLeft, ChevronRight, X, Plus, DollarSign } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { useTodoStore } from '@/store/todo-store'
import { useEventStore, type CalendarEvent } from '@/store/event-store'
import { useFinancialEventStore } from '@/store/financial-event-store'
import { FINANCIAL_CATEGORY_COLORS, type FinancialEvent } from '@/lib/types/financial-event'
import { getProject } from '@/data/projects'
import { fmt } from '@/data/finance'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const EVENT_COLORS = ['#f97316', '#22c55e', '#0ea5e9', '#8b5cf6', '#ef4444', '#facc15', '#6b7280']

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days: (number | null)[] = []

  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) days.push(d)

  return days
}

function toDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

// Get financial events for a specific day of month
function getFinancialEventsForDay(
  financialEvents: FinancialEvent[],
  day: number,
  dateStr: string,
): FinancialEvent[] {
  const items: FinancialEvent[] = []

  for (const fe of financialEvents) {
    // Recurring: match on dueDay
    if (fe.recurring && fe.status === 'active' && fe.dueDay === day) {
      items.push(fe)
    }
    // One-time: match on exact dueDate
    if (!fe.recurring && fe.dueDate === dateStr && fe.status !== 'paid') {
      items.push(fe)
    }
  }

  return items
}

// ── Financial Event Row ─────────────────────────────────────────

function FinancialEventPill({ fe }: { fe: FinancialEvent }) {
  const color = fe.color ?? FINANCIAL_CATEGORY_COLORS[fe.category]
  const isExpense = fe.amount < 0
  const isUnpaid = fe.status === 'unpaid'

  return (
    <div
      className={`flex items-center gap-1 px-1.5 py-0.5 rounded-sm ${isUnpaid ? 'ring-1 ring-red-400/50' : ''}`}
      style={{ backgroundColor: color + '15' }}
    >
      <DollarSign className="size-2.5 shrink-0" style={{ color }} />
      <span className="text-[11px] leading-tight truncate flex-1" style={{ color }}>
        {fe.name}
      </span>
      <span className="text-[10px] tabular-nums shrink-0 font-medium" style={{ color }}>
        {isExpense ? '-' : '+'}${fmt(Math.abs(fe.amount))}
      </span>
    </div>
  )
}

export default function CalendarPage() {
  const { todos, fetchTodos, toggleTodo, deleteTodo } = useTodoStore()
  const { events, fetchEvents, addEvent, deleteEvent } = useEventStore()
  const { events: financialEvents, fetchEvents: fetchFinancialEvents } = useFinancialEventStore()
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [addingDate, setAddingDate] = useState<string | null>(null)
  const [addValue, setAddValue] = useState('')
  const [addColor, setAddColor] = useState(EVENT_COLORS[0])
  const addInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { fetchTodos() }, [fetchTodos])
  useEffect(() => { fetchEvents() }, [fetchEvents])
  useEffect(() => { fetchFinancialEvents() }, [fetchFinancialEvents])
  useEffect(() => {
    if (addingDate) {
      setTimeout(() => addInputRef.current?.focus(), 50)
    }
  }, [addingDate])

  const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate())
  const days = getMonthDays(viewYear, viewMonth)

  // Build maps
  const todosByDate = new Map<string, typeof todos>()
  for (const todo of todos) {
    if (todo.dueDate) {
      const list = todosByDate.get(todo.dueDate) || []
      list.push(todo)
      todosByDate.set(todo.dueDate, list)
    }
  }

  const eventsByDate = new Map<string, CalendarEvent[]>()
  for (const event of events) {
    const list = eventsByDate.get(event.date) || []
    list.push(event)
    eventsByDate.set(event.date, list)
  }

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1) }
    else setViewMonth(viewMonth - 1)
  }

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1) }
    else setViewMonth(viewMonth + 1)
  }

  const goToday = () => {
    setViewYear(today.getFullYear())
    setViewMonth(today.getMonth())
  }

  const handleAddEvent = () => {
    const trimmed = addValue.trim()
    if (trimmed && addingDate) {
      addEvent(trimmed, addingDate, addColor)
      setAddValue('')
      // Keep open for rapid entry
      setTimeout(() => addInputRef.current?.focus(), 50)
      return
    }
    setAddingDate(null)
    setAddValue('')
  }

  const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth()
  const datedCount = todos.filter(t => !t.completed && t.dueDate).length + events.length

  return (
    <>
      <PageHeader title="Calendar" count={datedCount}>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={prevMonth}>
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-sm font-medium min-w-[140px] text-center">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </span>
          <Button variant="ghost" size="sm" onClick={nextMonth}>
            <ChevronRight className="size-4" />
          </Button>
          {!isCurrentMonth && (
            <Button variant="outline" size="sm" onClick={goToday} className="ml-2 text-xs">
              Today
            </Button>
          )}
        </div>
      </PageHeader>

      <div className="flex-1 overflow-y-auto">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-border">
          {DAY_NAMES.map(d => (
            <div key={d} className="px-2 py-2 text-xs text-muted-foreground text-center font-medium">
              {d}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 auto-rows-fr">
          {days.map((day, i) => {
            if (day === null) {
              return <div key={`empty-${i}`} className="border-r border-b border-border/50 bg-accent/10 min-h-[100px]" />
            }

            const dateStr = toDateStr(viewYear, viewMonth, day)
            const isToday = dateStr === todayStr
            const isWeekend = (i % 7 === 0) || (i % 7 === 6)
            const dayTodos = todosByDate.get(dateStr) || []
            const dayEvents = eventsByDate.get(dateStr) || []
            const dayFinancial = getFinancialEventsForDay(financialEvents, day, dateStr)
            const isPast = dateStr < todayStr
            const isAdding = addingDate === dateStr

            return (
              <div
                key={day}
                className={`border-r border-b border-border/50 min-h-[100px] ${
                  isWeekend ? 'bg-accent/10' : ''
                } ${isToday ? 'bg-primary/5' : ''} ${isPast ? 'opacity-60' : ''}`}
              >
                {/* Day number + add button */}
                <div className={`px-2 py-1 flex items-center justify-between ${isToday ? 'font-bold' : ''}`}>
                  <button
                    onClick={() => { setAddingDate(isAdding ? null : dateStr); setAddValue(''); setAddColor(EVENT_COLORS[0]) }}
                    className="text-muted-foreground/30 hover:text-muted-foreground transition-colors"
                  >
                    <Plus className="size-3" />
                  </button>
                  <span className={`text-sm tabular-nums ${
                    isToday
                      ? 'bg-primary text-primary-foreground rounded-full w-7 h-7 inline-flex items-center justify-center'
                      : 'text-muted-foreground'
                  }`}>
                    {day}
                  </span>
                </div>

                <div className="px-1 pb-1 space-y-0.5">
                  {/* Financial events ($ pills) */}
                  {dayFinancial.map(fe => (
                    <FinancialEventPill key={fe.id} fe={fe} />
                  ))}

                  {/* Calendar events (colored pills, no checkbox) */}
                  {dayEvents.map(event => (
                    <div
                      key={event.id}
                      className="group flex items-center gap-1 px-1.5 py-0.5 rounded-sm transition-colors"
                      style={{ backgroundColor: event.color + '20' }}
                    >
                      <div
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: event.color }}
                      />
                      <span className="text-[11px] leading-tight truncate flex-1" style={{ color: event.color }}>
                        {event.time && <span className="opacity-60">{event.time} </span>}
                        {event.title}
                      </span>
                      <button
                        onClick={() => deleteEvent(event.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0"
                      >
                        <X className="size-2.5" />
                      </button>
                    </div>
                  ))}

                  {/* Todos (with checkbox) */}
                  {dayTodos.slice(0, 5).map(todo => {
                    const project = getProject(todo.projectSlug)
                    const accentColor = project?.color ?? '#666'
                    return (
                      <div
                        key={todo.id}
                        className="flex items-start gap-1 px-1 py-0.5 rounded hover:bg-accent/50 transition-colors group"
                      >
                        <Checkbox
                          checked={todo.completed}
                          onCheckedChange={() => toggleTodo(todo.id)}
                          className="mt-0.5 shrink-0 size-3"
                        />
                        <div
                          className="w-1.5 h-1.5 rounded-full shrink-0 mt-[3px]"
                          style={{ backgroundColor: accentColor }}
                          title={project?.name}
                        />
                        <span className={`text-[11px] leading-tight truncate flex-1 ${
                          todo.completed ? 'line-through text-muted-foreground' : ''
                        }`}>
                          {todo.title}
                        </span>
                        <button
                          onClick={() => deleteTodo(todo.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0 mt-0.5"
                        >
                          <X className="size-3" />
                        </button>
                      </div>
                    )
                  })}
                  {dayTodos.length > 5 && (
                    <div className="text-[10px] text-muted-foreground px-1">
                      +{dayTodos.length - 5} more
                    </div>
                  )}

                  {/* Quick-add event */}
                  {isAdding && (
                    <div className="mt-0.5 rounded border border-border/50 bg-accent/20 p-1">
                      <div className="flex items-center gap-0.5 mb-1">
                        {EVENT_COLORS.map(c => (
                          <button
                            key={c}
                            onClick={() => setAddColor(c)}
                            className={`w-3 h-3 rounded-full transition-all ${
                              addColor === c ? 'ring-1 ring-foreground ring-offset-1 ring-offset-background scale-110' : 'opacity-50 hover:opacity-100'
                            }`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                        <button
                          onMouseDown={e => { e.preventDefault(); setAddValue(''); setAddingDate(null) }}
                          className="ml-auto text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                        >
                          <X className="size-3" />
                        </button>
                      </div>
                      <input
                        ref={addInputRef}
                        value={addValue}
                        onChange={e => setAddValue(e.target.value)}
                        onBlur={handleAddEvent}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleAddEvent()
                          if (e.key === 'Escape') { setAddValue(''); setAddingDate(null) }
                        }}
                        placeholder="Event..."
                        className="w-full text-[11px] bg-transparent outline-none placeholder:text-muted-foreground/30"
                      />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
