'use client'

// ═══════════════════════════════════════════════════════════
//  EDIT YOUR NUMBERS HERE
//  Last updated: 2026-02-15
// ═══════════════════════════════════════════════════════════

const BALANCE = 45 // Current bank balance — update daily

// --- PROJECTS ---
const PROJECTS = [
  {
    name: 'Tango', emoji: '🔥', color: '#DD4444', weight: 65,
    goal: 'Ship EXP pallet, fix Amazon PPC, close DTC sales',
    actions: ['Pay Foodies $1,100 (Feb 23)', 'EXP pickup (Feb 19)', 'Pause SD-REMARKETING'],
  },
  {
    name: 'FFEEDD', emoji: '📱', color: '#2A9D8F', weight: 15,
    goal: 'Launch app, get first 15 paid downloads',
    actions: ['Submit to App Store', 'Reddit marketing blitz', 'TikTok screen recording'],
  },
  {
    name: 'Madder', emoji: '🎸', color: '#7B2CBF', weight: 5,
    goal: 'Drop single 2/22, build pre-save to 50+',
    actions: ['Finish arrangement', 'DistroKid upload (Feb 16)', 'Studio @ Off Record (Feb 17)'],
  },
  {
    name: 'Dream Beds', emoji: '🎬', color: '#E07A00', weight: 5,
    goal: 'Upload 28 videos, hit 100 subs',
    actions: ['Batch 7 videos', 'Cut 5 Shorts', 'Cross-post TikTok + Reels'],
  },
  {
    name: 'Life Admin', emoji: '🏠', color: '#666666', weight: 0,
    goal: 'Pay all bills on time',
    actions: ['Delay rent to Mar 11', 'Pay Off Record $300 (Mar 1)', 'Organize financials'],
  },
]

// --- INCOME ---
// status: locked = reliable, expected = likely, sporadic = unpredictable, inactive = $0 right now
const INCOME: { name: string; monthly: number; status: 'locked' | 'expected' | 'sporadic' | 'inactive'; notes?: string }[] = [
  { name: 'Amazon Payouts', monthly: 1900, status: 'locked', notes: 'biweekly avg' },
  { name: 'UNFI (SoPac)', monthly: 3422, status: 'expected', notes: 'net 30' },
  { name: 'UNFI (NE)', monthly: 3422, status: 'expected', notes: 'net 30' },
  { name: 'EXP Corp', monthly: 3400, status: 'sporadic', notes: 'net 30' },
  { name: 'Faire / Mable', monthly: 0, status: 'inactive' },
  { name: 'DTC Sales', monthly: 0, status: 'inactive' },
  { name: 'FFEEDD Subs', monthly: 0, status: 'inactive' },
]

// --- EXPENSES ---
// unknown: true = you need to fill in the real number
const PERSONAL: { name: string; monthly: number; unknown?: boolean }[] = [
  { name: 'Rent', monthly: 2878 },
  { name: 'Phone', monthly: 0, unknown: true },
  { name: 'Health Insurance', monthly: 0, unknown: true },
  { name: 'Car / Gas', monthly: 0, unknown: true },
  { name: 'Groceries', monthly: 0, unknown: true },
  { name: 'Subscriptions', monthly: 0, unknown: true },
]

const BUSINESS: { name: string; monthly: number; unknown?: boolean; notes?: string }[] = [
  { name: 'Off Record Studio', monthly: 300 },
  { name: 'Amazon Seller Fees', monthly: 0, unknown: true },
  { name: 'Amazon PPC', monthly: 33, notes: '$66/60d' },
]

// Production costs per batch — roughly 1 run/month
const PRODUCTION: { name: string; perRun: number }[] = [
  { name: 'Deep (ingredients)', perRun: 1300 },
  { name: 'Foodies (co-pack)', perRun: 1100 },
  { name: 'Boxes (Acorn)', perRun: 804 },
  { name: 'Labels', perRun: 1500 },
  { name: 'Shipping (Daylight)', perRun: 400 },
]

// ═══════════════════════════════════════════════════════════
//  DASHBOARD
// ═══════════════════════════════════════════════════════════

const STATUS_COLORS: Record<string, string> = {
  locked: 'bg-emerald-400',
  expected: 'bg-amber-400',
  sporadic: 'bg-orange-400',
  inactive: 'bg-zinc-600',
}

const STATUS_LABELS: Record<string, string> = {
  locked: 'Reliable',
  expected: 'Expected',
  sporadic: 'Sporadic',
  inactive: 'Not Active',
}

function fmt(n: number) {
  return n.toLocaleString('en-US')
}

export function DashboardClient() {
  const activeIncome = INCOME.filter(i => i.status !== 'inactive')
  const totalIn = activeIncome.reduce((s, i) => s + i.monthly, 0)

  const totalPersonal = PERSONAL.reduce((s, e) => s + e.monthly, 0)
  const totalBiz = BUSINESS.reduce((s, e) => s + e.monthly, 0)
  const totalProd = PRODUCTION.reduce((s, e) => s + e.perRun, 0)
  const totalOut = totalPersonal + totalBiz + totalProd

  const net = totalIn - totalOut

  const unknowns = [
    ...PERSONAL.filter(e => e.unknown),
    ...BUSINESS.filter(e => e.unknown),
  ].length

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 text-sm">

      {/* ═══════ PROJECTS ═══════ */}
      <section className="mb-12">
        <div className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-4">
          Projects
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PROJECTS.map(p => (
            <div
              key={p.name}
              className="border border-zinc-800 p-4 rounded-lg hover:bg-zinc-900 transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <span>{p.emoji}</span>
                <span className="text-sm font-semibold" style={{ color: p.color }}>{p.name}</span>
                {p.weight > 0 && (
                  <span className="text-xs text-zinc-600 ml-auto tabular-nums">{p.weight}%</span>
                )}
              </div>
              <div className="text-sm text-zinc-400 mb-3 leading-relaxed">{p.goal}</div>
              <div className="space-y-1">
                {p.actions.map((a, i) => (
                  <div key={i} className="text-sm text-zinc-500 flex gap-2">
                    <span className="text-zinc-700 shrink-0">›</span>
                    <span>{a}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════ DIVIDER ═══════ */}
      <div className="border-t border-zinc-800 mb-12" />

      {/* ═══════ CASH FLOW ═══════ */}
      <section>
        <div className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-4">
          Cash Flow
        </div>

        {/* Summary metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          <Metric
            label="Now"
            value={`$${fmt(BALANCE)}`}
            color={BALANCE >= 0 ? 'text-zinc-200' : 'text-red-400'}
          />
          <Metric
            label="In /mo"
            value={`+$${fmt(totalIn)}`}
            color="text-emerald-400"
          />
          <Metric
            label="Out /mo"
            value={`-$${fmt(totalOut)}`}
            color="text-red-400"
          />
          <Metric
            label="Net /mo"
            value={`${net >= 0 ? '+' : '-'}$${fmt(Math.abs(net))}`}
            color={net >= 0 ? 'text-emerald-400' : 'text-red-400'}
            sub={unknowns > 0 ? `${unknowns} items unknown` : undefined}
          />
        </div>

        {/* Two columns: Income | Expenses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

          {/* INCOME */}
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-zinc-500 border-b border-zinc-800 pb-2 mb-4">
              Income
            </div>

            {(['locked', 'expected', 'sporadic', 'inactive'] as const).map(status => {
              const items = INCOME.filter(i => i.status === status)
              if (!items.length) return null
              return (
                <div key={status} className="mb-4">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${STATUS_COLORS[status]}`} />
                    <span className="text-xs uppercase tracking-wider text-zinc-600">
                      {STATUS_LABELS[status]}
                    </span>
                  </div>
                  {items.map(item => (
                    <div key={item.name} className="flex justify-between py-1">
                      <span className={`text-sm ${item.monthly === 0 ? 'text-zinc-600' : 'text-zinc-300'}`}>
                        {item.name}
                        {item.notes && <span className="text-zinc-600 ml-1">({item.notes})</span>}
                      </span>
                      <span className={`text-sm tabular-nums ${item.monthly === 0 ? 'text-zinc-700' : 'text-emerald-400'}`}>
                        {item.monthly > 0 ? `+$${fmt(item.monthly)}` : '—'}
                      </span>
                    </div>
                  ))}
                </div>
              )
            })}

            <div className="flex justify-between border-t border-zinc-800 pt-2 mt-2">
              <span className="text-sm text-zinc-400 font-semibold">TOTAL (active)</span>
              <span className="text-sm tabular-nums text-emerald-400 font-semibold">+${fmt(totalIn)}</span>
            </div>
          </div>

          {/* EXPENSES */}
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-zinc-500 border-b border-zinc-800 pb-2 mb-4">
              Expenses
            </div>

            <ExpenseGroup label="Personal" items={PERSONAL} />
            <ExpenseGroup label="Business (fixed)" items={BUSINESS} />

            {/* Production */}
            <div className="mb-4">
              <div className="text-xs uppercase tracking-wider text-zinc-600 mb-1.5">
                Production (per run)
              </div>
              {PRODUCTION.map(item => (
                <div key={item.name} className="flex justify-between py-1">
                  <span className="text-sm text-zinc-300">{item.name}</span>
                  <span className="text-sm tabular-nums text-red-400">-${fmt(item.perRun)}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between border-t border-zinc-800 pt-2 mt-2">
              <span className="text-sm text-zinc-400 font-semibold">TOTAL (known)</span>
              <span className="text-sm tabular-nums text-red-400 font-semibold">-${fmt(totalOut)}</span>
            </div>
            {unknowns > 0 && (
              <div className="text-xs text-amber-400 mt-2">
                + {unknowns} items marked ??? — update for accuracy
              </div>
            )}
          </div>
        </div>

        {/* Bottom line */}
        <div className="border-t border-zinc-800 mt-10 pt-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">Monthly net (known): </span>
            <span className={`font-semibold tabular-nums ${net >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {net >= 0 ? '+' : '-'}${fmt(Math.abs(net))}/mo
            </span>
          </div>
          {unknowns > 0 && (
            <div className="text-xs text-amber-400 bg-amber-400/10 px-3 py-1.5 rounded-md">
              {unknowns} expense items need real numbers
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
//  Helper components
// ═══════════════════════════════════════════════════════════

function Metric({ label, value, color, sub }: {
  label: string; value: string; color: string; sub?: string
}) {
  return (
    <div className="border border-zinc-800 p-4 rounded-lg">
      <div className="text-xs uppercase tracking-wider text-zinc-500">{label}</div>
      <div className={`text-xl font-semibold tabular-nums mt-1 ${color}`}>{value}</div>
      {sub && <div className="text-xs text-amber-400 mt-1">{sub}</div>}
    </div>
  )
}

function ExpenseGroup({ label, items }: {
  label: string; items: { name: string; monthly: number; unknown?: boolean; notes?: string }[]
}) {
  return (
    <div className="mb-4">
      <div className="text-xs uppercase tracking-wider text-zinc-600 mb-1.5">{label}</div>
      {items.map(item => (
        <div key={item.name} className="flex justify-between py-1">
          <span className={`text-sm ${item.unknown ? 'text-amber-400' : 'text-zinc-300'}`}>
            {item.name}
            {item.notes && <span className="text-zinc-600 ml-1">({item.notes})</span>}
          </span>
          <span className={`text-sm tabular-nums ${item.unknown ? 'text-amber-400' : 'text-red-400'}`}>
            {item.monthly > 0 ? `-$${fmt(item.monthly)}` : item.unknown ? '$???' : '—'}
          </span>
        </div>
      ))}
    </div>
  )
}
