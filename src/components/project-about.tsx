'use client'

import { getAboutPage, type AboutSection } from '@/data/about'
import { getProject } from '@/data/projects'

interface ProjectAboutProps {
  slug: string
}

function SectionBlock({ section, accentColor }: { section: AboutSection; accentColor: string }) {
  if (section.style === 'list') {
    const items = section.content.split('\n').filter(line => line.trim())
    return (
      <div className="space-y-1.5">
        {items.map((item, i) => {
          const parts = item.split(' — ')
          return (
            <div key={i} className="flex gap-2 text-sm">
              <span className="text-muted-foreground/40 select-none">›</span>
              {parts.length > 1 ? (
                <span>
                  <span className="text-foreground">{parts[0]}</span>
                  <span className="text-muted-foreground"> — {parts.slice(1).join(' — ')}</span>
                </span>
              ) : (
                <span className="text-muted-foreground">{item}</span>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  // prose (default)
  const paragraphs = section.content.split('\n\n').filter(p => p.trim())
  return (
    <div className="space-y-3">
      {paragraphs.map((para, i) => (
        <p key={i} className="text-sm text-muted-foreground leading-relaxed">
          {para}
        </p>
      ))}
    </div>
  )
}

export function ProjectAbout({ slug }: ProjectAboutProps) {
  const about = getAboutPage(slug)
  const project = getProject(slug)

  if (!about) {
    return (
      <div className="px-4 py-12 text-center">
        <p className="text-sm text-muted-foreground/60">No about page yet.</p>
        <p className="text-xs text-muted-foreground/40 mt-1">
          Run /pl8 and talk about this project to start building it.
        </p>
      </div>
    )
  }

  const color = project?.color ?? '#3B82F6'

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-widest" style={{ color }}>
          {about.tagline}
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {about.description}
        </p>
      </div>

      {/* Divider */}
      <div className="h-px w-12" style={{ backgroundColor: color, opacity: 0.4 }} />

      {/* Sections */}
      {about.sections.map((section, i) => (
        <div key={i}>
          <h3 className="text-xs uppercase tracking-widest text-foreground/70 mb-3">
            {section.title}
          </h3>
          <SectionBlock section={section} accentColor={color} />
        </div>
      ))}

      {/* Footer */}
      <div className="pt-4 border-t border-border/30">
        <p className="text-xs text-muted-foreground/30">
          Last updated by Claude — Feb 2026
        </p>
      </div>
    </div>
  )
}
