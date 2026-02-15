import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import {
  type KanbanColumn,
  DEFAULT_COLUMNS,
  getProject,
} from '@/data/projects'

// ── Store Interface ───────────────────────────────────────────────

interface ColumnState {
  // Runtime overrides per project (project slug → columns)
  overrides: Record<string, KanbanColumn[]>
  initialized: boolean
  fetchColumns: () => Promise<void>
  getColumns: (projectSlug: string) => KanbanColumn[]
  getLastColumnId: (projectSlug: string) => string
  getFirstColumnId: (projectSlug: string) => string
}

// ── Store ─────────────────────────────────────────────────────────

export const useColumnStore = create<ColumnState>((set, get) => ({
  overrides: {},
  initialized: false,

  fetchColumns: async () => {
    if (get().initialized) return

    if (supabase) {
      const { data, error } = await supabase
        .from('kanban_columns')
        .select('*')
        .order('sort_order', { ascending: true })

      if (!error && data && data.length > 0) {
        // Group by project_slug
        const grouped: Record<string, KanbanColumn[]> = {}
        for (const row of data) {
          const slug = row.project_slug as string
          if (!grouped[slug]) grouped[slug] = []
          grouped[slug].push({
            id: row.column_id as string,
            label: row.label as string,
            color: (row.color as string) || undefined,
          })
        }
        set({ overrides: grouped, initialized: true })
        return
      }
    }

    // No overrides — use defaults from projects.ts
    set({ initialized: true })
  },

  getColumns: (projectSlug: string) => {
    const override = get().overrides[projectSlug]
    if (override) return override
    const project = getProject(projectSlug)
    return project?.defaultColumns ?? DEFAULT_COLUMNS
  },

  getLastColumnId: (projectSlug: string) => {
    const cols = get().getColumns(projectSlug)
    return cols[cols.length - 1].id
  },

  getFirstColumnId: (projectSlug: string) => {
    const cols = get().getColumns(projectSlug)
    return cols[0].id
  },
}))
