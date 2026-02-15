'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { PageHeader } from '@/components/layout/page-header'
import { PROJECTS } from '@/data/projects'
import { useTodoStore } from '@/store/todo-store'

export default function ProjectsPage() {
  const { todos, fetchTodos, initialized } = useTodoStore()

  useEffect(() => {
    fetchTodos()
  }, [fetchTodos])

  return (
    <>
      <PageHeader title="Projects" count={PROJECTS.length} />
      <div className="flex-1 overflow-y-auto">
        {/* Column headers */}
        <div className="grid grid-cols-[1fr_80px_1fr_100px] gap-4 px-4 py-2 text-xs text-muted-foreground border-b border-border">
          <span>Name</span>
          <span>Weight</span>
          <span>Goal</span>
          <span className="text-right">Actions</span>
        </div>

        {/* Project rows */}
        {PROJECTS.map(project => {
          const projectTodos = initialized ? todos.filter(t => t.projectSlug === project.slug) : []
          const incomplete = projectTodos.filter(t => !t.completed).length
          const total = projectTodos.length

          return (
            <Link
              key={project.slug}
              href={`/projects/${project.slug}`}
              className="grid grid-cols-[1fr_80px_1fr_100px] gap-4 px-4 py-3 items-center hover:bg-accent/50 transition-colors border-b border-border/50"
            >
              <div className="flex items-center gap-2">
                <span>{project.emoji}</span>
                <span className="text-sm font-medium" style={{ color: project.color }}>
                  {project.name}
                </span>
              </div>
              <div className="text-sm text-muted-foreground tabular-nums">
                {project.weight > 0 ? `${project.weight}%` : '—'}
              </div>
              <div className="text-sm text-muted-foreground truncate">
                {project.goal}
              </div>
              <div className="text-sm text-right tabular-nums">
                {total > 0 ? (
                  <span>
                    <span className={incomplete > 0 ? 'text-foreground' : 'text-muted-foreground'}>
                      {incomplete}
                    </span>
                    <span className="text-muted-foreground">/{total}</span>
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </>
  )
}
