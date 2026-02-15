export interface Project {
  slug: string
  name: string
  emoji: string
  color: string
  weight: number
  goal: string
  defaultActions: string[]
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
    slug: 'life-admin',
    name: 'Life Admin',
    emoji: '🏠',
    color: '#666666',
    weight: 0,
    goal: 'Pay all bills on time',
    defaultActions: ['Delay rent to Mar 11', 'Pay Off Record $300 (Mar 1)', 'Organize financials'],
  },
]

export function getProject(slug: string): Project | undefined {
  return PROJECTS.find(p => p.slug === slug)
}
