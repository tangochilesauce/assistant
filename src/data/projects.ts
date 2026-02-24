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

export interface ProjectTool {
  href: string
  label: string
  icon: string        // Lucide icon name: 'Package', 'Tv', etc.
  color?: string      // override color (defaults to muted warm #c2956a)
}

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
  tools?: ProjectTool[]            // project-specific views/tools shown in sidebar
}

export const PROJECTS: Project[] = [
  {
    slug: 'sprint',
    name: '14-Day Sprint',
    emoji: '⚡',
    color: '#84cc16',   // lime green
    weight: 100,
    goal: 'Nail March rent · Berlin half · Site redesign · Launch FFEEDD · Drop single',
    defaultActions: [
      'Site redesign (3 days)',
      'Launch FFEEDD',
      'Drop Madder single (Feb 22)',
      'First DTC email campaign',
    ],
  },
  {
    slug: 'tango',
    name: 'Tango',
    emoji: '🛒',
    color: '#f97316',
    weight: 65,
    goal: 'Site redesign, first DTC campaign, PPC optimization, Costco roadshow call',
    defaultActions: ['Site redesign (tonight)', 'PPC bid check on 3 winners', 'Call Moses ~2/25'],
    defaultColumns: [
      { id: 'backlog', label: 'Backlog' },
      { id: 'this-week', label: 'This Week' },
      { id: 'in-progress', label: 'In Progress' },
      { id: 'blocked', label: 'Blocked', color: '#EF4444' },
      { id: 'done', label: 'Done' },
    ],
    tools: [
      { href: '/orders', label: 'Orders', icon: 'Package' },
      { href: '/recipes', label: 'Recipes', icon: 'CookingPot' },
    ],
  },
  {
    slug: 'tango-amazon',
    name: 'Amazon',
    emoji: '🛒',
    color: '#f97316',
    weight: 25,
    goal: 'Optimize PPC bids, pause losers, grow ROAS',
    defaultActions: ['Pause SR-PHRASE-TEST + TT-AUTO-LOOSE', 'Check bids on 3 winners', 'Review coupon profitability'],
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
    goal: 'Redesign site + templates, first email campaign to 11K subs',
    defaultActions: ['Site redesign (3 days)', 'Redesign email templates', 'Deliverability test', 'Tier 1 campaign (115 VIPs)'],
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
    emoji: '🐇',
    color: '#22c55e',
    weight: 15,
    goal: 'Final build → App Store → launch',
    defaultActions: ['Final build (tomorrow)', 'Submit to App Store', 'Live + announce (~Feb 22)'],
  },
  {
    slug: 'madder',
    name: 'Madder',
    emoji: '📀',
    color: '#0ea5e9',
    weight: 5,
    goal: 'Drop single 2/22, EP 3/3',
    defaultActions: ['Finish single by 2/22', 'YouTube + socials release', 'Upload to DistroKid', 'EP drops 3/3'],
  },
  {
    slug: 'dream-beds',
    name: 'Dream Beds',
    emoji: '🌙',
    color: '#8b5cf6',
    weight: 5,
    goal: 'Upload 28 videos, hit 100 subs',
    defaultActions: ['Batch 7 videos', 'Cut 5 Shorts', 'Cross-post TikTok + Reels'],
    tools: [
      { href: '/dreamwatch', label: 'Dreamwatch', icon: 'Tv', color: '#8b5cf6' },
    ],
  },
  {
    slug: 'jeff',
    name: 'PL8',
    emoji: '🍽️',
    color: '#94a3b8',
    weight: 10,
    goal: 'Build PL8 into the operating system for everything',
    defaultActions: ['Be able to order/edit to-do list items', 'README for each project', 'Add Tango dashboard'],
  },
  {
    slug: 'life-admin',
    name: 'Life',
    emoji: '🧪',
    color: '#ffffff',
    weight: 0,
    goal: 'Nail March rent + Berlin half. Cancel dead subs.',
    defaultActions: ['Cancel Topaz, Illustrator, Fox One (-$82/mo)', 'Call Capital One re: hardship', 'Build expenses tracker'],
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
