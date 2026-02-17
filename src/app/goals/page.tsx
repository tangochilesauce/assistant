'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { PROJECT_GOALS, type ProjectGoal, type GoalMetric, type SubChannelGoal } from '@/data/goals'
import { getProject } from '@/data/projects'

// ── Banner ───────────────────────────────────────────────────────

function BannerCard({ label, value, sub, color }: {
  label: string
  value: string
  sub?: string
  color: string
}) {
  return (
    <div className="border border-border rounded-lg p-4">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`text-xl font-semibold tabular-nums mt-1 ${color}`}>
        {value}
        {sub && <span className="text-xs text-muted-foreground ml-1">{sub}</span>}
      </div>
    </div>
  )
}

function TargetBanner() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <BannerCard label="Target" value="$50,000" sub="/mo" color="text-foreground" />
      <BannerCard label="Current" value="$6,900" sub="/mo" color="text-amber-400" />
      <BannerCard label="Gap" value="$43,100" sub="/mo" color="text-red-400" />
      <BannerCard label="Deadline" value="Q2 2026" sub="~4 months" color="text-muted-foreground" />
    </div>
  )
}

// ── Metric Row ───────────────────────────────────────────────────

function MetricRow({ metric, color }: { metric: GoalMetric; color: string }) {
  const parseNum = (s: string) => parseFloat(s.replace(/[^0-9.]/g, '')) || 0
  const currentNum = parseNum(metric.current)
  const targetNum = parseNum(metric.target)
  const pct = targetNum > 0 ? Math.min((currentNum / targetNum) * 100, 100) : 0

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-muted-foreground">{metric.label}</span>
        <span className="text-xs tabular-nums">
          {metric.current}
          <span className="text-muted-foreground/50"> / {metric.target}</span>
          {metric.unit && <span className="text-muted-foreground/50">{metric.unit}</span>}
        </span>
      </div>
      <div className="w-full h-1.5 bg-accent/20 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

// ── Sub-Channel Card ─────────────────────────────────────────────

function SubChannelCard({ channel, color }: { channel: SubChannelGoal; color: string }) {
  return (
    <div className="rounded-lg bg-accent/10 p-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium" style={{ color }}>{channel.name}</span>
        <span className="text-xs tabular-nums text-muted-foreground">{channel.target}</span>
      </div>
      <p className="text-[11px] text-muted-foreground/70 mb-1.5">{channel.strategy}</p>
      <div className="text-xs tabular-nums font-semibold" style={{ color }}>
        {channel.keyMetric}
      </div>
    </div>
  )
}

// ── Goal Column ──────────────────────────────────────────────────

function GoalColumn({ goal, horizon }: { goal: ProjectGoal; horizon: '90d' | '6mo' }) {
  const project = getProject(goal.slug)
  if (!project) return null

  const data = horizon === '90d' ? goal.ninetyDay : goal.sixMonth

  return (
    <div className="rounded-xl border border-border overflow-hidden flex flex-col bg-card">
      {/* Header */}
      <div
        className="p-4 border-b border-border"
        style={{ borderTopWidth: 3, borderTopColor: project.color }}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">{project.emoji}</span>
          <span className="text-sm font-semibold" style={{ color: project.color }}>
            {project.name}
          </span>
          {goal.revenueTarget && (
            <span
              className="ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full"
              style={{ backgroundColor: project.color + '20', color: project.color }}
            >
              {goal.revenueTarget}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground italic">{goal.vision}</p>
      </div>

      {/* Strategy */}
      <div className="p-4 border-b border-border">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground/50 mb-2">Strategy</div>
        <ul className="space-y-1">
          {goal.strategy.map((s, i) => (
            <li key={i} className="text-xs text-muted-foreground flex gap-2">
              <span className="text-muted-foreground/30 shrink-0">-</span>
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Metrics */}
      <div className="p-4 border-b border-border">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground/50 mb-3">
          {data.headline}
        </div>
        <div className="space-y-3">
          {data.metrics.map((m, i) => (
            <MetricRow key={i} metric={m} color={project.color} />
          ))}
        </div>
      </div>

      {/* Milestones */}
      <div className="p-4 flex-1">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground/50 mb-2">Milestones</div>
        <ul className="space-y-1.5">
          {data.milestones.map((m, i) => (
            <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
              <span className="text-muted-foreground/30 mt-0.5">&#9675;</span>
              <span>{m}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Sub-channels (Tango only) */}
      {goal.subChannels && (
        <div className="border-t border-border p-4">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground/50 mb-2">Channels</div>
          <div className="space-y-2">
            {goal.subChannels.map(sc => (
              <SubChannelCard key={sc.name} channel={sc} color={project.color} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────

export default function GoalsPage() {
  const [horizon, setHorizon] = useState<'90d' | '6mo'>('90d')

  return (
    <>
      <PageHeader title="Goals" />

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        <TargetBanner />

        {/* Horizon toggle */}
        <div className="flex items-center gap-1 mt-6 mb-6">
          <button
            onClick={() => setHorizon('90d')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              horizon === '90d'
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/30'
            }`}
          >
            90 Days
          </button>
          <button
            onClick={() => setHorizon('6mo')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              horizon === '6mo'
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/30'
            }`}
          >
            6 Months
          </button>
        </div>

        {/* Project columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {PROJECT_GOALS.map(goal => (
            <GoalColumn key={goal.slug} goal={goal} horizon={horizon} />
          ))}
        </div>
      </div>
    </>
  )
}
