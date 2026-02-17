'use client'

import { useEffect, useState, useRef } from 'react'
import { Pin, X, StickyNote, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { PageHeader } from '@/components/layout/page-header'
import { useNoteStore, type Note } from '@/store/note-store'
import { getProject } from '@/data/projects'

interface Props {
  slug: string
}

/* ── Relative timestamp ─────────────────────────────────────── */
function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/* ── Note Card ──────────────────────────────────────────────── */
function NoteCard({
  note,
  color,
}: {
  note: Note
  color: string
}) {
  const { updateNote, deleteNote, togglePin } = useNoteStore()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(note.content)
  const textRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (editing && textRef.current) {
      textRef.current.focus()
      textRef.current.selectionStart = textRef.current.value.length
    }
  }, [editing])

  const save = () => {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== note.content) {
      updateNote(note.id, { content: trimmed })
    }
    setEditing(false)
  }

  return (
    <div className="group relative border border-border/60 rounded-lg p-3 hover:border-border transition-colors">
      {/* Pin indicator */}
      {note.pinned && (
        <div className="absolute -top-1.5 -right-1.5">
          <Pin className="size-3 rotate-45" style={{ color }} />
        </div>
      )}

      {/* Content */}
      {editing ? (
        <textarea
          ref={textRef}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={save}
          onKeyDown={e => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) save()
            if (e.key === 'Escape') { setDraft(note.content); setEditing(false) }
          }}
          className="w-full bg-transparent text-sm resize-none outline-none min-h-[60px]"
          rows={3}
        />
      ) : (
        <p
          className="text-sm whitespace-pre-wrap cursor-pointer leading-relaxed"
          onClick={() => { setEditing(true); setDraft(note.content) }}
        >
          {note.content}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/30">
        <span className="text-[10px] text-muted-foreground">{timeAgo(note.createdAt)}</span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => togglePin(note.id)}
            className={`p-1 rounded hover:bg-accent transition-colors ${note.pinned ? 'text-foreground' : 'text-muted-foreground'}`}
            title={note.pinned ? 'Unpin' : 'Pin'}
          >
            <Pin className="size-3" />
          </button>
          <button
            onClick={() => deleteNote(note.id)}
            className="p-1 rounded text-muted-foreground hover:text-red-400 hover:bg-accent transition-colors"
            title="Delete"
          >
            <X className="size-3" />
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Main Page ──────────────────────────────────────────────── */
export function NotesClient({ slug }: Props) {
  const project = getProject(slug)
  const { notes, fetchNotes, addNote, initialized } = useNoteStore()
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

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

  const projectNotes = notes.filter(n => n.projectSlug === slug)
  const pinned = projectNotes.filter(n => n.pinned)
  const unpinned = projectNotes.filter(n => !n.pinned)

  const handleSubmit = () => {
    const trimmed = input.trim()
    if (!trimmed) return
    addNote(slug, trimmed)
    setInput('')
    inputRef.current?.focus()
  }

  return (
    <>
      <PageHeader title={`${project.emoji} ${project.name} — Notes`} count={projectNotes.length}>
        <Link
          href={`/projects/${slug}`}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3" />
          Back
        </Link>
      </PageHeader>

      <div className="flex-1 overflow-y-auto">
        {/* Input */}
        <div className="px-4 py-3 border-b border-border">
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit()
              }}
              placeholder="Quick note, idea, tagline, link..."
              className="flex-1 bg-accent/30 rounded-md px-3 py-2 text-sm resize-none outline-none placeholder:text-muted-foreground/50 border border-border/50 focus:border-border"
              rows={2}
            />
            <button
              onClick={handleSubmit}
              disabled={!input.trim()}
              className="self-end px-3 py-1.5 rounded-md text-xs font-medium transition-colors disabled:opacity-30"
              style={{
                backgroundColor: input.trim() ? project.color : undefined,
                color: input.trim() ? '#000' : undefined,
              }}
            >
              Add
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">⌘+Enter to save</p>
        </div>

        {!initialized ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">Loading...</div>
        ) : projectNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
            <StickyNote className="size-8 opacity-30" />
            <p className="text-sm">No notes yet. Jot something down.</p>
          </div>
        ) : (
          <div className="px-4 py-4 space-y-6">
            {/* Pinned */}
            {pinned.length > 0 && (
              <div>
                <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1">
                  <Pin className="size-2.5" />
                  Pinned
                </h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {pinned.map(note => (
                    <NoteCard key={note.id} note={note} color={project.color} />
                  ))}
                </div>
              </div>
            )}

            {/* All notes */}
            {unpinned.length > 0 && (
              <div>
                {pinned.length > 0 && (
                  <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                    All Notes
                  </h3>
                )}
                <div className="grid gap-2 sm:grid-cols-2">
                  {unpinned.map(note => (
                    <NoteCard key={note.id} note={note} color={project.color} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
