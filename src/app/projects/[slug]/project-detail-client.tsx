'use client'

import { useEffect } from 'react'
import { Target } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { ActionLine } from '@/components/action-line'
import { AddActionInput } from '@/components/add-action-input'
import { KanbanBoard } from '@/components/kanban/kanban-board'
import { ProjectAbout } from '@/components/project-about'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useTodoStore } from '@/store/todo-store'
import { getProject } from '@/data/projects'
import { getAboutPage } from '@/data/about'

interface Props {
  slug: string
}

export function ProjectDetailClient({ slug }: Props) {
  const project = getProject(slug)
  const { todos, fetchTodos, initialized } = useTodoStore()
  const hasAbout = !!getAboutPage(slug)

  useEffect(() => {
    fetchTodos()
  }, [fetchTodos])

  if (!project) {
    return (
      <>
        <PageHeader title="Not Found" />
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          Project not found.
        </div>
      </>
    )
  }

  const projectTodos = todos.filter(t => t.projectSlug === slug)
  const incomplete = projectTodos.filter(t => !t.completed)
  const completed = projectTodos.filter(t => t.completed)

  return (
    <>
      <PageHeader title={`${project.emoji} ${project.name}`}>
        {project.weight > 0 && (
          <span className="text-xs text-muted-foreground tabular-nums bg-accent px-2 py-1 rounded">
            {project.weight}% weight
          </span>
        )}
      </PageHeader>

      <div className="flex-1 overflow-y-auto">
        {/* Goal */}
        <div className="px-4 py-4 border-b border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Target className="size-3.5" />
            <span>This month&apos;s goal</span>
          </div>
          <p className="text-sm" style={{ color: project.color }}>
            {project.goal}
          </p>
        </div>

        {!initialized ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">Loading...</div>
        ) : (
          <Tabs defaultValue="list" className="px-4 pt-4">
            <TabsList className="mb-4">
              <TabsTrigger value="list">List</TabsTrigger>
              <TabsTrigger value="board">Board</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="-mx-4">
              {/* Add action */}
              <AddActionInput projectSlug={slug} />

              {incomplete.length === 0 && completed.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No actions yet. Add one above.
                </div>
              )}

              {incomplete.map(todo => (
                <ActionLine key={todo.id} todo={todo} />
              ))}

              {completed.length > 0 && (
                <>
                  <div className="px-4 py-2 text-xs text-muted-foreground border-b border-border/50 bg-accent/30">
                    Completed ({completed.length})
                  </div>
                  {completed.map(todo => (
                    <ActionLine key={todo.id} todo={todo} />
                  ))}
                </>
              )}
            </TabsContent>

            <TabsContent value="board">
              <KanbanBoard projectSlug={slug} />
            </TabsContent>

            <TabsContent value="about" className="-mx-4">
              <ProjectAbout slug={slug} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </>
  )
}
