'use client'

import { useEffect } from 'react'
import { useTodoStore } from '@/store/todo-store'

export function UndoListener() {
  const undo = useTodoStore(s => s.undo)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        // Don't undo if focused in an input/textarea (let browser handle it)
        const tag = (e.target as HTMLElement)?.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA') return

        e.preventDefault()
        undo()
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [undo])

  return null
}
