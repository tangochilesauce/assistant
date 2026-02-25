'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { ArrowLeft, Brain, Clock } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { getBrainFile } from '@/data/brain'
import { getProject } from '@/data/projects'
import { renderMarkdown } from '@/lib/render-markdown'

interface Props {
  slug: string
}

export function BrainDetailClient({ slug }: Props) {
  const brain = getBrainFile(slug)
  const project = getProject(slug)
  const rendered = useMemo(() => brain ? renderMarkdown(brain.content) : null, [brain])

  const title = project
    ? `${project.emoji} ${project.name} — Brain`
    : slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

  return (
    <>
      <PageHeader title={title}>
        <Link
          href="/brains"
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3" />
          All Brains
        </Link>
      </PageHeader>
      <div className="flex-1 overflow-y-auto">
        {rendered ? (
          <div className="px-4 py-4">
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-4 pb-2 border-b border-border/30">
              <Clock className="size-3" />
              <span>Source: brain/{brain!.path}</span>
            </div>
            <div className="max-w-3xl">{rendered}</div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
            <Brain className="size-8 opacity-30" />
            <p className="text-sm">No brain file found for this topic.</p>
          </div>
        )}
      </div>
    </>
  )
}
