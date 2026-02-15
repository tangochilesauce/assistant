import { getProject } from '@/data/projects'

interface ProjectBadgeProps {
  slug: string
  className?: string
}

export function ProjectBadge({ slug, className = '' }: ProjectBadgeProps) {
  const project = getProject(slug)
  if (!project) return null

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded ${className}`}
      style={{ backgroundColor: project.color + '20', color: project.color }}
    >
      <span>{project.emoji}</span>
      <span>{project.name}</span>
    </span>
  )
}
