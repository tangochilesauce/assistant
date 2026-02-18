// ── Kanban Column Definitions ─────────────────────────────────────

export interface KanbanColumn {
  id: string        // slug: 'todo', 'in-progress', 'done'
  label: string     // display: 'To Do', 'In Progress', 'Done'
  color?: string    // optional accent hex
}

export const DEFAULT_COLUMNS: KanbanColumn[] = [
  { id: 'todo', label: 'To Do' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'done', label: 'Done' },
]

// The unified pipeline columns used on the Today board.
// All project-specific statuses map into these.
export const UNIFIED_COLUMNS: KanbanColumn[] = [
  { id: 'todo', label: 'To Do' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'done', label: 'Done' },
]

// Maps any project-specific status to a unified column.
// Statuses not listed here pass through as-is.
const STATUS_MAP: Record<string, string> = {
  'backlog': 'todo',
  'this-week': 'todo',
  'blocked': 'in-progress',
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
    slug: 'sprint',
    name: '14-Day Sprint',
    emoji: '⚡',
    color: '#84cc16',   // lime green
    weight: 100,
    goal: 'Ship pallet · Restart PPC · Drop single · Launch FFEEDD — $5K new revenue',
    defaultActions: [
      'Ship EXP pallet (Feb 19)',
      'Restart Amazon PPC campaigns',
      'Drop Madder single (Feb 22)',
      'Launch FFEEDD app',
    ],
  },
  {
    slug: 'tango',
    name: 'Tango',
    emoji: '🛒',
    color: '#f97316',
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
    emoji: '🛒',
    color: '#f97316',
    weight: 25,
    goal: 'Restart PPC, optimize Truffle listing, grow traffic',
    defaultActions: ['Restart PPC campaigns', 'Truffle title + bullet optimization', 'Analyze search term report'],
    parentSlug: 'tango',
  },
  {
    slug: 'tango-costco',
    name: 'Costco',
    emoji: '🛒',
    color: '#f97316',
    weight: 15,
    goal: 'Close roadshow deal with Moses',
    defaultActions: ['Follow up with Moses re: roadshows', 'Prepare roadshow pricing deck'],
    parentSlug: 'tango',
  },
  {
    slug: 'tango-unfi',
    name: 'UNFI',
    emoji: '🛒',
    color: '#f97316',
    weight: 25,
    goal: 'SKU expansion into Northeast, complete Endless Aisle',
    defaultActions: ['Complete Endless Aisle paperwork', 'Follow up with John Lawson re: Whole Foods', 'Monthly check-in with Brittney'],
    parentSlug: 'tango',
  },
  {
    slug: 'tango-dtc',
    name: 'DTC',
    emoji: '🛒',
    color: '#f97316',
    weight: 5,
    goal: 'Drive direct website sales',
    defaultActions: ['Set up Shopify promotions', 'Email list campaign'],
    parentSlug: 'tango',
  },
  {
    slug: 'tango-production',
    name: 'Production',
    emoji: '🛒',
    color: '#d97706',
    weight: 10,
    goal: 'Keep kitchen runs on schedule, manage POs and packaging',
    defaultActions: ['Schedule next kitchen run', 'Check packaging inventory'],
    parentSlug: 'tango',
  },
  {
    slug: 'ffeedd',
    name: 'FFEEDD',
    emoji: '🐝',
    color: '#22c55e',
    weight: 15,
    goal: 'Launch app, get first 15 paid downloads',
    defaultActions: ['Submit to App Store', 'Reddit marketing blitz', 'TikTok screen recording'],
  },
  {
    slug: 'madder',
    name: 'Madder',
    emoji: '🌙',
    color: '#0ea5e9',
    weight: 5,
    goal: 'Drop single 2/22, build pre-save to 50+',
    defaultActions: ['Finish arrangement', 'DistroKid upload (Feb 16)', 'Studio @ Off Record (Feb 17)'],
  },
  {
    slug: 'dream-beds',
    name: 'Dream Beds',
    emoji: '🐇',
    color: '#8b5cf6',
    weight: 5,
    goal: 'Upload 28 videos, hit 100 subs',
    defaultActions: ['Batch 7 videos', 'Cut 5 Shorts', 'Cross-post TikTok + Reels'],
  },
  {
    slug: 'jeff',
    name: 'PL8',
    emoji: '🍽️',
    color: '#6b7280',
    weight: 10,
    goal: 'Build PL8 into the operating system for everything',
    defaultActions: ['Be able to order/edit to-do list items', 'README for each project', 'Add Tango dashboard'],
  },
  {
    slug: 'life-admin',
    name: 'Life',
    emoji: '🏠',
    color: '#ffffff',
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
