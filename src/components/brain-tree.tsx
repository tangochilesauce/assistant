'use client'

import { useMemo, useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import { getAllBrainFiles } from '@/data/brain'
import { PROJECTS } from '@/data/projects'

/* ── Types ─────────────────────────────────────────────────────── */

interface TreeNode {
  slug: string
  label: string
  emoji: string
  color: string
  summary: string
  href: string
  children: TreeNode[]
}

/* ── Build tree ────────────────────────────────────────────────── */

function buildTree(): TreeNode[] {
  const brains = getAllBrainFiles()
  const brainMap = Object.fromEntries(brains.map(b => [b.slug, b]))

  const rootProjects = PROJECTS.filter(p => !p.parentSlug)
  const nodes: TreeNode[] = []

  for (const project of rootProjects) {
    const brain = brainMap[project.slug]
    const subs = PROJECTS.filter(p => p.parentSlug === project.slug)

    const children: TreeNode[] = subs.map(sub => {
      const subBrain = brainMap[sub.slug]
      return {
        slug: sub.slug,
        label: sub.name,
        emoji: sub.emoji,
        color: sub.color,
        summary: subBrain?.summary || sub.goal,
        href: `/projects/${sub.slug}/brain`,
        children: [],
      }
    })

    nodes.push({
      slug: project.slug,
      label: project.name,
      emoji: project.emoji,
      color: project.color,
      summary: brain?.summary || project.goal,
      href: `/projects/${project.slug}/brain`,
      children,
    })
  }

  return nodes
}

/* ── Bubble ────────────────────────────────────────────────────── */

function Bubble({ node }: { node: TreeNode }) {
  return (
    <Link
      href={node.href}
      className="group flex flex-col items-center gap-1.5 w-[120px] shrink-0"
    >
      <div
        className="flex items-center justify-center w-14 h-14 rounded-2xl border-2 transition-all group-hover:scale-110 group-hover:shadow-lg"
        style={{
          borderColor: node.color,
          backgroundColor: node.color + '18',
          boxShadow: `0 0 0 0 ${node.color}40`,
        }}
      >
        <span className="text-xl">{node.emoji}</span>
      </div>
      <span
        className="text-[11px] font-semibold text-center leading-tight"
        style={{ color: node.color }}
      >
        {node.label}
      </span>
      <span className="text-[9px] text-muted-foreground/70 text-center leading-tight line-clamp-3 px-1">
        {node.summary}
      </span>
    </Link>
  )
}

/* ── Branch (parent + children) ────────────────────────────────── */

function Branch({ node }: { node: TreeNode }) {
  const parentRef = useRef<HTMLDivElement>(null)
  const childRefs = useRef<(HTMLDivElement | null)[]>([])
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [lines, setLines] = useState<{ x1: number; y1: number; x2: number; y2: number }[]>([])

  useEffect(() => {
    if (!node.children.length || !parentRef.current || !containerRef.current) return

    const container = containerRef.current.getBoundingClientRect()
    const parent = parentRef.current.getBoundingClientRect()

    const newLines = childRefs.current
      .filter((el): el is HTMLDivElement => el !== null)
      .map(childEl => {
        const child = childEl.getBoundingClientRect()
        return {
          x1: parent.left + parent.width / 2 - container.left,
          y1: parent.top + parent.height - container.top,
          x2: child.left + child.width / 2 - container.left,
          y2: child.top - container.top,
        }
      })

    setLines(newLines)
  }, [node.children.length])

  if (!node.children.length) {
    return <Bubble node={node} />
  }

  return (
    <div ref={containerRef} className="relative flex flex-col items-center">
      {/* SVG lines layer */}
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 0 }}
      >
        {lines.map((line, i) => {
          const midY = line.y1 + (line.y2 - line.y1) / 2
          return (
            <path
              key={i}
              d={`M ${line.x1} ${line.y1} C ${line.x1} ${midY}, ${line.x2} ${midY}, ${line.x2} ${line.y2}`}
              fill="none"
              stroke={node.color + '30'}
              strokeWidth={2}
            />
          )
        })}
      </svg>

      {/* Parent bubble */}
      <div ref={parentRef} className="relative z-10">
        <Bubble node={node} />
      </div>

      {/* Spacer for lines */}
      <div className="h-8" />

      {/* Children row */}
      <div className="relative z-10 flex gap-3 justify-center flex-wrap">
        {node.children.map((child, i) => (
          <div
            key={child.slug}
            ref={el => { childRefs.current[i] = el }}
          >
            <Bubble node={child} />
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Main Tree ─────────────────────────────────────────────────── */

export function BrainTree() {
  const tree = useMemo(() => buildTree(), [])

  return (
    <div className="px-4 py-8 overflow-x-auto">
      {/* Root nodes — laid out in a responsive grid */}
      <div className="flex flex-wrap justify-center gap-10">
        {tree.map(node => (
          <Branch key={node.slug} node={node} />
        ))}
      </div>
    </div>
  )
}
