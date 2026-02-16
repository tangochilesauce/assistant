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
}

interface TodoState {
  todos: Todo[]
  loading: boolean
  initialized: boolean
  fetchTodos: () => Promise<void>
  addTodo: (projectSlug: string, title: string, status?: string) => Promise<void>
  updateTodo: (id: string, changes: Partial<Pick<Todo, 'title' | 'dueDate'>>) => Promise<void>
  toggleTodo: (id: string) => Promise<void>
  deleteTodo: (id: string) => Promise<void>
  moveTodo: (id: string, newStatus: string, newSortOrder: number) => Promise<void>
  reorderTodo: (id: string, newSortOrder: number) => Promise<void>
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
  }
}

function generateId() {
  return crypto.randomUUID()
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
      })
    }
  }
  return todos
}

export const useTodoStore = create<TodoState>((set, get) => ({
  todos: [],
  loading: false,
  initialized: false,

  fetchTodos: async () => {
    if (get().initialized) return
    set({ loading: true })

    if (supabase) {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('sort_order', { ascending: true })

      if (!error && data) {
        set({ todos: data.map(rowToTodo), loading: false, initialized: true })
        return
      }
    }

    // Fallback: use default todos from project data
    set({ todos: getDefaultTodos(), loading: false, initialized: true })
  },

  addTodo: async (projectSlug: string, title: string, status?: string) => {
    const id = generateId()
    const firstCol = getFirstColumnId(projectSlug)
    const targetStatus = status ?? firstCol
    const sameTodos = get().todos.filter(t => t.projectSlug === projectSlug && t.status === targetStatus)
    const maxOrder = Math.max(0, ...sameTodos.map(t => t.sortOrder))
    const newTodo: Todo = {
      id,
      projectSlug,
      title,
      completed: targetStatus === getLastColumnId(projectSlug),
      createdAt: new Date().toISOString(),
      dueDate: null,
      sortOrder: maxOrder + 1,
      status: targetStatus,
    }

    set(state => ({ todos: [...state.todos, newTodo] }))

    if (supabase) {
      await supabase.from('todos').insert({
        id,
        project_slug: projectSlug,
        title,
        completed: newTodo.completed,
        created_at: newTodo.createdAt,
        due_date: null,
        sort_order: newTodo.sortOrder,
        status: newTodo.status,
      })
    }
  },

  updateTodo: async (id: string, changes: Partial<Pick<Todo, 'title' | 'dueDate'>>) => {
    set(state => ({
      todos: state.todos.map(t =>
        t.id === id ? { ...t, ...changes } : t
      ),
    }))

    if (supabase) {
      const row: Record<string, unknown> = {}
      if (changes.title !== undefined) row.title = changes.title
      if (changes.dueDate !== undefined) row.due_date = changes.dueDate
      await supabase.from('todos').update(row).eq('id', id)
    }
  },

  toggleTodo: async (id: string) => {
    const todo = get().todos.find(t => t.id === id)
    if (!todo) return

    const willComplete = !todo.completed
    const newStatus = willComplete
      ? getLastColumnId(todo.projectSlug)
      : getFirstColumnId(todo.projectSlug)

    set(state => ({
      todos: state.todos.map(t =>
        t.id === id ? { ...t, completed: willComplete, status: newStatus } : t
      ),
    }))

    if (supabase) {
      await supabase.from('todos').update({
        completed: willComplete,
        status: newStatus,
      }).eq('id', id)
    }
  },

  deleteTodo: async (id: string) => {
    set(state => ({ todos: state.todos.filter(t => t.id !== id) }))

    if (supabase) {
      await supabase.from('todos').delete().eq('id', id)
    }
  },

  // Move a todo to a different column (and/or position)
  moveTodo: async (id: string, newStatus: string, newSortOrder: number) => {
    const todo = get().todos.find(t => t.id === id)
    if (!todo) return

    const isCompleted = newStatus === getLastColumnId(todo.projectSlug)

    set(state => ({
      todos: state.todos.map(t =>
        t.id === id
          ? { ...t, status: newStatus, sortOrder: newSortOrder, completed: isCompleted }
          : t
      ),
    }))

    if (supabase) {
      await supabase.from('todos').update({
        status: newStatus,
        sort_order: newSortOrder,
        completed: isCompleted,
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
}))
