'use client'

import { DEBT, DEBT_STATUS_COLORS, DEBT_STATUS_LABELS, THE_NUMBER, fmt } from '@/data/finance'

export function DebtTracker() {
  const totalDebt = DEBT.reduce((s, d) => s + d.balance, 0)
  const totalMinimums = DEBT.reduce((s, d) => s + d.minPayment, 0)
  const totalInterest = DEBT.reduce((s, d) => s + d.monthlyInterest, 0)
  const sorted = [...DEBT].sort((a, b) => a.priority - b.priority)

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="border border-border rounded-lg p-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Total Debt</div>
          <div className="text-xl font-semibold tabular-nums text-red-400 mt-1">
            ${fmt(totalDebt)}
          </div>
          <div className="text-[10px] text-muted-foreground/60 mt-1">7 cards, 25-29% APR</div>
        </div>
        <div className="border border-border rounded-lg p-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Min Payments</div>
          <div className="text-xl font-semibold tabular-nums text-red-400 mt-1">
            ${fmt(totalMinimums)}/mo
          </div>
          <div className="text-[10px] text-muted-foreground/60 mt-1">
            ${fmt(totalInterest)}/mo is just interest
          </div>
        </div>
        <div className="border border-border rounded-lg p-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Interest Burn</div>
          <div className="text-xl font-semibold tabular-nums text-orange-400 mt-1">
            ${fmt(totalInterest)}/mo
          </div>
          <div className="text-[10px] text-muted-foreground/60 mt-1">
            ${fmt(totalInterest * 12)}/year in pure waste
          </div>
        </div>
      </div>

      {/* Payoff order */}
      <div>
        <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground border-b border-border pb-2 mb-3">
          Payoff Order (Hybrid: Quick Wins + Avalanche)
        </div>

        <div className="space-y-2">
          {sorted.map((card, i) => {
            const pctOfTotal = (card.balance / totalDebt) * 100

            return (
              <div key={card.name} className="border border-border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono bg-accent w-5 h-5 rounded flex items-center justify-center text-muted-foreground">
                      {card.priority}
                    </span>
                    <span className="text-sm font-medium">{card.name}</span>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${DEBT_STATUS_COLORS[card.status]} ${
                      card.status === 'past-due' ? 'bg-red-400/10' :
                      card.status === 'over-limit' ? 'bg-amber-400/10' :
                      card.status === 'near-maxed' ? 'bg-orange-400/10' :
                      'bg-accent'
                    }`}>
                      {DEBT_STATUS_LABELS[card.status]}
                    </span>
                  </div>
                  <span className="text-sm font-semibold tabular-nums text-red-400">
                    ${fmt(card.balance)}
                  </span>
                </div>

                {/* Balance bar */}
                <div className="w-full h-2 bg-accent rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pctOfTotal}%`,
                      backgroundColor: card.status === 'past-due' ? '#f87171' :
                        card.status === 'over-limit' ? '#fbbf24' :
                        card.status === 'near-maxed' ? '#fb923c' : '#6b7280',
                    }}
                  />
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{card.apr}% APR</span>
                  <span>${fmt(card.minPayment)}/mo min</span>
                  <span className="text-orange-400">${fmt(card.monthlyInterest)}/mo interest</span>
                  <span className="ml-auto">{pctOfTotal.toFixed(0)}% of total</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* The Number */}
      <div>
        <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground border-b border-border pb-2 mb-3">
          The Number — What You Need Per Month
        </div>

        <div className="space-y-1.5">
          {[
            { label: 'Bare Survival', amount: THE_NUMBER.bareSurvival, desc: 'Min payments, cut subs, rice and beans', color: 'text-red-400' },
            { label: 'Stable', amount: THE_NUMBER.stable, desc: 'Min payments, modest living', color: 'text-orange-400' },
            { label: 'Paying Down', amount: THE_NUMBER.payingDown, desc: 'Survival + $1K extra to debt', color: 'text-amber-400' },
            { label: 'Target', amount: THE_NUMBER.target, desc: 'Comfortable + aggressive paydown', color: 'text-emerald-400' },
            { label: 'Freedom', amount: THE_NUMBER.freedom, desc: '$50K/year debt payoff + living well', color: 'text-cyan-400' },
          ].map(tier => (
            <div key={tier.label} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-accent/30">
              <div>
                <span className={`text-sm font-medium ${tier.color}`}>{tier.label}</span>
                <span className="text-xs text-muted-foreground/60 ml-2">{tier.desc}</span>
              </div>
              <span className={`text-sm font-semibold tabular-nums ${tier.color}`}>
                ${fmt(tier.amount)}/mo
              </span>
            </div>
          ))}
        </div>

        <div className="mt-3 px-3 py-2 bg-accent/30 rounded-lg border border-border/50">
          <div className="text-xs text-muted-foreground">
            Current revenue: <span className="text-foreground font-medium">${fmt(6927)}/mo</span>
            {' '}— between Bare Survival and Stable. Need to roughly double to start paying down debt.
          </div>
        </div>
      </div>
    </div>
  )
}
