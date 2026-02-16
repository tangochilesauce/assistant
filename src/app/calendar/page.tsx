'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { useTodoStore } from '@/store/todo-store'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days: (number | null)[] = []

  // Leading empty cells
  for (let i = 0; i < firstDay; i++) days.push(null)
  // Actual days
  for (let d = 1; d <= daysInMonth; d++) days.push(d)

  return days
}

function toDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export default function CalendarPage() {
  const { todos, fetchTodos, initialized, toggleTodo } = useTodoStore()
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  useEffect(() => {
    fetchTodos()
  }, [fetchTodos])

  const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate())
  const days = getMonthDays(viewYear, viewMonth)

  // Build a map of date → todos
  const todosByDate = new Map<string, typeof todos>()
  for (const todo of todos) {
    if (todo.dueDate) {
      const list = todosByDate.get(todo.dueDate) || []
      list.push(todo)
      todosByDate.set(todo.dueDate, list)
    }
  }

  // For todos without due dates, show incomplete ones on today
  const undated = todos.filter(t => !t.dueDate && !t.completed)

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear(viewYear - 1)
    } else {
      setViewMonth(viewMonth - 1)
    }
  }

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear(viewYear + 1)
    } else {
      setViewMonth(viewMonth + 1)
    }
  }

  const goToday = () => {
    setViewYear(today.getFullYear())
    setViewMonth(today.getMonth())
  }

  const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth()

  return (
    <>
      <PageHeader title="Calendar">
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
            // Show undated todos on today's cell
            const showUndated = isToday
            const allTodos = showUndated ? [...dayTodos, ...undated] : dayTodos

            return (
              <div
                key={day}
                className={`border-r border-b border-border/50 min-h-[100px] ${
                  isWeekend ? 'bg-accent/10' : ''
                } ${isToday ? 'bg-primary/5' : ''}`}
              >
                <div className={`px-2 py-1 text-right ${isToday ? 'font-bold' : ''}`}>
                  <span className={`text-sm tabular-nums ${
                    isToday
                      ? 'bg-primary text-primary-foreground rounded-full w-7 h-7 inline-flex items-center justify-center'
                      : 'text-muted-foreground'
                  }`}>
                    {day}
                  </span>
                </div>
                <div className="px-1 pb-1 space-y-0.5">
                  {allTodos.slice(0, 4).map(todo => (
                    <div
                      key={todo.id}
                      className="flex items-start gap-1 px-1 py-0.5 rounded hover:bg-accent/50 transition-colors group"
                    >
                      <Checkbox
                        checked={todo.completed}
                        onCheckedChange={() => toggleTodo(todo.id)}
                        className="mt-0.5 shrink-0 size-3"
                      />
                      <span className={`text-[11px] leading-tight truncate ${
                        todo.completed ? 'line-through text-muted-foreground' : ''
                      }`}>
                        {todo.title}
                      </span>
                    </div>
                  ))}
                  {allTodos.length > 4 && (
                    <div className="text-[10px] text-muted-foreground px-1">
                      +{allTodos.length - 4} more
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
