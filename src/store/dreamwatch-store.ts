import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

// ── Types ────────────────────────────────────────────────────────

export interface DreamwatchItem {
  id: string
  basename: string
  title: string | null
  videoFile: string | null
  thumbFile: string | null
  videoSizeMb: number
  thumbSizeMb: number
  videoDate: string | null
  thumbDate: string | null
  cardStatus: string       // ACTIVE, QUEUED, PUBLISHED, FAILED, UNPAIRED_VIDEO, UNPAIRED_THUMB
  isActive: boolean
  state: string            // STEP0_META, STEP1, ..., PUBLISHED
  step: number             // 0-7
  totalSteps: number       // 8
  progress: number         // 0-100
  stepLabel: string | null
  encodePct: number
  encodedTime: string | null
  speed: string | null
  eta: string | null
  totalTime: string
  fileSize: string | null
  uploadPct: number
  youtubeUrl: string | null
  liveBytes: number
  totalBytes: number
  publishTarget: string | null
  publishTargetDisplay: string | null
  description: string | null
  tags: string[]
  thumbBase64: string | null
  sortDate: string | null
  syncedAt: string
}

// ── Row Conversion ───────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToItem(row: any): DreamwatchItem {
  return {
    id: row.id,
    basename: row.basename,
    title: row.title,
    videoFile: row.video_file,
    thumbFile: row.thumb_file,
    videoSizeMb: row.video_size_mb ?? 0,
    thumbSizeMb: row.thumb_size_mb ?? 0,
    videoDate: row.video_date,
    thumbDate: row.thumb_date,
    cardStatus: row.card_status ?? 'QUEUED',
    isActive: row.is_active ?? false,
    state: row.state ?? 'NOT_STARTED',
    step: row.step ?? 0,
    totalSteps: row.total_steps ?? 8,
    progress: row.progress ?? 0,
    stepLabel: row.step_label,
    encodePct: row.encode_pct ?? 0,
    encodedTime: row.encoded_time,
    speed: row.speed,
    eta: row.eta,
    totalTime: row.total_time ?? '3h 00m 00s',
    fileSize: row.file_size,
    uploadPct: row.upload_pct ?? 0,
    youtubeUrl: row.youtube_url,
    liveBytes: row.live_bytes ?? 0,
    totalBytes: row.total_bytes ?? 0,
    publishTarget: row.publish_target,
    publishTargetDisplay: row.publish_target_display,
    description: row.description,
    tags: Array.isArray(row.tags) ? row.tags : (typeof row.tags === 'string' ? JSON.parse(row.tags) : []),
    thumbBase64: row.thumb_base64,
    sortDate: row.sort_date,
    syncedAt: row.synced_at,
  }
}

// ── Store ────────────────────────────────────────────────────────

interface DreamwatchState {
  items: DreamwatchItem[]
  loading: boolean
  initialized: boolean
  fetchItems: () => Promise<void>
  startPolling: () => void
  stopPolling: () => void
}

let pollInterval: ReturnType<typeof setInterval> | null = null

export const useDreamwatchStore = create<DreamwatchState>((set, get) => ({
  items: [],
  loading: false,
  initialized: false,

  fetchItems: async () => {
    if (!supabase) return
    const { data, error } = await supabase
      .from('dreamwatch_pipeline')
      .select('*')
      .order('is_active', { ascending: false })
      .order('sort_date', { ascending: false })

    if (!error && data) {
      set({ items: data.map(rowToItem), loading: false, initialized: true })
    }
  },

  startPolling: () => {
    if (pollInterval) return
    get().fetchItems()
    pollInterval = setInterval(() => get().fetchItems(), 5000)
  },

  stopPolling: () => {
    if (pollInterval) {
      clearInterval(pollInterval)
      pollInterval = null
    }
  },
}))
