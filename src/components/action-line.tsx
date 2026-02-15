'use client'

import { X } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { ProjectBadge } from '@/components/project-badge'
import { useTodoStore, type Todo } from '@/store/todo-store'

interface ActionLineProps {
  todo: Todo
  showProject?: boolean
}

export function ActionLine({ todo, showProject = false }: ActionLineProps) {
  const { toggleTodo, deleteTodo } = useTodoStore()

  return (
    <div className="group flex items-center gap-3 px-4 py-2.5 hover:bg-accent/50 transition-colors border-b border-border/50 last:border-b-0">
      <Checkbox
        checked={todo.completed}
        onCheckedChange={() => toggleTodo(todo.id)}
        className="shrink-0"
      />
      <span className={`flex-1 text-sm ${todo.completed ? 'line-through text-muted-foreground' : ''}`}>
        {todo.title}
      </span>
      {showProject && <ProjectBadge slug={todo.projectSlug} />}
      {todo.dueDate && (
        <span className="text-xs text-muted-foreground">{todo.dueDate}</span>
      )}
      <button
        onClick={() => deleteTodo(todo.id)}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0"
      >
        <X className="size-3.5" />
      </button>
    </div>
  )
}
