import { PROJECTS } from '@/data/projects'
import { ProjectDetailClient } from './project-detail-client'

export function generateStaticParams() {
  return PROJECTS.map(p => ({ slug: p.slug }))
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <ProjectDetailClient slug={slug} />
}
