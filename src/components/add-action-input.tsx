'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useTodoStore } from '@/store/todo-store'

interface AddActionInputProps {
  projectSlug: string
}

export function AddActionInput({ projectSlug }: AddActionInputProps) {
  const [value, setValue] = useState('')
  const { addTodo } = useTodoStore()

  const handleSubmit = () => {
    const trimmed = value.trim()
    if (!trimmed) return
    addTodo(projectSlug, trimmed)
    setValue('')
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border/50">
      <Plus className="size-4 text-muted-foreground shrink-0" />
      <Input
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        placeholder="Add an action..."
        className="border-0 bg-transparent h-8 px-2 text-sm focus-visible:ring-0 placeholder:text-muted-foreground/50"
      />
    </div>
  )
}
