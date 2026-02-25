import { getAllBrainFiles } from '@/data/brain'
import { PROJECTS } from '@/data/projects'
import { BrainDetailClient } from './brain-detail-client'

export function generateStaticParams() {
  const slugs = new Set<string>()
  for (const b of getAllBrainFiles()) {
    if (b.slug !== '_state') slugs.add(b.slug)
  }
  for (const p of PROJECTS) slugs.add(p.slug)
  return Array.from(slugs).map(slug => ({ slug }))
}

export default async function BrainDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <BrainDetailClient slug={slug} />
}
