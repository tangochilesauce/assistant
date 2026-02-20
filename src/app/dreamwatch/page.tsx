'use client'

import { useEffect } from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { StreakHeader } from '@/components/dreamwatch/streak-header'
import { useDreamwatchStore, type DreamwatchItem } from '@/store/dreamwatch-store'

// ── Constants ────────────────────────────────────────────────────

const STEPS = [
  { num: 0, label: 'Generate metadata' },
  { num: 1, label: 'Reverse clip' },
  { num: 2, label: 'Seamless loop' },
  { num: 3, label: '3-hour 4K encode' },
  { num: 4, label: 'Add audio' },
  { num: 5, label: 'Compress thumbnail' },
  { num: 6, label: 'Upload to YouTube' },
  { num: 7, label: 'Cleanup' },
]

// ── Helpers ──────────────────────────────────────────────────────

function commaKB(bytes: number) {
  return Math.floor(bytes / 1024).toLocaleString()
}

function formatBytes(bytes: number): string {
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)} GB`
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`
  return `${commaKB(bytes)} KB`
}

function staleness(syncedAt: string | null): 'live' | 'stale' | 'dead' {
  if (!syncedAt) return 'dead'
  const age = (Date.now() - new Date(syncedAt).getTime()) / 1000
  if (age < 30) return 'live'
  if (age < 300) return 'stale'
  return 'dead'
}

// ── Step Icon ────────────────────────────────────────────────────

function StepIcon({ stepNum, currentStep, isPublished, isFailed }: {
  stepNum: number
  currentStep: number
  isPublished: boolean
  isFailed: boolean
}) {
  let status: 'done' | 'active' | 'waiting' | 'failed'
  if (stepNum < currentStep || isPublished) status = 'done'
  else if (stepNum === currentStep && isFailed) status = 'failed'
  else if (stepNum === currentStep) status = 'active'
  else status = 'waiting'

  const base = 'w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0'
  const styles = {
    done: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    active: 'bg-violet-500/20 text-violet-300 border border-violet-500/50 animate-pulse',
    waiting: 'bg-zinc-800 text-zinc-600 border border-zinc-700',
    failed: 'bg-red-500/20 text-red-400 border border-red-500/30',
  }

  return (
    <div className={`${base} ${styles[status]}`}>
      {status === 'done' ? '✓' : status === 'failed' ? '✕' : stepNum + 1}
    </div>
  )
}

// ── Progress Bar ─────────────────────────────────────────────────

function ProgressBar({ pct, done }: { pct: number; done: boolean }) {
  return (
    <div className="w-full h-3 bg-zinc-900 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${
          done
            ? 'bg-gradient-to-r from-green-800 to-emerald-400'
            : 'bg-gradient-to-r from-violet-700 via-violet-500 to-violet-400'
        }`}
        style={{ width: `${pct}%` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2s_ease-in-out_infinite]" />
      </div>
    </div>
  )
}

// ── Publish Target Pill ──────────────────────────────────────────

function PublishPill({ target, display }: { target: string | null; display: string | null }) {
  if (!display) return null
  const isPublic = target === 'PUBLIC'
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
      isPublic
        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
        : 'bg-violet-500/15 text-violet-300 border border-violet-500/20'
    }`}>
      {display}
    </span>
  )
}

// ── Status Pill (queue rows) ─────────────────────────────────────

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    ACTIVE: 'bg-violet-500/15 text-violet-300 border-violet-500/20',
    QUEUED: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/20',
    PUBLISHED: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    FAILED: 'bg-red-500/15 text-red-400 border-red-500/20',
    UNPAIRED_VIDEO: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    UNPAIRED_THUMB: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  }
  const labels: Record<string, string> = {
    ACTIVE: 'Active',
    QUEUED: 'Queued',
    PUBLISHED: 'Published',
    FAILED: 'Failed',
    UNPAIRED_VIDEO: 'No Thumb',
    UNPAIRED_THUMB: 'No Video',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${styles[status] ?? styles.QUEUED}`}>
      {labels[status] ?? status}
    </span>
  )
}

// ── Active Card ──────────────────────────────────────────────────

function ActiveCard({ item }: { item: DreamwatchItem }) {
  const isPublished = item.state === 'PUBLISHED'
  const isFailed = item.state.includes('DEAD')
  const isUploading = item.state === 'STEP6'
  const isEncoding = item.step === 3 && !isPublished && !isFailed

  // Current step progress
  let stepPct = 0
  let stepLabel = ''
  if (isPublished) {
    stepPct = 100; stepLabel = 'Published'
  } else if (isEncoding) {
    stepPct = item.encodePct; stepLabel = `${item.encodePct}%`
  } else if (isUploading) {
    stepPct = item.uploadPct; stepLabel = `${item.uploadPct}%`
  } else if (item.step >= 0) {
    stepPct = 50; stepLabel = 'working...'
  }

  const stepName = isPublished
    ? 'Complete'
    : STEPS.find(s => s.num === item.step)?.label ?? ''

  // Done count for compact summary
  const doneCount = STEPS.filter(s => s.num < item.step || isPublished).length

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        {/* Left column: thumbnail + info */}
        <div className="p-4 space-y-3">
          {/* Thumbnail */}
          <div className="aspect-video rounded-lg overflow-hidden bg-zinc-800">
            {item.thumbBase64 ? (
              <img src={item.thumbBase64} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl">🛏️</div>
            )}
          </div>

          {/* Title */}
          <h2 className="text-sm font-semibold text-zinc-100 leading-snug">
            {item.title ?? item.basename}
          </h2>

          {/* Publish target */}
          <PublishPill target={item.publishTarget} display={item.publishTargetDisplay} />

          {/* Source info */}
          <div className="text-xs text-zinc-500 space-y-0.5">
            {item.videoFile && (
              <div>🎬 {item.videoFile} · {item.videoSizeMb.toFixed(0)} MB{item.videoDate ? ` · ${item.videoDate}` : ''}</div>
            )}
            {item.thumbFile && (
              <div>🖼️ {item.thumbFile} · {item.thumbSizeMb.toFixed(1)} MB{item.thumbDate ? ` · ${item.thumbDate}` : ''}</div>
            )}
          </div>

          {/* Description + tags (collapsible on mobile) */}
          {item.description && (
            <div className="hidden md:block">
              <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1">Description</div>
              <div className="text-xs text-zinc-400 whitespace-pre-line line-clamp-4">
                {item.description}
              </div>
              {Array.isArray(item.tags) && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {item.tags.slice(0, 12).map(tag => (
                    <span key={String(tag)} className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500">
                      {String(tag)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right column: Dan's order — progress → stats → message → steps → summary → overall */}
        <div className="p-4 space-y-4 border-t md:border-t-0 md:border-l border-zinc-800">
          {/* 1. Progress bar */}
          {(item.step >= 0 || isPublished) && (
            <div>
              <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1.5">
                {stepName}
              </div>
              <ProgressBar pct={stepPct} done={isPublished} />
              {/* Percentage + KB side by side */}
              <div className="flex items-baseline justify-center gap-4 mt-2">
                <span className={`text-2xl font-bold tabular-nums ${isPublished ? 'text-emerald-400' : 'text-violet-400'}`}>
                  {stepLabel}
                </span>
                {item.liveBytes > 0 && (
                  <span className="text-sm font-mono tabular-nums text-violet-400/60">
                    {formatBytes(item.liveBytes)}
                    {item.totalBytes > 0 && (
                      <span className="text-violet-400/30"> / {formatBytes(item.totalBytes)}</span>
                    )}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* 2. Stats */}
          {isEncoding && (
            <div className="grid grid-cols-4 gap-2">
              {item.encodedTime && (
                <div>
                  <div className="text-[10px] text-zinc-600">Encoded</div>
                  <div className="text-xs font-semibold text-zinc-300 tabular-nums">{item.encodedTime}</div>
                </div>
              )}
              {item.speed && (
                <div>
                  <div className="text-[10px] text-zinc-600">Speed</div>
                  <div className="text-xs font-semibold text-zinc-300 tabular-nums">{item.speed}</div>
                </div>
              )}
              {item.eta && (
                <div>
                  <div className="text-[10px] text-zinc-600">ETA</div>
                  <div className="text-xs font-semibold text-zinc-300 tabular-nums">{item.eta}</div>
                </div>
              )}
              <div>
                <div className="text-[10px] text-zinc-600">Target</div>
                <div className="text-xs font-semibold text-zinc-300 tabular-nums">3h 00m</div>
              </div>
            </div>
          )}
          {isUploading && item.fileSize && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-[10px] text-zinc-600">File Size</div>
                <div className="text-xs font-semibold text-zinc-300">{item.fileSize}</div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-600">Upload</div>
                <div className="text-xs font-semibold text-zinc-300 tabular-nums">{item.uploadPct}%</div>
              </div>
            </div>
          )}

          {/* 3. Status message */}
          {isPublished && item.youtubeUrl && (
            <div className="text-center space-y-2">
              <div className="text-xs font-medium text-emerald-400">Published on YouTube</div>
              <a
                href={item.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-300 transition-colors"
              >
                ▶ Watch on YouTube
              </a>
            </div>
          )}
          {isPublished && !item.youtubeUrl && (
            <div className="text-center text-xs font-medium text-emerald-400">Published on YouTube</div>
          )}
          {isFailed && (
            <div className="text-center text-xs font-medium text-red-400">
              {item.stepLabel ?? 'Failed — re-run /dreamtime'}
            </div>
          )}

          {/* 4. Pipeline steps */}
          <div className="hidden md:flex flex-col gap-1.5">
            {STEPS.map(s => (
              <div key={s.num} className="flex items-center gap-2">
                <StepIcon
                  stepNum={s.num}
                  currentStep={item.step}
                  isPublished={isPublished}
                  isFailed={isFailed}
                />
                <span className={`text-xs ${
                  s.num < item.step || isPublished
                    ? 'text-zinc-500'
                    : s.num === item.step
                      ? isFailed ? 'text-red-400' : 'text-zinc-200'
                      : 'text-zinc-700'
                }`}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          {/* 5. Steps summary (mobile) */}
          <div className="md:hidden text-xs text-zinc-500">
            ✓ {doneCount}/{STEPS.length}
            {!isPublished && item.stepLabel && ` · ${STEPS.find(s => s.num === item.step)?.label}`}
          </div>

          {/* 6. Overall pipeline */}
          {!isPublished && item.step >= 1 && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-zinc-600">Overall Pipeline</span>
                <span className="text-xs font-semibold text-zinc-400 tabular-nums">{item.progress}%</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-700 to-violet-400 transition-all duration-1000"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Queue Row ────────────────────────────────────────────────────

function QueueRow({ item }: { item: DreamwatchItem }) {
  const title = item.title ?? item.basename
  const truncTitle = title.length > 55 ? title.substring(0, 52) + '...' : title

  const meta = [
    item.videoSizeMb ? `${item.videoSizeMb.toFixed(0)}MB` : null,
    item.videoDate ?? item.thumbDate,
  ].filter(Boolean).join(' · ')

  const inner = (
    <>
      {/* Thumb */}
      <div className="w-20 h-11 rounded bg-zinc-800 overflow-hidden shrink-0">
        {item.thumbBase64 ? (
          <img src={item.thumbBase64} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sm">🎬</div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-zinc-300 truncate">{truncTitle}</div>
        <div className="text-[10px] text-zinc-600">{meta}</div>
        {item.publishTargetDisplay && item.cardStatus !== 'PUBLISHED' && (
          <div className="mt-0.5">
            <PublishPill target={item.publishTarget} display={item.publishTargetDisplay} />
          </div>
        )}
      </div>

      {/* Status */}
      <StatusPill status={item.cardStatus} />
    </>
  )

  if (item.cardStatus === 'PUBLISHED' && item.youtubeUrl) {
    return (
      <a
        href={item.youtubeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 px-4 py-2.5 border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors"
      >
        {inner}
      </a>
    )
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 border-b border-zinc-800/50">
      {inner}
    </div>
  )
}

// ── Sync Indicator ───────────────────────────────────────────────

function SyncIndicator({ syncedAt }: { syncedAt: string | null }) {
  const s = staleness(syncedAt)
  if (s === 'live') {
    return <span className="text-[10px] text-emerald-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live</span>
  }
  if (s === 'stale') {
    return <span className="text-[10px] text-amber-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Stale</span>
  }
  return <span className="text-[10px] text-zinc-600 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-zinc-600" /> Offline</span>
}

// ── Page ─────────────────────────────────────────────────────────

export default function DreamwatchPage() {
  const { items, initialized, startPolling, stopPolling } = useDreamwatchStore()

  useEffect(() => {
    startPolling()
    return () => stopPolling()
  }, [startPolling, stopPolling])

  const activeItem = items.find(i => i.isActive)
  const queueItems = items.filter(i => !i.isActive)
  const latestSync = items.length > 0 ? items[0].syncedAt : null

  return (
    <>
      <PageHeader title="Dreamwatch" count={items.length}>
        <SyncIndicator syncedAt={latestSync} />
      </PageHeader>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Motivation: streak counter + calendar */}
        <StreakHeader />

        {!initialized ? (
          <div className="text-sm text-muted-foreground text-center py-8">Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">😴</div>
            <div className="text-sm text-zinc-500">Queue empty</div>
            <div className="text-xs text-zinc-700 mt-1">Drop a video + thumbnail into <strong>/_ queue/</strong> then run <strong>/dreamtime</strong></div>
          </div>
        ) : (
          <>
            {/* Active encode/upload */}
            {activeItem && <ActiveCard item={activeItem} />}

            {/* Queue */}
            {queueItems.length > 0 && (
              <div>
                <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2 px-1">
                  Queue
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
                  {queueItems.map(item => (
                    <QueueRow key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
