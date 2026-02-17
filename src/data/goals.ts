// ── Goal Data Model ──────────────────────────────────────────────

export interface GoalMetric {
  label: string        // e.g. "Revenue", "Subscribers"
  current: string      // e.g. "$3,500", "0"
  target: string       // e.g. "$10,000", "100"
  unit?: string        // optional suffix: "/mo", "subs"
}

export interface SubChannelGoal {
  name: string         // e.g. "Amazon", "UNFI", "Costco"
  target: string       // e.g. "$10,000/mo"
  strategy: string     // 1-2 sentence strategy
  keyMetric: string    // the one number that matters
}

export interface ProjectGoal {
  slug: string
  vision: string
  revenueTarget?: string
  strategy: string[]
  ninetyDay: {
    headline: string
    metrics: GoalMetric[]
    milestones: string[]
  }
  sixMonth: {
    headline: string
    metrics: GoalMetric[]
    milestones: string[]
  }
  subChannels?: SubChannelGoal[]
}

// ── Data ─────────────────────────────────────────────────────────

export const PROJECT_GOALS: ProjectGoal[] = [
  {
    slug: 'tango',
    vision: 'Build a multi-channel hot sauce empire hitting $30K/mo',
    revenueTarget: '$30,000/mo',
    strategy: [
      'Scale Amazon PPC from $33/mo to aggressive daily spend',
      'Expand Northeast UNFI with Mango SKU to reverse -9% YoY',
      'Close Costco roadshow deal via Moses Romero',
      'Launch DTC channel with Shopify + email campaigns',
      'Maintain production at Foodies, optimize COGS per flavor',
    ],
    subChannels: [
      {
        name: 'Amazon',
        target: '$10,000/mo',
        strategy: 'Restart PPC campaigns, optimize Truffle listing (63% of revenue), scale traffic',
        keyMetric: '$3,500 → $10,000',
      },
      {
        name: 'UNFI',
        target: '$10,000/mo',
        strategy: 'Get Mango into Northeast HVA stores, monthly UpNext check-ins with Brittney',
        keyMetric: '$3,400 → $10,000',
      },
      {
        name: 'Costco',
        target: '$5,000/mo',
        strategy: 'Roadshow deal with Moses Romero, prepare pricing deck',
        keyMetric: '$0 → $5,000',
      },
    ],
    ninetyDay: {
      headline: 'Q1 2026',
      metrics: [
        { label: 'Amazon Revenue', current: '$3,500', target: '$5,000', unit: '/mo' },
        { label: 'UNFI Revenue', current: '$3,400', target: '$5,000', unit: '/mo' },
        { label: 'Costco Revenue', current: '$0', target: '$1,000', unit: '/mo' },
        { label: 'Amazon PPC Spend', current: '$33', target: '$500', unit: '/mo' },
      ],
      milestones: [
        'Ship EXP pallet',
        'Restart Amazon PPC at $15-20/day',
        'Call with Moses re: roadshows',
        'Get Mango approved for Northeast UNFI',
        'Complete Endless Aisle paperwork',
      ],
    },
    sixMonth: {
      headline: 'By August 2026',
      metrics: [
        { label: 'Total Tango Revenue', current: '$6,900', target: '$20,000', unit: '/mo' },
        { label: 'Amazon Revenue', current: '$3,500', target: '$10,000', unit: '/mo' },
        { label: 'Active Costco Roadshows', current: '0', target: '3' },
        { label: 'DTC Revenue', current: '$0', target: '$500', unit: '/mo' },
      ],
      milestones: [
        'Amazon PPC generating positive ROAS',
        'Mango live in all UNFI regions',
        'First Costco roadshow completed',
        'DTC generating $500+/mo',
        'COGS optimized below $3.00 avg',
      ],
    },
  },
  {
    slug: 'ffeedd',
    vision: 'The simplest food tracker that people actually use',
    revenueTarget: '$5,000/mo',
    strategy: [
      'Launch on App Store with $1 upfront + 60-day grace',
      'Reddit and TikTok organic marketing blitz',
      'Convert free users to $1/mo subscription after grace period',
      'Build word-of-mouth through simplicity and design',
    ],
    ninetyDay: {
      headline: 'Q1 2026',
      metrics: [
        { label: 'Paid Downloads', current: '0', target: '50' },
        { label: 'Monthly Revenue', current: '$0', target: '$50', unit: '/mo' },
        { label: 'App Store Rating', current: 'N/A', target: '4.5+' },
      ],
      milestones: [
        'App Store approval and launch',
        'First 15 paid downloads',
        '3 Reddit posts in nutrition/fitness subs',
        'First TikTok screen recording demo',
      ],
    },
    sixMonth: {
      headline: 'By August 2026',
      metrics: [
        { label: 'Active Subscribers', current: '0', target: '500' },
        { label: 'Monthly Revenue', current: '$0', target: '$500', unit: '/mo' },
        { label: 'Retention (30-day)', current: 'N/A', target: '60%' },
      ],
      milestones: [
        '500+ active subscribers',
        'Subscription conversion rate above 30%',
        'Featured in at least 1 health/fitness publication',
        'v2 features shipped based on user feedback',
      ],
    },
  },
  {
    slug: 'madder',
    vision: 'Release music and build a live following',
    revenueTarget: '$5,000/mo',
    strategy: [
      'Drop single 2/22, build pre-saves to 50+',
      'Distribute via DistroKid to all streaming platforms',
      'Book live shows starting with local LA venues',
      'Build social presence with behind-the-scenes content',
    ],
    ninetyDay: {
      headline: 'Q1 2026',
      metrics: [
        { label: 'Pre-saves', current: '0', target: '50' },
        { label: 'Monthly Streams', current: '0', target: '1,000' },
        { label: 'Live Shows Booked', current: '0', target: '2' },
      ],
      milestones: [
        'Single released 2/22',
        'DistroKid distribution live',
        'Studio session at Off Record',
        '50+ pre-saves before drop',
      ],
    },
    sixMonth: {
      headline: 'By August 2026',
      metrics: [
        { label: 'Monthly Streams', current: '0', target: '10,000' },
        { label: 'Monthly Revenue', current: '$0', target: '$200', unit: '/mo' },
        { label: 'Songs Released', current: '0', target: '4' },
      ],
      milestones: [
        '4+ singles released',
        'EP or album in progress',
        '5+ live shows performed',
        'Opening for established act',
      ],
    },
  },
  {
    slug: 'dream-beds',
    vision: 'Passive YouTube income from relaxing bed videos',
    revenueTarget: '$5,000/mo',
    strategy: [
      'Batch produce 7 videos at a time using automation pipeline',
      'Cross-post Shorts to TikTok and Reels',
      'Optimize titles and thumbnails for YouTube algorithm',
      'Build library of 200+ long-form videos',
    ],
    ninetyDay: {
      headline: 'Q1 2026',
      metrics: [
        { label: 'Videos Published', current: '0', target: '28' },
        { label: 'Subscribers', current: '0', target: '100' },
        { label: 'Shorts Published', current: '0', target: '15' },
      ],
      milestones: [
        'Upload 28 long-form videos',
        'Hit 100 subscribers',
        'Cut and publish 15 Shorts',
        'Cross-post to TikTok and Reels',
      ],
    },
    sixMonth: {
      headline: 'By August 2026',
      metrics: [
        { label: 'Videos Published', current: '0', target: '100' },
        { label: 'Subscribers', current: '0', target: '1,000' },
        { label: 'Monthly Revenue', current: '$0', target: '$100', unit: '/mo' },
      ],
      milestones: [
        '100+ videos in library',
        'Monetization threshold reached (1K subs, 4K hours)',
        'Consistent 2-3 uploads per week',
        'First AdSense payout',
      ],
    },
  },
]

// ── Helpers ──────────────────────────────────────────────────────

export function getProjectGoal(slug: string): ProjectGoal | undefined {
  return PROJECT_GOALS.find(g => g.slug === slug)
}
