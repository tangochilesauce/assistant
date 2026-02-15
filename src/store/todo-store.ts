import { create } from 'zustand'
import { supabase, type TodoRow } from '@/lib/supabase'
import { PROJECTS } from '@/data/projects'

export interface Todo {
  id: string
  projectSlug: string
  title: string
  completed: boolean
  createdAt: string
  dueDate: string | null
  sortOrder: number
}

interface TodoState {
  todos: Todo[]
  loading: boolean
  initialized: boolean
  fetchTodos: () => Promise<void>
  addTodo: (projectSlug: string, title: string) => Promise<void>
  toggleTodo: (id: string) => Promise<void>
  deleteTodo: (id: string) => Promise<void>
}

function rowToTodo(row: TodoRow): Todo {
  return {
    id: row.id,
    projectSlug: row.project_slug,
    title: row.title,
    completed: row.completed,
    createdAt: row.created_at,
    dueDate: row.due_date,
    sortOrder: row.sort_order,
  }
}

function generateId() {
  return crypto.randomUUID()
}

// Seed data from project defaults (used when Supabase is not connected)
function getDefaultTodos(): Todo[] {
  const todos: Todo[] = []
  for (const project of PROJECTS) {
    for (let i = 0; i < project.defaultActions.length; i++) {
      todos.push({
        id: `${project.slug}-${i}`,
        projectSlug: project.slug,
        title: project.defaultActions[i],
        completed: false,
        createdAt: new Date().toISOString(),
        dueDate: null,
        sortOrder: i,
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

  addTodo: async (projectSlug: string, title: string) => {
    const id = generateId()
    const maxOrder = Math.max(0, ...get().todos.filter(t => t.projectSlug === projectSlug).map(t => t.sortOrder))
    const newTodo: Todo = {
      id,
      projectSlug,
      title,
      completed: false,
      createdAt: new Date().toISOString(),
      dueDate: null,
      sortOrder: maxOrder + 1,
    }

    set(state => ({ todos: [...state.todos, newTodo] }))

    if (supabase) {
      await supabase.from('todos').insert({
        id,
        project_slug: projectSlug,
        title,
        completed: false,
        created_at: newTodo.createdAt,
        due_date: null,
        sort_order: newTodo.sortOrder,
      })
    }
  },

  toggleTodo: async (id: string) => {
    const todo = get().todos.find(t => t.id === id)
    if (!todo) return

    set(state => ({
      todos: state.todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t),
    }))

    if (supabase) {
      await supabase.from('todos').update({ completed: !todo.completed }).eq('id', id)
    }
  },

  deleteTodo: async (id: string) => {
    set(state => ({ todos: state.todos.filter(t => t.id !== id) }))

    if (supabase) {
      await supabase.from('todos').delete().eq('id', id)
    }
  },
}))
