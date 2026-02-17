import { PROJECTS } from '@/data/projects'
import { BrainClient } from './brain-client'

export function generateStaticParams() {
  return PROJECTS.map(p => ({ slug: p.slug }))
}

export default async function BrainPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <BrainClient slug={slug} />
}
