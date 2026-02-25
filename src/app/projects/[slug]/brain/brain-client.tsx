'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { ArrowLeft, Brain, Clock } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { getProject } from '@/data/projects'
import { getBrainFile } from '@/data/brain'

interface Props {
  slug: string
}

/* ── Markdown → React renderer ───────────────────────────────── */

interface MarkdownNode {
  type: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'ul' | 'ol' | 'li' | 'hr' | 'code' | 'table' | 'blockquote' | 'empty'
  content: string
  children?: MarkdownNode[]
  rows?: string[][]
  header?: string[]
}

function parseInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = []
  // Process: **bold**, `code`, [link](url), *italic*
  const regex = /(\*\*(.+?)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)|\*([^*]+)\*)/g
  let lastIndex = 0
  let match

  while ((match = regex.exec(text)) !== null) {
    // Text before match
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index))
    }

    if (match[2]) {
      // **bold**
      nodes.push(<strong key={match.index} className="font-semibold text-foreground">{match[2]}</strong>)
    } else if (match[3]) {
      // `code`
      nodes.push(
        <code key={match.index} className="px-1 py-0.5 rounded bg-accent text-xs font-mono">
          {match[3]}
        </code>
      )
    } else if (match[4] && match[5]) {
      // [link](url)
      nodes.push(
        <a key={match.index} href={match[5]} className="underline text-blue-400 hover:text-blue-300" target="_blank" rel="noopener noreferrer">
          {match[4]}
        </a>
      )
    } else if (match[6]) {
      // *italic*
      nodes.push(<em key={match.index}>{match[6]}</em>)
    }

    lastIndex = match.index + match[0].length
  }

  // Remaining text
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex))
  }

  return nodes.length > 0 ? nodes : [text]
}

function renderMarkdown(content: string): React.ReactNode[] {
  const lines = content.split('\n')
  const elements: React.ReactNode[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Empty line
    if (line.trim() === '') {
      i++
      continue
    }

    // Code block
    if (line.trim().startsWith('```')) {
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      i++ // skip closing ```
      elements.push(
        <pre key={`code-${i}`} className="bg-accent/50 border border-border/50 rounded-lg p-3 overflow-x-auto my-3">
          <code className="text-xs font-mono text-muted-foreground whitespace-pre">
            {codeLines.join('\n')}
          </code>
        </pre>
      )
      continue
    }

    // HTML comment
    if (line.trim().startsWith('<!--')) {
      while (i < lines.length && !lines[i].includes('-->')) i++
      i++
      continue
    }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      elements.push(<hr key={`hr-${i}`} className="border-border/50 my-4" />)
      i++
      continue
    }

    // Headers
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={`h1-${i}`} className="text-xl font-bold text-foreground mt-6 mb-3 first:mt-0">
          {parseInline(line.slice(2))}
        </h1>
      )
      i++
      continue
    }
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={`h2-${i}`} className="text-lg font-semibold text-foreground mt-6 mb-2 pb-1 border-b border-border/30">
          {parseInline(line.slice(3))}
        </h2>
      )
      i++
      continue
    }
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={`h3-${i}`} className="text-base font-medium text-foreground mt-4 mb-2">
          {parseInline(line.slice(4))}
        </h3>
      )
      i++
      continue
    }
    if (line.startsWith('#### ')) {
      elements.push(
        <h4 key={`h4-${i}`} className="text-sm font-medium text-muted-foreground mt-3 mb-1">
          {parseInline(line.slice(5))}
        </h4>
      )
      i++
      continue
    }

    // Table
    if (line.includes('|') && line.trim().startsWith('|')) {
      const tableLines: string[] = []
      while (i < lines.length && lines[i].includes('|') && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i])
        i++
      }

      if (tableLines.length >= 2) {
        const parseRow = (row: string) =>
          row.split('|').slice(1, -1).map(c => c.trim())

        const header = parseRow(tableLines[0])
        // Skip separator row (index 1)
        const bodyRows = tableLines.slice(2).map(parseRow)

        elements.push(
          <div key={`table-${i}`} className="overflow-x-auto my-3">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr>
                  {header.map((cell, ci) => (
                    <th key={ci} className="text-left px-2 py-1.5 border-b border-border font-medium text-muted-foreground">
                      {parseInline(cell)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bodyRows.map((row, ri) => (
                  <tr key={ri} className="border-b border-border/30 hover:bg-accent/20">
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-2 py-1.5 text-sm">
                        {parseInline(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }
      continue
    }

    // Blockquote
    if (line.startsWith('> ')) {
      const quoteLines: string[] = []
      while (i < lines.length && lines[i].startsWith('> ')) {
        quoteLines.push(lines[i].slice(2))
        i++
      }
      elements.push(
        <blockquote key={`bq-${i}`} className="border-l-2 border-border pl-3 my-2 text-sm text-muted-foreground italic">
          {quoteLines.map((ql, qi) => (
            <p key={qi}>{parseInline(ql)}</p>
          ))}
        </blockquote>
      )
      continue
    }

    // Unordered list (- or *)
    if (/^[\s]*[-*] /.test(line)) {
      const listItems: { indent: number; content: string; checked?: boolean }[] = []
      while (i < lines.length && /^[\s]*[-*] /.test(lines[i])) {
        const l = lines[i]
        const indent = l.length - l.trimStart().length
        let content = l.trim().slice(2)
        let checked: boolean | undefined = undefined
        if (content.startsWith('[x] ') || content.startsWith('[X] ')) {
          checked = true
          content = content.slice(4)
        } else if (content.startsWith('[ ] ')) {
          checked = false
          content = content.slice(4)
        }
        listItems.push({ indent, content, checked })
        i++
      }
      elements.push(
        <ul key={`ul-${i}`} className="my-2 space-y-0.5">
          {listItems.map((item, li) => (
            <li
              key={li}
              className="text-sm flex items-start gap-2"
              style={{ paddingLeft: `${Math.min(item.indent, 8) * 6}px` }}
            >
              {item.checked !== undefined ? (
                <span className={`shrink-0 mt-0.5 ${item.checked ? 'text-green-400' : 'text-muted-foreground'}`}>
                  {item.checked ? '✅' : '☐'}
                </span>
              ) : (
                <span className="shrink-0 text-muted-foreground mt-0.5">•</span>
              )}
              <span className={item.checked ? 'line-through text-muted-foreground' : ''}>
                {parseInline(item.content)}
              </span>
            </li>
          ))}
        </ul>
      )
      continue
    }

    // Ordered list (1. 2. etc)
    if (/^\d+\. /.test(line.trim())) {
      const listItems: string[] = []
      while (i < lines.length && /^\d+\. /.test(lines[i].trim())) {
        listItems.push(lines[i].trim().replace(/^\d+\.\s*/, ''))
        i++
      }
      elements.push(
        <ol key={`ol-${i}`} className="my-2 space-y-0.5 list-decimal list-inside">
          {listItems.map((item, li) => (
            <li key={li} className="text-sm">
              {parseInline(item)}
            </li>
          ))}
        </ol>
      )
      continue
    }

    // Paragraph (fallback)
    elements.push(
      <p key={`p-${i}`} className="text-sm leading-relaxed my-1.5">
        {parseInline(line)}
      </p>
    )
    i++
  }

  return elements
}

/* ── Brain Page ────────────────────────────────────────────────── */

export function BrainClient({ slug }: Props) {
  const project = getProject(slug)
  const brain = getBrainFile(slug)

  const rendered = useMemo(() => {
    if (!brain) return null
    return renderMarkdown(brain.content)
  }, [brain])

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

  return (
    <>
      <PageHeader title={`${project.emoji} ${project.name} — Brain`}>
        <Link
          href={`/projects/${slug}`}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3" />
          Back
        </Link>
      </PageHeader>

      <div className="flex-1 overflow-y-auto">
        {!brain ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
            <Brain className="size-8 opacity-30" />
            <p className="text-sm">No brain file for this project yet.</p>
            <p className="text-xs text-muted-foreground/60">
              Brain files live at pl8/brain/ and get baked into the app on deploy.
            </p>
          </div>
        ) : (
          <div className="px-4 py-4">
            {/* Meta */}
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-4 pb-2 border-b border-border/30">
              <Clock className="size-3" />
              <span>Source: brain/{brain.path}</span>
              <span className="text-muted-foreground/40">|</span>
              <span>Built: {new Date(brain.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </div>

            {/* Rendered markdown */}
            <div className="max-w-3xl">
              {rendered}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
