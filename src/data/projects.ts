// ── Kanban Column Definitions ─────────────────────────────────────

export interface KanbanColumn {
  id: string        // slug: 'todo', 'in-progress', 'done'
  label: string     // display: 'To Do', 'In Progress', 'Done'
  color?: string    // optional accent hex
}

export const DEFAULT_COLUMNS: KanbanColumn[] = [
  { id: 'todo', label: 'To Do' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'waiting', label: 'Waiting' },
  { id: 'done', label: 'Done' },
]

// The unified pipeline columns used on the Today board.
// All project-specific statuses map into these.
export const UNIFIED_COLUMNS: KanbanColumn[] = [
  { id: 'todo', label: 'To Do' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'waiting', label: 'Waiting' },
  { id: 'done', label: 'Done' },
]

// Maps any project-specific status to a unified column.
// Statuses not listed here pass through as-is.
const STATUS_MAP: Record<string, string> = {
  'backlog': 'todo',
  'this-week': 'todo',
  'blocked': 'waiting',
}

export function toUnifiedStatus(status: string): string {
  return STATUS_MAP[status] ?? status
}

// ── Project Definition ────────────────────────────────────────────

export interface Project {
  slug: string
  name: string
  emoji: string
  color: string
  weight: number
  goal: string
  defaultActions: string[]
  defaultColumns?: KanbanColumn[]  // undefined = use DEFAULT_COLUMNS
  parentSlug?: string              // sub-project parent (e.g. 'tango')
}

export const PROJECTS: Project[] = [
  {
    slug: 'tango',
    name: 'Tango',
    emoji: '🔥',
    color: '#DD4444',
    weight: 65,
    goal: 'Ship EXP pallet, fix Amazon PPC, close DTC sales',
    defaultActions: ['Pay Foodies $1,100 (Feb 23)', 'EXP pickup (Feb 19)', 'Pause SD-REMARKETING'],
    defaultColumns: [
      { id: 'backlog', label: 'Backlog' },
      { id: 'this-week', label: 'This Week' },
      { id: 'in-progress', label: 'In Progress' },
      { id: 'blocked', label: 'Blocked', color: '#EF4444' },
      { id: 'done', label: 'Done' },
    ],
  },
  {
    slug: 'tango-amazon',
    name: 'Amazon',
    emoji: '🔥',
    color: '#E25555',
    weight: 25,
    goal: 'Restart PPC, optimize Truffle listing, grow traffic',
    defaultActions: ['Restart PPC campaigns', 'Truffle title + bullet optimization', 'Analyze search term report'],
    parentSlug: 'tango',
  },
  {
    slug: 'tango-costco',
    name: 'Costco',
    emoji: '🔥',
    color: '#C83333',
    weight: 15,
    goal: 'Close roadshow deal with Moses',
    defaultActions: ['Follow up with Moses re: roadshows', 'Prepare roadshow pricing deck'],
    parentSlug: 'tango',
  },
  {
    slug: 'tango-dtc',
    name: 'DTC',
    emoji: '🔥',
    color: '#D04848',
    weight: 5,
    goal: 'Drive direct website sales',
    defaultActions: ['Set up Shopify promotions', 'Email list campaign'],
    parentSlug: 'tango',
  },
  {
    slug: 'ffeedd',
    name: 'FFEEDD',
    emoji: '📱',
    color: '#2A9D8F',
    weight: 15,
    goal: 'Launch app, get first 15 paid downloads',
    defaultActions: ['Submit to App Store', 'Reddit marketing blitz', 'TikTok screen recording'],
  },
  {
    slug: 'madder',
    name: 'Madder',
    emoji: '🎸',
    color: '#7B2CBF',
    weight: 5,
    goal: 'Drop single 2/22, build pre-save to 50+',
    defaultActions: ['Finish arrangement', 'DistroKid upload (Feb 16)', 'Studio @ Off Record (Feb 17)'],
  },
  {
    slug: 'dream-beds',
    name: 'Dream Beds',
    emoji: '🎬',
    color: '#E07A00',
    weight: 5,
    goal: 'Upload 28 videos, hit 100 subs',
    defaultActions: ['Batch 7 videos', 'Cut 5 Shorts', 'Cross-post TikTok + Reels'],
  },
  {
    slug: 'jeff',
    name: 'JEFF',
    emoji: '🤖',
    color: '#3B82F6',
    weight: 10,
    goal: 'Build JEFF into the operating system for everything',
    defaultActions: ['Be able to order/edit to-do list items', 'README for each project', 'Add Tango dashboard'],
  },
  {
    slug: 'life-admin',
    name: 'Life Admin',
    emoji: '🏠',
    color: '#666666',
    weight: 0,
    goal: 'Pay all bills on time',
    defaultActions: ['Delay rent to Mar 11', 'Pay Off Record $300 (Mar 1)', 'Organize financials'],
  },
]

// ── Helpers ──────────────────────────────────────────────────────

export function getProject(slug: string): Project | undefined {
  return PROJECTS.find(p => p.slug === slug)
}

/** Top-level projects only (no sub-projects) */
export function getRootProjects(): Project[] {
  return PROJECTS.filter(p => !p.parentSlug)
}

/** Sub-projects of a given parent */
export function getSubProjects(parentSlug: string): Project[] {
  return PROJECTS.filter(p => p.parentSlug === parentSlug)
}

export function getColumns(slug: string): KanbanColumn[] {
  const project = getProject(slug)
  return project?.defaultColumns ?? DEFAULT_COLUMNS
}

export function getLastColumnId(slug: string): string {
  const cols = getColumns(slug)
  return cols[cols.length - 1].id
}

export function getFirstColumnId(slug: string): string {
  const cols = getColumns(slug)
  return cols[0].id
}
