'use client'

import { useState, useMemo } from 'react'
import { Brain, ChevronRight, ChevronDown, FileText, FolderOpen, TreePine, List } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { BrainTree } from '@/components/brain-tree'
import { getAllBrainFiles, type BrainFile } from '@/data/brain'
import { PROJECTS } from '@/data/projects'
import { renderMarkdown } from '@/lib/render-markdown'
import { Button } from '@/components/ui/button'

/* ── Types ─────────────────────────────────────────────────────── */

interface BrainNode {
  slug: string
  label: string
  emoji: string
  color: string
  brain: BrainFile | null
  children: BrainNode[]
}

/* ── Build tree from projects + brain files ────────────────────── */

function buildTree(): BrainNode[] {
  const brains = getAllBrainFiles()
  const brainMap = Object.fromEntries(brains.map(b => [b.slug, b]))

  // State brain (top-level)
  const stateNode: BrainNode = {
    slug: '_state',
    label: 'State (Boot File)',
    emoji: '📋',
    color: '#6b7280',
    brain: brainMap['_state'] ?? null,
    children: [],
  }

  // Build from projects
  const rootProjects = PROJECTS.filter(p => !p.parentSlug)
  const nodes: BrainNode[] = [stateNode]

  for (const project of rootProjects) {
    const subs = PROJECTS.filter(p => p.parentSlug === project.slug)

    const children: BrainNode[] = subs.map(sub => ({
      slug: sub.slug,
      label: sub.name,
      emoji: sub.emoji,
      color: sub.color,
      brain: brainMap[sub.slug] ?? null,
      children: [],
    }))

    nodes.push({
      slug: project.slug,
      label: project.name,
      emoji: project.emoji,
      color: project.color,
      brain: brainMap[project.slug] ?? null,
      children,
    })
  }

  // Attach orphan brain files (no matching project) to nearest parent
  const claimedSlugs = new Set(['_state'])
  for (const node of nodes) {
    claimedSlugs.add(node.slug)
    for (const child of node.children) claimedSlugs.add(child.slug)
  }

  for (const brain of brains) {
    if (claimedSlugs.has(brain.slug)) continue

    const parentNode = nodes
      .filter(n => brain.slug.startsWith(n.slug + '-'))
      .sort((a, b) => b.slug.length - a.slug.length)[0]

    const rawLabel = parentNode
      ? brain.slug.slice(parentNode.slug.length + 1)
      : brain.slug

    const orphan: BrainNode = {
      slug: brain.slug,
      label: rawLabel.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' '),
      emoji: '📄',
      color: parentNode?.color ?? '#6b7280',
      brain,
      children: [],
    }

    if (parentNode) {
      parentNode.children.push(orphan)
    } else {
      nodes.push(orphan)
    }
  }

  return nodes
}

/* ── Brain Card (expanded view) ────────────────────────────────── */

function BrainCard({ brain, color }: { brain: BrainFile; color: string }) {
  const rendered = useMemo(() => renderMarkdown(brain.content), [brain])

  return (
    <div className="mt-2 ml-6 border-l-2 pl-4 pb-4" style={{ borderColor: color + '40' }}>
      <div className="text-[10px] text-muted-foreground/50 mb-2">
        brain/{brain.path} · {brain.content.length.toLocaleString()} chars
      </div>
      <div className="max-w-3xl">{rendered}</div>
    </div>
  )
}

/* ── Tree Node ─────────────────────────────────────────────────── */

function TreeNode({ node, depth = 0 }: { node: BrainNode; depth?: number }) {
  const [expanded, setExpanded] = useState(false)
  const hasContent = !!node.brain
  const hasChildren = node.children.length > 0

  return (
    <div className={depth > 0 ? 'ml-4' : ''}>
      {/* Node header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-colors ${
          expanded ? 'bg-accent/30' : 'hover:bg-accent/20'
        }`}
      >
        {/* Expand icon */}
        {hasContent || hasChildren ? (
          expanded ? (
            <ChevronDown className="size-3.5 text-muted-foreground shrink-0" />
          ) : (
            <ChevronRight className="size-3.5 text-muted-foreground shrink-0" />
          )
        ) : (
          <div className="w-3.5 shrink-0" />
        )}

        {/* Icon */}
        {hasChildren ? (
          <FolderOpen className="size-4 shrink-0" style={{ color: node.color }} />
        ) : (
          <FileText className="size-4 shrink-0" style={{ color: node.color }} />
        )}

        {/* Label */}
        <span className="text-sm font-medium" style={{ color: node.color }}>
          {node.emoji} {node.label}
        </span>

        {/* Status badge */}
        {hasContent ? (
          <span className="ml-auto text-[10px] text-muted-foreground/50 tabular-nums">
            {node.brain!.content.length.toLocaleString()} chars
          </span>
        ) : (
          <span className="ml-auto text-[10px] text-muted-foreground/30">no brain file</span>
        )}
      </button>

      {/* Expanded content */}
      {expanded && (
        <>
          {/* Brain file content */}
          {node.brain && <BrainCard brain={node.brain} color={node.color} />}

          {/* Child nodes */}
          {node.children.map(child => (
            <TreeNode key={child.slug} node={child} depth={depth + 1} />
          ))}
        </>
      )}
    </div>
  )
}

/* ── Page ──────────────────────────────────────────────────────── */

export default function BrainsPage() {
  const [view, setView] = useState<'tree' | 'list'>('tree')
  const tree = useMemo(() => buildTree(), [])
  const allBrains = getAllBrainFiles()
  const totalChars = allBrains.reduce((sum, b) => sum + b.content.length, 0)

  return (
    <>
      <PageHeader title="Brains" count={allBrains.length}>
        <div className="flex gap-1">
          <Button
            variant={view === 'tree' ? 'secondary' : 'ghost'}
            size="icon-xs"
            onClick={() => setView('tree')}
            title="Tree view"
          >
            <TreePine className="size-3.5" />
          </Button>
          <Button
            variant={view === 'list' ? 'secondary' : 'ghost'}
            size="icon-xs"
            onClick={() => setView('list')}
            title="List view"
          >
            <List className="size-3.5" />
          </Button>
        </div>
      </PageHeader>
      <div className="flex-1 overflow-y-auto">
        {view === 'tree' ? (
          <BrainTree />
        ) : (
          <>
            {/* Summary */}
            <div className="px-4 py-4 border-b border-border flex items-center gap-4">
              <Brain className="size-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">
                  {allBrains.length} brain files · {totalChars.toLocaleString()} total characters
                </p>
                <p className="text-[10px] text-muted-foreground/50 mt-0.5">
                  Click any node to expand. Brain files are baked into the app on each deploy.
                </p>
              </div>
            </div>

            {/* List */}
            <div className="px-4 py-4 space-y-1">
              {tree.map(node => (
                <TreeNode key={node.slug} node={node} />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  )
}
