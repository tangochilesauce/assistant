'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { Target, Brain, StickyNote, Clock } from 'lucide-react'
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { PageHeader } from '@/components/layout/page-header'
import { ActionLine } from '@/components/action-line'
import { AddActionInput } from '@/components/add-action-input'
import { KanbanBoard } from '@/components/kanban/kanban-board'
import { ProjectAbout } from '@/components/project-about'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useTodoStore, type Todo } from '@/store/todo-store'
import { useNoteStore, type Note } from '@/store/note-store'
import { getProject, PROJECTS } from '@/data/projects'
import { getBrainFile, getAllBrainFiles } from '@/data/brain'
import { renderMarkdown } from '@/lib/render-markdown'

interface Props {
  slug: string
}

/* ── Inline Notes Panel ────────────────────────────────────────── */

function NotesPanel({ slug }: { slug: string }) {
  const { notes, fetchNotes, addNote, deleteNote, togglePin, initialized } = useNoteStore()

  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  const projectNotes = notes.filter(n => n.projectSlug === slug)
  const pinned = projectNotes.filter(n => n.pinned)
  const unpinned = projectNotes.filter(n => !n.pinned)

  const handleAdd = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      const value = (e.target as HTMLTextAreaElement).value.trim()
      if (value) {
        addNote(slug, value)
        ;(e.target as HTMLTextAreaElement).value = ''
      }
    }
  }

  return (
    <div className="-mx-4">
      <div className="px-4 py-3 border-b border-border/50">
        <textarea
          placeholder="Quick note... (⌘+Enter to save)"
          onKeyDown={handleAdd}
          className="w-full bg-accent/30 rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground/40 resize-none outline-none focus:ring-1 focus:ring-border min-h-[60px]"
          rows={2}
        />
      </div>

      {!initialized ? (
        <div className="px-4 py-8 text-center text-sm text-muted-foreground">Loading notes...</div>
      ) : projectNotes.length === 0 ? (
        <div className="px-4 py-8 text-center text-sm text-muted-foreground">
          No notes yet. Type above and hit ⌘+Enter.
        </div>
      ) : (
        <div className="px-4 py-3 space-y-2">
          {pinned.length > 0 && (
            <>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium">Pinned</div>
              {pinned.map(note => (
                <NoteCard key={note.id} note={note} onDelete={deleteNote} onTogglePin={togglePin} />
              ))}
            </>
          )}
          {unpinned.map(note => (
            <NoteCard key={note.id} note={note} onDelete={deleteNote} onTogglePin={togglePin} />
          ))}
        </div>
      )}
    </div>
  )
}

function NoteCard({ note, onDelete, onTogglePin }: {
  note: Note
  onDelete: (id: string) => void
  onTogglePin: (id: string) => void
}) {
  const age = getRelativeTime(note.createdAt)
  return (
    <div className="group bg-accent/20 rounded-lg px-3 py-2.5 border border-border/30">
      <p className="text-sm whitespace-pre-wrap">{note.content}</p>
      <div className="flex items-center gap-2 mt-1.5">
        <span className="text-[10px] text-muted-foreground/50">{age}</span>
        <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onTogglePin(note.id)} className={`text-[10px] px-1.5 py-0.5 rounded ${note.pinned ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
            {note.pinned ? '📌' : 'Pin'}
          </button>
          <button onClick={() => onDelete(note.id)} className="text-[10px] text-muted-foreground hover:text-red-400 px-1.5 py-0.5 rounded">
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

function getRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

/* ── Inline Brain Panel ────────────────────────────────────────── */

function BrainPanel({ slug }: { slug: string }) {
  const brain = getBrainFile(slug)
  const rendered = useMemo(() => {
    if (!brain) return null
    return renderMarkdown(brain.content)
  }, [brain])

  if (!brain) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3 -mx-4">
        <Brain className="size-8 opacity-30" />
        <p className="text-sm">No brain file for this project yet.</p>
      </div>
    )
  }

  return (
    <div className="-mx-4 px-4 py-2">
      <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-4 pb-2 border-b border-border/30">
        <Clock className="size-3" />
        <span>brain/{brain.path}</span>
        <span className="text-muted-foreground/40">|</span>
        <span>{new Date(brain.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
      </div>
      <div className="max-w-3xl">{rendered}</div>
    </div>
  )
}

/* ── Main Project Detail ───────────────────────────────────────── */

export function ProjectDetailClient({ slug }: Props) {
  const project = getProject(slug)
  const { todos, fetchTodos, initialized, reorderTodo } = useTodoStore()
  const hasBrain = !!getBrainFile(slug)

  // Extra brain files for this project (e.g. tango-notion-dump on tango page)
  // On life-admin page, also show orphaned brain files (strategy/financial docs)
  const extraBrains = useMemo(() => {
    const allBrains = getAllBrainFiles()
    const projectSlugs = new Set(PROJECTS.map(p => p.slug))

    // Brain files that match this project's prefix (e.g. tango-notion-dump on tango page)
    const prefixed = allBrains.filter(b =>
      b.slug.startsWith(slug + '-') && !projectSlugs.has(b.slug)
    )

    // On life-admin page, also include orphaned brain files (not matched to any project)
    if (slug === 'life-admin') {
      const orphaned = allBrains.filter(b =>
        b.slug !== '_state' && !projectSlugs.has(b.slug) && !prefixed.some(p => p.slug === b.slug)
      )
      return [...prefixed, ...orphaned]
    }

    return prefixed
  }, [slug])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  )

  const handleListDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const draggedTodo = active.data.current?.todo as Todo | undefined
    const overTodo = over.data.current?.todo as Todo | undefined
    if (!draggedTodo || !overTodo) return

    // Swap sort orders
    reorderTodo(draggedTodo.id, overTodo.sortOrder)
    reorderTodo(overTodo.id, draggedTodo.sortOrder)
  }, [reorderTodo])

  useEffect(() => { fetchTodos() }, [fetchTodos])

  if (!project) {
    return (
      <>
        <PageHeader title="Not Found" />
        <div className="flex-1 flex items-center justify-center text-muted-foreground">Project not found.</div>
      </>
    )
  }

  const projectTodos = todos.filter(t => t.projectSlug === slug)

  // Build child map for nesting
  const childMap = new Map<string, typeof projectTodos>()
  for (const t of projectTodos) {
    if (t.parentId) {
      const arr = childMap.get(t.parentId) ?? []
      arr.push(t)
      childMap.set(t.parentId, arr)
    }
  }

  // Only show top-level items in the list; children render nested
  const incomplete = projectTodos.filter(t => !t.completed && !t.parentId)
  const completed = projectTodos.filter(t => t.completed && !t.parentId)

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
        <div className="px-4 py-4 border-b border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Target className="size-3.5" />
            <span>This month&apos;s goal</span>
          </div>
          <p className="text-sm" style={{ color: project.color }}>{project.goal}</p>
        </div>

        {!initialized ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">Loading...</div>
        ) : (
          <Tabs defaultValue="list" className="px-4 pt-4">
            <TabsList className="mb-4">
              <TabsTrigger value="list">List</TabsTrigger>
              <TabsTrigger value="board">Board</TabsTrigger>
              {hasBrain && (
                <TabsTrigger value="brain" className="flex items-center gap-1">
                  <Brain className="size-3" />
                  Brain
                </TabsTrigger>
              )}
              {extraBrains.map(b => {
                const label = b.slug.slice(slug.length + 1).split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')
                return (
                  <TabsTrigger key={b.slug} value={b.slug} className="flex items-center gap-1">
                    <Brain className="size-3" />
                    {label}
                  </TabsTrigger>
                )
              })}
              <TabsTrigger value="notes" className="flex items-center gap-1">
                <StickyNote className="size-3" />
                Notes
              </TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="-mx-4">
              <AddActionInput projectSlug={slug} />
              {incomplete.length === 0 && completed.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">No actions yet. Add one above.</div>
              )}
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleListDragEnd}>
                <SortableContext items={incomplete.map(t => t.id)} strategy={verticalListSortingStrategy}>
                  {incomplete.map(todo => <ActionLine key={todo.id} todo={todo} subTasks={childMap.get(todo.id)} />)}
                </SortableContext>
              </DndContext>
              {completed.length > 0 && (
                <>
                  <div className="px-4 py-2 text-xs text-muted-foreground border-b border-border/50 bg-accent/30">Completed ({completed.length})</div>
                  {completed.map(todo => <ActionLine key={todo.id} todo={todo} subTasks={childMap.get(todo.id)} />)}
                </>
              )}
            </TabsContent>

            <TabsContent value="board">
              <KanbanBoard projectSlug={slug} />
            </TabsContent>

            {hasBrain && (
              <TabsContent value="brain">
                <BrainPanel slug={slug} />
              </TabsContent>
            )}

            {extraBrains.map(b => (
              <TabsContent key={b.slug} value={b.slug}>
                <BrainPanel slug={b.slug} />
              </TabsContent>
            ))}

            <TabsContent value="notes">
              <NotesPanel slug={slug} />
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
