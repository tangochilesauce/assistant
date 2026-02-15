'use client'

import { useEffect, useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { KanbanBoard } from '@/components/kanban/kanban-board'
import { useTodoStore } from '@/store/todo-store'
import { PROJECTS } from '@/data/projects'

export default function BoardPage() {
  const { todos, fetchTodos, initialized } = useTodoStore()

  useEffect(() => {
    fetchTodos()
  }, [fetchTodos])

  // Sort projects by weight descending
  const sortedProjects = [...PROJECTS].sort((a, b) => b.weight - a.weight)

  return (
    <>
      <PageHeader title="Board" />
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        {!initialized ? (
          <div className="text-sm text-muted-foreground text-center py-8">Loading...</div>
        ) : (
          <div className="space-y-6">
            {sortedProjects.map(project => {
              const projectTodos = todos.filter(t => t.projectSlug === project.slug)
              return (
                <ProjectSection
                  key={project.slug}
                  slug={project.slug}
                  emoji={project.emoji}
                  name={project.name}
                  color={project.color}
                  weight={project.weight}
                  todoCount={projectTodos.length}
                  defaultOpen={projectTodos.length > 0}
                />
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}

function ProjectSection({
  slug,
  emoji,
  name,
  color,
  weight,
  todoCount,
  defaultOpen,
}: {
  slug: string
  emoji: string
  name: string
  color: string
  weight: number
  todoCount: number
  defaultOpen: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 mb-3 group w-full text-left"
      >
        {open ? (
          <ChevronDown className="size-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="size-4 text-muted-foreground" />
        )}
        <span className="text-base">{emoji}</span>
        <span className="text-sm font-semibold" style={{ color }}>
          {name}
        </span>
        {weight > 0 && (
          <span className="text-xs text-muted-foreground tabular-nums">
            {weight}%
          </span>
        )}
        <span className="text-xs text-muted-foreground/50 tabular-nums ml-auto">
          {todoCount} {todoCount === 1 ? 'task' : 'tasks'}
        </span>
      </button>

      {open && (
        <KanbanBoard projectSlug={slug} showProject={false} />
      )}
    </div>
  )
}
