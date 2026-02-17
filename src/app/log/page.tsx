'use client'

import { useEffect } from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { useTodoStore } from '@/store/todo-store'
import { getProject } from '@/data/projects'

function getCompletedDate(tags: string[]): string | null {
  const tag = tags.find(t => t.startsWith('completed:'))
  return tag ? tag.slice('completed:'.length) : null
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${days[date.getDay()]} ${months[date.getMonth()]} ${d}`
}

export default function LogPage() {
  const { todos, fetchTodos, initialized } = useTodoStore()

  useEffect(() => {
    fetchTodos()
  }, [fetchTodos])

  // Get all completed items, sorted by completion date (newest first)
  const completedItems = todos
    .filter(t => t.completed)
    .map(t => ({
      ...t,
      completedDate: getCompletedDate(t.tags),
    }))
    .sort((a, b) => {
      if (!a.completedDate && !b.completedDate) return 0
      if (!a.completedDate) return 1
      if (!b.completedDate) return -1
      return b.completedDate.localeCompare(a.completedDate)
    })

  // Group by date
  const grouped = new Map<string, typeof completedItems>()
  for (const item of completedItems) {
    const key = item.completedDate ?? 'Unknown'
    const list = grouped.get(key) ?? []
    list.push(item)
    grouped.set(key, list)
  }

  return (
    <>
      <PageHeader title="Completed" count={completedItems.length} />

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        {!initialized ? (
          <div className="text-sm text-muted-foreground text-center py-8">Loading...</div>
        ) : completedItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">📋</div>
            <div className="text-sm text-muted-foreground">No completed items yet</div>
          </div>
        ) : (
          <div className="space-y-6">
            {Array.from(grouped.entries()).map(([date, items]) => (
              <div key={date}>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground/50 mb-2 px-1">
                  {date === 'Unknown' ? 'Unknown date' : formatDate(date)}
                </div>
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  {items.map(item => {
                    const project = getProject(item.projectSlug)
                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 px-4 py-2.5 border-b border-border/50 last:border-0"
                      >
                        <span className="text-emerald-500 text-xs shrink-0">✓</span>
                        {project && (
                          <div
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: project.color }}
                            title={project.name}
                          />
                        )}
                        <span className="text-xs flex-1 text-muted-foreground">{item.title}</span>
                        <span
                          className="text-[10px] uppercase tracking-wider shrink-0"
                          style={{ color: project?.color, opacity: 0.5 }}
                        >
                          {project?.name}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
