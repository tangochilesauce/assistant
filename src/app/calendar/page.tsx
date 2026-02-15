'use client'

import { useEffect } from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { Checkbox } from '@/components/ui/checkbox'
import { ProjectBadge } from '@/components/project-badge'
import { useTodoStore } from '@/store/todo-store'
import { PROJECTS } from '@/data/projects'

const DAYS_TO_SHOW = 14

function getDays() {
  const days: Date[] = []
  const today = new Date()
  for (let i = 0; i < DAYS_TO_SHOW; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() + i)
    days.push(d)
  }
  return days
}

function formatDay(d: Date) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return {
    dayName: days[d.getDay()],
    date: d.getDate(),
    month: months[d.getMonth()],
    isToday: d.toDateString() === new Date().toDateString(),
    isWeekend: d.getDay() === 0 || d.getDay() === 6,
  }
}

export default function CalendarPage() {
  const { todos, fetchTodos, initialized, toggleTodo } = useTodoStore()

  useEffect(() => {
    fetchTodos()
  }, [fetchTodos])

  const days = getDays()

  // For now, spread all incomplete todos across the first 7 days as a placeholder
  // When todos have due dates, they'll be placed on the correct day
  const incomplete = todos.filter(t => !t.completed)

  return (
    <>
      <PageHeader title="Calendar" />
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-7 border-b border-border">
          {days.slice(0, 7).map((day, i) => {
            const { dayName, date, month, isToday, isWeekend } = formatDay(day)
            return (
              <div
                key={i}
                className={`border-r border-border last:border-r-0 ${isWeekend ? 'bg-accent/20' : ''}`}
              >
                <div className={`px-2 py-2 border-b border-border ${isToday ? 'bg-primary/10' : ''}`}>
                  <div className="text-xs text-muted-foreground">{dayName}</div>
                  <div className={`text-lg font-semibold tabular-nums ${isToday ? 'text-primary' : ''}`}>
                    {date}
                  </div>
                  <div className="text-xs text-muted-foreground">{month}</div>
                </div>
                <div className="p-1.5 min-h-[120px]">
                  {/* Show todos distributed across days for now */}
                  {incomplete
                    .filter((_, idx) => idx % 7 === i)
                    .map(todo => (
                      <div
                        key={todo.id}
                        className="flex items-start gap-1.5 mb-1 p-1 rounded hover:bg-accent/50 transition-colors"
                      >
                        <Checkbox
                          checked={todo.completed}
                          onCheckedChange={() => toggleTodo(todo.id)}
                          className="mt-0.5 shrink-0 size-3"
                        />
                        <span className="text-xs leading-tight truncate">{todo.title}</span>
                      </div>
                    ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Second week */}
        <div className="grid grid-cols-7">
          {days.slice(7, 14).map((day, i) => {
            const { dayName, date, month, isToday, isWeekend } = formatDay(day)
            return (
              <div
                key={i}
                className={`border-r border-border last:border-r-0 ${isWeekend ? 'bg-accent/20' : ''}`}
              >
                <div className={`px-2 py-2 border-b border-border ${isToday ? 'bg-primary/10' : ''}`}>
                  <div className="text-xs text-muted-foreground">{dayName}</div>
                  <div className={`text-lg font-semibold tabular-nums ${isToday ? 'text-primary' : ''}`}>
                    {date}
                  </div>
                  <div className="text-xs text-muted-foreground">{month}</div>
                </div>
                <div className="p-1.5 min-h-[120px]" />
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
