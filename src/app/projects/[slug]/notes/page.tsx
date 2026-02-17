import { PROJECTS } from '@/data/projects'
import { NotesClient } from './notes-client'

export function generateStaticParams() {
  return PROJECTS.map(p => ({ slug: p.slug }))
}

export default async function NotesPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <NotesClient slug={slug} />
}
