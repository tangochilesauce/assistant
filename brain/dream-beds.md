# Dream Beds — Brain

## Current Understanding

Dream Beds is a YouTube channel about bed reviews/content. Goal is consistent daily uploads to build the channel. Has a custom video pipeline system (**Dreamwatch**) that syncs local queue state to Supabase for real-time monitoring in JEFF.

The channel is in growth mode — volume of uploads matters more than polish right now. Batch production sessions maximize output per day.

## What We've Learned

- **Batch production is the play** — record multiple videos in one session, then process/upload over time
- **Dreamwatch pipeline works** — automated encode → upload → publish workflow monitored in JEFF
- **Queue path uses underscore**: `_ queue/` (not `! queue` — this was a bug that was fixed Feb 2026)
- **Shorts + cross-posting** doubles distribution without extra recording time
- **Consistency beats quality** at this stage — need 100 subs to unlock monetization features

## System Architecture

- **Queue path:** `/Users/danfrieber/⚡ claudio/dream-beds/_ queue/`
- **Sync daemon:** `/Users/danfrieber/⚡ claudio/dream-beds/scripts/dreamwatch_sync.py`
- **Dreamwatch page in JEFF:** `/dreamwatch` — real-time pipeline status (polls Supabase every 5s)
- **Supabase table:** `dreamwatch_pipeline` — tracks encode progress, upload status, YouTube URLs
- **Pipeline states:** STEP0_META → STEP1 → ... → PUBLISHED
- **Card statuses:** ACTIVE, QUEUED, PUBLISHED, FAILED, UNPAIRED_VIDEO, UNPAIRED_THUMB

### How It Works
1. Drop video + thumbnail into `_ queue/` folder
2. Dreamwatch daemon detects new files, starts encoding
3. Progress syncs to Supabase in real-time
4. JEFF's Dreamwatch page shows live encode %, upload %, ETA
5. Video publishes to YouTube, URL captured in Supabase

## Strategy

1. **Batch 7 videos per session** — maximize studio time
2. **Cut Shorts from long-form** — 5 Shorts per batch
3. **Cross-post to TikTok + Reels** — same content, 3x distribution
4. **Hit 100 subs** — unlock community posts, stories, channel customization
5. **28 videos in February** — daily upload cadence

## Open Questions

- What's the current subscriber count?
- How many videos uploaded so far?
- What's the average view count per video?
- Which video topics/types perform best?
- Any revenue from existing videos?
- Is the dreamwatch_sync.py daemon running reliably?

## Goal

**This month:** Upload 28 videos, hit 100 subscribers
**12 months:** $5,000/mo (ad revenue + sponsorships + affiliate links)

## Pipeline

### 📋 To Do
- [ ] Batch 7 videos (next session)
- [ ] Cut 5 Shorts from existing long-form
- [ ] Cross-post to TikTok + Reels
- [ ] Batch another 7 videos (second session)
- [ ] Review analytics — what's working, what's not

### 🔨 In Progress
(depends on current session status)

### ✅ Done
- [x] Dreamwatch pipeline built and deployed
- [x] Queue path fixed (`_ queue/` not `! queue`)
- [x] Dreamwatch page live in JEFF

## Files

*Located at: /Users/danfrieber/⚡ claudio/dream-beds/*
- scripts/ — automation scripts (dreamwatch_sync.py)
- _ queue/ — upload workflow queue
