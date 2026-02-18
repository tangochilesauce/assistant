import { create } from 'zustand'
import { supabase, type TodoRow } from '@/lib/supabase'
import { PROJECTS, getLastColumnId, getFirstColumnId } from '@/data/projects'

export interface Todo {
  id: string
  projectSlug: string
  title: string
  completed: boolean
  createdAt: string
  dueDate: string | null
  sortOrder: number
  status: string       // kanban column id: 'todo', 'in-progress', 'done', etc.
  tags: string[]       // e.g. ["focus"] for daily focus items
  parentId: string | null  // for nested sub-tasks
}

const MAX_UNDO = 20

interface TodoState {
  todos: Todo[]
  loading: boolean
  initialized: boolean
  _undoStack: Todo[][]
  fetchTodos: () => Promise<void>
  addTodo: (projectSlug: string, title: string, status?: string, parentId?: string, dueDate?: string) => Promise<void>
  updateTodo: (id: string, changes: Partial<Pick<Todo, 'title' | 'dueDate' | 'tags'>>) => Promise<void>
  toggleTodo: (id: string) => Promise<void>
  toggleFocus: (id: string) => Promise<void>
  deleteTodo: (id: string) => Promise<void>
  moveTodoWithChildren: (id: string, newStatus: string, newSortOrder: number) => Promise<void>
  moveTodo: (id: string, newStatus: string, newSortOrder: number) => Promise<void>
  reorderTodo: (id: string, newSortOrder: number) => Promise<void>
  undo: () => Promise<void>
}

function rowToTodo(row: TodoRow): Todo {
  // Migration: derive status from completed if not set
  const status = row.status ?? (row.completed ? 'done' : 'todo')
  return {
    id: row.id,
    projectSlug: row.project_slug,
    title: row.title,
    completed: row.completed,
    createdAt: row.created_at,
    dueDate: row.due_date,
    sortOrder: row.sort_order,
    status,
    tags: row.tags ?? [],
    parentId: row.parent_id ?? null,
  }
}

function generateId() {
  return crypto.randomUUID()
}

// Get today's date string in PST (America/Los_Angeles)
function todayPST(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' }) // YYYY-MM-DD
}

// Extract the completed date from tags, e.g. "completed:2026-02-16"
function getCompletedDate(tags: string[]): string | null {
  const tag = tags.find(t => t.startsWith('completed:'))
  return tag ? tag.slice('completed:'.length) : null
}

// Seed data from project defaults (used when Supabase is not connected)
function getDefaultTodos(): Todo[] {
  const todos: Todo[] = []
  for (const project of PROJECTS) {
    const firstCol = getFirstColumnId(project.slug)
    for (let i = 0; i < project.defaultActions.length; i++) {
      todos.push({
        id: `${project.slug}-${i}`,
        projectSlug: project.slug,
        title: project.defaultActions[i],
        completed: false,
        createdAt: new Date().toISOString(),
        dueDate: null,
        sortOrder: i,
        status: firstCol,
        tags: [],
        parentId: null,
      })
    }
  }
  return todos
}

// Push a snapshot of the current todos onto the undo stack
function pushUndo(get: () => TodoState, set: (fn: (s: TodoState) => Partial<TodoState>) => void) {
  const snapshot = get().todos.map(t => ({ ...t }))
  set(s => ({
    _undoStack: [...s._undoStack.slice(-(MAX_UNDO - 1)), snapshot],
  }))
}

export const useTodoStore = create<TodoState>((set, get) => ({
  todos: [],
  loading: false,
  initialized: false,
  _undoStack: [],

  fetchTodos: async () => {
    if (get().initialized) return
    set({ loading: true })

    if (supabase) {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('sort_order', { ascending: true })

      if (!error && data) {
        const allTodos = data.map(rowToTodo)
        const today = todayPST()

        // Archive: mark old completed items so they hide from the board
        // but keep them in the DB for the log page
        const stale = allTodos.filter(t => {
          if (!t.completed) return false
          const doneDate = getCompletedDate(t.tags)
          return doneDate && doneDate < today
        })

        // Tag stale items as 'archived' so the board ignores them
        if (stale.length > 0) {
          const ids = stale.map(t => t.id)
          supabase.from('todos').update({ status: 'archived' }).in('id', ids).then(() => {
            console.log(`[PL8] Archived ${ids.length} completed items from before ${today}`)
          })
          // Update local state too
          for (const t of allTodos) {
            if (stale.some(s => s.id === t.id)) {
              t.status = 'archived'
            }
          }
        }

        set({ todos: allTodos, loading: false, initialized: true })
        return
      }
    }

    // Fallback: use default todos from project data
    set({ todos: getDefaultTodos(), loading: false, initialized: true })
  },

  addTodo: async (projectSlug: string, title: string, status?: string, parentId?: string, dueDate?: string) => {
    pushUndo(get, set)
    const id = generateId()
    const firstCol = getFirstColumnId(projectSlug)
    const targetStatus = status ?? firstCol
    // If adding a sub-task, inherit the parent's status
    const parentTodo = parentId ? get().todos.find(t => t.id === parentId) : null
    const finalStatus = parentTodo ? parentTodo.status : targetStatus
    const sameTodos = get().todos.filter(t => t.projectSlug === projectSlug && t.status === finalStatus)
    const maxOrder = Math.max(0, ...sameTodos.map(t => t.sortOrder))
    const newTodo: Todo = {
      id,
      projectSlug,
      title,
      completed: finalStatus === getLastColumnId(projectSlug),
      createdAt: new Date().toISOString(),
      dueDate: dueDate ?? null,
      sortOrder: maxOrder + 1,
      status: finalStatus,
      tags: [],
      parentId: parentId ?? null,
    }

    set(state => ({ todos: [...state.todos, newTodo] }))

    if (supabase) {
      const row: Record<string, unknown> = {
        id,
        project_slug: projectSlug,
        title,
        completed: newTodo.completed,
        created_at: newTodo.createdAt,
        due_date: dueDate ?? null,
        sort_order: newTodo.sortOrder,
        status: newTodo.status,
      }
      if (parentId) row.parent_id = parentId
      await supabase.from('todos').insert(row)
    }
  },

  updateTodo: async (id: string, changes: Partial<Pick<Todo, 'title' | 'dueDate' | 'tags'>>) => {
    set(state => ({
      todos: state.todos.map(t =>
        t.id === id ? { ...t, ...changes } : t
      ),
    }))

    if (supabase) {
      const row: Record<string, unknown> = {}
      if (changes.title !== undefined) row.title = changes.title
      if (changes.dueDate !== undefined) row.due_date = changes.dueDate
      if (changes.tags !== undefined) row.tags = changes.tags
      await supabase.from('todos').update(row).eq('id', id)
    }
  },

  toggleTodo: async (id: string) => {
    pushUndo(get, set)
    const todo = get().todos.find(t => t.id === id)
    if (!todo) return

    const willComplete = !todo.completed
    const newStatus = willComplete
      ? getLastColumnId(todo.projectSlug)
      : getFirstColumnId(todo.projectSlug)

    // Stamp or remove the completed:DATE tag
    let newTags = todo.tags.filter(t => !t.startsWith('completed:'))
    if (willComplete) {
      newTags = [...newTags, `completed:${todayPST()}`]
    }

    set(state => ({
      todos: state.todos.map(t =>
        t.id === id ? { ...t, completed: willComplete, status: newStatus, tags: newTags } : t
      ),
    }))

    if (supabase) {
      await supabase.from('todos').update({
        completed: willComplete,
        status: newStatus,
        tags: newTags,
      }).eq('id', id)
    }
  },

  toggleFocus: async (id: string) => {
    const todo = get().todos.find(t => t.id === id)
    if (!todo) return

    const isFocused = todo.tags.includes('focus')
    const newTags = isFocused
      ? todo.tags.filter(t => t !== 'focus')
      : [...todo.tags, 'focus']

    set(state => ({
      todos: state.todos.map(t =>
        t.id === id ? { ...t, tags: newTags } : t
      ),
    }))

    if (supabase) {
      await supabase.from('todos').update({ tags: newTags }).eq('id', id)
    }
  },

  deleteTodo: async (id: string) => {
    pushUndo(get, set)
    set(state => ({ todos: state.todos.filter(t => t.id !== id) }))

    if (supabase) {
      await supabase.from('todos').delete().eq('id', id)
    }
  },

  // Move a parent todo + all its children to a different column in one atomic update
  moveTodoWithChildren: async (id: string, newStatus: string, newSortOrder: number) => {
    pushUndo(get, set)
    const todo = get().todos.find(t => t.id === id)
    if (!todo) return

    const isCompleted = newStatus === getLastColumnId(todo.projectSlug)
    const children = get().todos.filter(t => t.parentId === id)
    const allIds = new Set([id, ...children.map(c => c.id)])

    let newTags = todo.tags.filter(t => !t.startsWith('completed:'))
    if (isCompleted) newTags = [...newTags, `completed:${todayPST()}`]

    // Single atomic state update — parent + all children move together
    set(state => ({
      todos: state.todos.map(t => {
        if (t.id === id) {
          return { ...t, status: newStatus, sortOrder: newSortOrder, completed: isCompleted, tags: newTags }
        }
        if (allIds.has(t.id)) {
          let childTags = t.tags.filter(tag => !tag.startsWith('completed:'))
          if (isCompleted) childTags = [...childTags, `completed:${todayPST()}`]
          return { ...t, status: newStatus, completed: isCompleted, tags: childTags }
        }
        return t
      }),
    }))

    if (supabase) {
      const updates = [
        supabase.from('todos').update({
          status: newStatus, sort_order: newSortOrder, completed: isCompleted, tags: newTags,
        }).eq('id', id),
        ...children.map(child => {
          let childTags = child.tags.filter(tag => !tag.startsWith('completed:'))
          if (isCompleted) childTags = [...childTags, `completed:${todayPST()}`]
          return supabase!.from('todos').update({
            status: newStatus, completed: isCompleted, tags: childTags,
          }).eq('id', child.id)
        }),
      ]
      await Promise.all(updates)
    }
  },

  // Move a single todo to a different column (and/or position)
  moveTodo: async (id: string, newStatus: string, newSortOrder: number) => {
    const todo = get().todos.find(t => t.id === id)
    if (!todo) return

    const isCompleted = newStatus === getLastColumnId(todo.projectSlug)

    // Stamp or remove the completed:DATE tag
    let newTags = todo.tags.filter(t => !t.startsWith('completed:'))
    if (isCompleted) {
      newTags = [...newTags, `completed:${todayPST()}`]
    }

    set(state => ({
      todos: state.todos.map(t =>
        t.id === id
          ? { ...t, status: newStatus, sortOrder: newSortOrder, completed: isCompleted, tags: newTags }
          : t
      ),
    }))

    if (supabase) {
      await supabase.from('todos').update({
        status: newStatus,
        sort_order: newSortOrder,
        completed: isCompleted,
        tags: newTags,
      }).eq('id', id)
    }
  },

  // Reorder within the same column
  reorderTodo: async (id: string, newSortOrder: number) => {
    set(state => ({
      todos: state.todos.map(t =>
        t.id === id ? { ...t, sortOrder: newSortOrder } : t
      ),
    }))

    if (supabase) {
      await supabase.from('todos').update({
        sort_order: newSortOrder,
      }).eq('id', id)
    }
  },

  // ── Undo ──────────────────────────────────────────────────────
  undo: async () => {
    const stack = get()._undoStack
    if (stack.length === 0) return

    const previous = stack[stack.length - 1]
    set(s => ({
      todos: previous,
      _undoStack: s._undoStack.slice(0, -1),
    }))

    // Sync to Supabase: full replace by upserting restored state
    if (supabase) {
      // Delete all current todos and re-insert the snapshot
      // This is brute-force but correct for undo
      const current = get().todos
      const ids = current.map(t => t.id)
      if (ids.length > 0) {
        await supabase.from('todos').delete().in('id', ids)
      }
      // Also clean up any todos that were in old state but not new
      const prevIds = previous.map(t => t.id)
      const staleIds = ids.filter(id => !prevIds.includes(id))
      if (staleIds.length > 0) {
        await supabase.from('todos').delete().in('id', staleIds)
      }
      // Upsert restored todos
      if (previous.length > 0) {
        const rows = previous.map(t => ({
          id: t.id,
          project_slug: t.projectSlug,
          title: t.title,
          completed: t.completed,
          created_at: t.createdAt,
          due_date: t.dueDate,
          sort_order: t.sortOrder,
          status: t.status,
          tags: t.tags,
          parent_id: t.parentId,
        }))
        await supabase.from('todos').upsert(rows)
      }
    }
  },
}))
