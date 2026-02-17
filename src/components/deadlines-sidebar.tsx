'use client'

import { useState, useRef, useEffect } from 'react'
import { CalendarClock, Plus, X, CircleDollarSign } from 'lucide-react'
import { useTodoStore, type Todo } from '@/store/todo-store'
import { getProject, PROJECTS } from '@/data/projects'

// ── Financial Data ───────────────────────────────────────────────

const DEBTS = [
  { name: 'Deep (ingredients)', amount: 699, due: 'Feb 23' },
  { name: 'Off Record Studio', amount: 300, due: 'Mar 1' },
  { name: 'Acorn (boxes)', amount: 804, due: 'Next run' },
  { name: 'Labels', amount: 1500, due: 'Next run' },
]

const UPCOMING_PAYMENTS = [
  { name: 'Rent', amount: 2878, due: 'Mar 1' },
  { name: 'Daylight shipping', amount: 400, due: 'Feb 19' },
  { name: 'Foodies hand-fill', amount: 1100, due: 'Feb 23' },
]

const UPCOMING_INCOME = [
  { name: 'Amazon payout', amount: 561, due: '~Feb 17', status: 'expected' as const },
  { name: 'UNFI MOR', amount: 3422, due: '~Feb 23', status: 'expected' as const },
  { name: 'EXP invoice', amount: 3400, due: '~Mar 21', status: 'pending' as const },
]

function formatDeadline(dateStr: string): string {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const [y, m, d] = dateStr.split('-').map(Number)
  const target = new Date(y, m - 1, d)
  const diff = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diff < 0) return `${Math.abs(diff)}d overdue`
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  return `${diff}d`
}

function urgencyColor(dateStr: string): string {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const [y, m, d] = dateStr.split('-').map(Number)
  const target = new Date(y, m - 1, d)
  const diff = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diff < 0) return 'text-red-400'
  if (diff === 0) return 'text-orange-400'
  if (diff <= 2) return 'text-yellow-400'
  return 'text-muted-foreground'
}

function formatDateShort(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return `${days[date.getDay()]} ${months[date.getMonth()]} ${d}`
}

interface DeadlineItem {
  todo: Todo
  dateStr: string
}

function DeadlineRow({ todo, dateStr }: DeadlineItem) {
  const { updateTodo } = useTodoStore()
  const [editingDate, setEditingDate] = useState(false)
  const dateInputRef = useRef<HTMLInputElement>(null)
  const project = getProject(todo.projectSlug)
  const accentColor = project?.color ?? '#666'

  useEffect(() => {
    if (editingDate && dateInputRef.current) {
      dateInputRef.current.showPicker?.()
    }
  }, [editingDate])

  const handleDateChange = (newDate: string) => {
    if (newDate) {
      updateTodo(todo.id, { dueDate: newDate })
    }
    setEditingDate(false)
  }

  const removeDeadline = (e: React.MouseEvent) => {
    e.stopPropagation()
    const newTags = todo.tags.filter(t => t !== 'deadline')
    updateTodo(todo.id, { tags: newTags })
  }

  return (
    <div className="px-2 py-1.5 rounded-md hover:bg-accent/30 transition-colors group">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs truncate flex-1">{todo.title}</span>
        <div className="flex items-center gap-1 shrink-0">
          {editingDate ? (
            <input
              ref={dateInputRef}
              type="date"
              defaultValue={dateStr}
              onChange={e => handleDateChange(e.target.value)}
              onBlur={() => setEditingDate(false)}
              className="text-[10px] bg-transparent border border-border rounded px-1 w-[110px] outline-none"
            />
          ) : (
            <button
              onClick={() => setEditingDate(true)}
              className={`text-[10px] font-medium tabular-nums ${urgencyColor(dateStr)} hover:underline cursor-pointer`}
              title={`${formatDateShort(dateStr)} — click to change`}
            >
              {formatDeadline(dateStr)}
            </button>
          )}
          <button
            onClick={removeDeadline}
            className="opacity-0 group-hover:opacity-60 hover:opacity-100 transition-opacity"
            title="Remove from deadlines"
          >
            <X className="size-2.5" />
          </button>
        </div>
      </div>
      <span
        className="text-[9px] uppercase tracking-wider"
        style={{ color: accentColor, opacity: 0.6 }}
      >
        {project?.name}
      </span>
    </div>
  )
}

function AddDeadlineRow() {
  const { todos, updateTodo } = useTodoStore()
  const [open, setOpen] = useState(false)
  const [selectedTodo, setSelectedTodo] = useState('')
  const [selectedDate, setSelectedDate] = useState('')

  // Show todos not already tagged as deadline
  const availableTodos = todos.filter(t => !t.completed && !t.tags?.includes('deadline'))

  const handleAdd = () => {
    if (selectedTodo && selectedDate) {
      const todo = todos.find(t => t.id === selectedTodo)
      if (todo) {
        const newTags = [...(todo.tags || []), 'deadline']
        updateTodo(selectedTodo, { dueDate: selectedDate, tags: newTags })
      }
      setSelectedTodo('')
      setSelectedDate('')
      setOpen(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-2 py-1.5 text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors w-full"
      >
        <Plus className="size-3" />
        <span>Add deadline</span>
      </button>
    )
  }

  return (
    <div className="px-2 py-2 space-y-1.5 bg-accent/20 rounded-md">
      <select
        value={selectedTodo}
        onChange={e => {
          setSelectedTodo(e.target.value)
          // Pre-fill date if task already has one
          const t = todos.find(todo => todo.id === e.target.value)
          if (t?.dueDate && !selectedDate) setSelectedDate(t.dueDate)
        }}
        className="w-full text-[10px] bg-transparent border border-border rounded px-1.5 py-1 outline-none"
      >
        <option value="">Pick a task...</option>
        {PROJECTS.map(project => {
          const projectTodos = availableTodos.filter(t => t.projectSlug === project.slug)
          if (projectTodos.length === 0) return null
          return (
            <optgroup key={project.slug} label={`${project.emoji} ${project.name}`}>
              {projectTodos.map(t => (
                <option key={t.id} value={t.id}>
                  {t.title}{t.dueDate ? ` (${t.dueDate})` : ''}
                </option>
              ))}
            </optgroup>
          )
        })}
      </select>
      <input
        type="date"
        value={selectedDate}
        onChange={e => setSelectedDate(e.target.value)}
        className="w-full text-[10px] bg-transparent border border-border rounded px-1.5 py-1 outline-none"
      />
      <div className="flex gap-1">
        <button
          onClick={handleAdd}
          disabled={!selectedTodo || !selectedDate}
          className="flex-1 text-[10px] bg-primary/20 hover:bg-primary/30 disabled:opacity-30 rounded px-2 py-0.5 transition-colors"
        >
          Add
        </button>
        <button
          onClick={() => setOpen(false)}
          className="text-[10px] text-muted-foreground hover:text-foreground px-2 py-0.5 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

function FinancialSection({ title, icon, items, color }: {
  title: string
  icon: React.ReactNode
  items: { name: string; amount: number; due: string; status?: string }[]
  color: string
}) {
  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 px-2 py-2 mb-1">
        {icon}
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
      </div>
      <div className="space-y-0.5">
        {items.map(item => (
          <div key={item.name} className="px-2 py-1 rounded-md hover:bg-accent/30 transition-colors">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-xs truncate flex-1">{item.name}</span>
              <span className={`text-[10px] font-medium tabular-nums shrink-0 ${color}`}>
                ${item.amount.toLocaleString()}
              </span>
            </div>
            <span className="text-[9px] text-muted-foreground/50">{item.due}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function DeadlinesSidebar() {
  const { todos } = useTodoStore()

  // Find all incomplete todos tagged as 'deadline' with a dueDate
  const deadlines: DeadlineItem[] = todos
    .filter(t => !t.completed && t.dueDate && t.tags?.includes('deadline'))
    .map(t => ({ todo: t, dateStr: t.dueDate! }))
    .sort((a, b) => a.dateStr.localeCompare(b.dateStr))

  return (
    <div className="w-[240px] shrink-0 hidden lg:block">
      <div className="sticky top-0 max-h-screen overflow-y-auto pb-6">
        {/* Deadlines */}
        <div className="flex items-center gap-2 px-2 py-2.5 mb-2">
          <CalendarClock className="size-3.5 text-muted-foreground/60" />
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Deadlines
          </span>
          <span className="text-[10px] text-muted-foreground/60 tabular-nums ml-auto">
            {deadlines.length}
          </span>
        </div>

        <div className="space-y-1">
          {deadlines.map(({ todo, dateStr }) => (
            <DeadlineRow key={todo.id} todo={todo} dateStr={dateStr} />
          ))}
          <AddDeadlineRow />
        </div>

        {/* Outstanding Debts */}
        <FinancialSection
          title="Debts"
          icon={<CircleDollarSign className="size-3.5 text-red-400/60" />}
          items={DEBTS}
          color="text-red-400"
        />

        {/* Upcoming Payments */}
        <FinancialSection
          title="Payments Due"
          icon={<CircleDollarSign className="size-3.5 text-amber-400/60" />}
          items={UPCOMING_PAYMENTS}
          color="text-amber-400"
        />

        {/* Upcoming Income */}
        <FinancialSection
          title="Income Coming"
          icon={<CircleDollarSign className="size-3.5 text-emerald-400/60" />}
          items={UPCOMING_INCOME}
          color="text-emerald-400"
        />
      </div>
    </div>
  )
}
