# Dream Beds — Brain

**Target:** $5,000/month | **Current:** $0/month | **Gap:** $5,000/month
**Weight:** 5%
**Channel:** https://www.youtube.com/@dream_beds

---

## My Current Understanding

Dream Beds is a YouTube channel creating AI-generated "impossible sanctuary" bedrooms — underwater domes, cloud bedrooms, bioluminescent caves. 3-hour sleep/relaxation videos.

**Status:** 🚀 PIPELINE REVOLUTION (Feb 18, 2026). Discovered ElevenLabs Seedance produces FAR better ambient motion than MidJourney Video. New pipeline: MidJourney render → Seedance (4-12s, 720p) → ElevenLabs Astra upscale (4K) → FFmpeg loop → YouTube. No slow-mo needed. Cheaper, faster, more realistic. 5 videos live (old pipeline). Ready to mass-produce with new pipeline.

**The key insight:** Position as WELLNESS (not "ambient music") for 8x higher CPM ($10.92 vs $1.36).

**The math to $5K:** At $10.92 RPM, need ~458K views/month. More realistic path: 50K subs + sponsorships from mattress brands ($500-5K/video).

**Current milestone:** Hit 1K subs + 4K watch hours for monetization eligibility.

**The brand:** "Resting sanctuaries at the edge of vastness" — sometimes cosmic, sometimes urban, always infinite-feeling. Different places where humans rest at the edge of eternity. That's not content. That's a thesis.

---

## Goals

| Timeframe | Goal |
|-----------|------|
| **This Month** | Daily uploads, hit 50+ videos |
| **12 Months** | Make as much money as possible with almost no ongoing work |

---

## Key Metrics

| Metric | Current | Target | Gap |
|--------|---------|--------|-----|
| Monthly Revenue | $0 | $5,000 | $5,000 |
| Subscribers | 5 | 50,000 | 49,995 |
| Videos | 5 | 50+ | 45 |
| Total Views | 66 | 10,000 | 9,934 |
| Watch hours | ? | 4,000 | ? |
| Like Ratio | 100% | 95%+ | Done |
| Monetized | No | Yes | — |

### Revenue Milestones

| Milestone | Timeline | Monthly Revenue |
|-----------|----------|----------------|
| Monetization (1K subs, 4K hours) | 3-6 months | $0 |
| 10K subscribers | 6-12 months | $300-800 |
| 50K subs + sponsorships | 12-18 months | $1,500-3,000 |
| 100K subscribers | 18-24 months | $3,000-6,000 |

### Revenue Streams
1. **Ad revenue** — Main income at scale
2. **YouTube Premium** — 15-30% of revenue for sleep content (background play)
3. **Sponsorships** — Mattress brands at 50K+ subs ($500-5K/video)
4. **Memberships** — Extended 10-hour versions at 25K subs

---

## Video Performance (Jan 24, 2026)

| # | Title | Views | Like% | Scene | Notes |
|---|-------|-------|-------|-------|-------|
| 1 | Luxury Penthouse High Above City | **25** | 0% | Urban | Best reach |
| 2 | Ancient Palace (Egyptian) | **23** | 4.3% | Ancient | Fastest mover |
| 3 | Overgrown Hideaway | 10 | 10% | Overgrown | Moderate |
| 4 | Saturn Orbital Suite | 7 | **28.6%** | Celestial | Best engagement |
| 5 | Japanese Mountain Temple | 2 | 0% | Ancient | Underperforming |

### Patterns
- **Ancient/Egyptian themes WORK** — Palace is fastest mover
- **Urban/city vibes have reach** — Penthouse leading total views
- **Celestial has best engagement** — Saturn fans more engaged
- **Japanese/zen underperforming** — May need different angle
- **Recommendation:** Double down on Ancient (Egyptian style) and test more Celestial

---

## What We've Learned

### Confirmed
- **"Impossible Sanctuaries" brand position** — Bedrooms in places that couldn't exist in reality
- **Underwater/aquatic is the niche** — Lowest competition, highest wellness CPM
- **Wellness positioning = 8x CPM** — $10.92 RPM vs $1.36 for generic ambient
- **3-hour format is optimal** — Not intimidating (vs 8-10hr), good ad inventory (70+ mid-rolls)
- **ElevenLabs Seedance is THE video engine** — Replaced MidJourney Video entirely (Feb 2026)
- **Seedance motion is realistic enough to skip slow-mo** — Direct loop without time multiplication
- **ElevenLabs Astra upscale is THE upscaler** — 720p → 4K looks incredible
- **Topaz API upscale models are GARBAGE** — Tested gcg-5, ghq-5, prob-4, rhea-1 — all terrible on AI video
- **Topaz API slow-mo (Apollo) is good** — 2x and 8x both looked great, but unnecessary with Seedance
- **Slow-mo before upscale** — If ever needed, always slow-mo at 720p THEN upscale (cheaper, better quality)
- **No Bloom needed** — MidJourney source images work as thumbnails (just compress <2MB)
- **NEVER use browser for YouTube** — Always YouTube Data API for uploads, scheduling, updates
- **API scope needed:** `youtube` (full access), not just `youtube.upload`

### Animation Capabilities (Seedance)
Seedance handles realistic motion that MidJourney Video COULDN'T:
- ✅ Moving water, rain, waterfalls
- ✅ Swimming fish / sea creatures
- ✅ Active flames, roaring fires
- ✅ Realistic fluid dynamics
- ✅ Fabric sway, curtain movement
- ✅ Floating particles, dust motes
- ✅ Cloud/nebula drift
- ✅ Bioluminescent pulses

**Seedance I2V prompt tips:**
- Don't re-describe what's in the image — model can see it
- Front-load motion verbs (first 20-30 words matter most)
- Use intensity adverbs: "gently," "slowly," "barely," "subtly"
- NO negative prompts — can paradoxically introduce unwanted motion
- One action per element
- 30-100 words sweet spot
- Use "camera fixed. still" in prompt for static shots (no dedicated UI toggle in ElevenLabs)

### ElevenLabs (Seedance + Astra)
- **Current plan:** Starter ($5/mo, 30,000 credits) — ~9 videos/month
- **Recommended plan:** Creator ($22/mo, 100,000 credits) — ~32 videos/month ✅
- **Extra credits (Creator):** $0.30/1000
- **Seedance generation cost:** ~629 credits (4s clip) to ~1,888 credits (12s clip)
- **Astra 4K upscale cost:** ~2,454 credits
- **Per video (4s + 4K upscale):** ~3,083 credits
- **Per video (12s + 4K upscale):** ~4,342 credits
- **Concurrency:** 3 (Starter), 5 (Creator)
- **No API for video yet** — UI only. BytePlus Seedance API expected late Feb 2026.
- **Also has:** Veo, Sora, Wan, Kling video engines accessible in same UI

### Topaz Labs API (DEPRECATED — CANCEL)
- **Status:** ⚠️ CANCEL THIS — $39.99/mo, no longer needed
- **API Key stored:** `scripts/credentials/topaz_api_key.txt`
- **Script:** `scripts/topaz_slowmo.py` (still works if ever needed for slow-mo)
- **Upscale quality:** TERRIBLE on AI-generated content (all 4 models tested Feb 18)
- **Slow-mo quality:** Good (Apollo 8x confirmed), but unnecessary with Seedance

---

## What We've Tried

| Date | Action | Result | Learning |
|------|--------|--------|----------|
| Jan 27, 2026 | Integrated Topaz Labs API | topaz_slowmo.py working | API > web app for automation |
| Jan 27, 2026 | Tested 8x slowmo + 1080p upscale | 5.8MB → 24.1MB, ~1.5min | 100 videos/month budget |
| Jan 21, 2026 | Defined niche + brand | "Impossible Sanctuaries" | Clear positioning |
| Jan 21, 2026 | Built automation workflow | Full pipeline working | Ready to scale |
| Jan 21, 2026 | Designed metadata formula | Wellness-optimized titles | Should improve CTR |
| Jan 16, 2026 | Set up channel | @dream_beds live with 3 videos | Channel exists |

---

## Automation Pipeline

### The Atomic Formula (v2 — Feb 2026)
```
VISUAL SEED → AI MOTION → 4K UPSCALE → AUDIO LAYER → MONETIZABLE LENGTH
(MidJourney)  (Seedance)   (Astra)      (ambient)     (3 hours loop)
```
**The magic:** One MidJourney image → 4-12s of realistic AI motion → 4K upscale → 3 hours of beautiful video.
**No slow-mo needed.** Seedance motion is realistic enough to loop directly.

### Full Pipeline (NEW — Feb 2026)
```
Dan (manual, in ElevenLabs UI):
  MidJourney → Generate source image
       ↓
  ElevenLabs Seedance 1.5 Pro → Image-to-video (4-12s, 720p, fixed camera)
       ↓
  ElevenLabs Astra → Upscale to 4K (3840x2160)
       ↓
  Drop .mp4 + .jpg/.png into /_ queue/

Claude (/dreamtime):
  dream_beds_video_maker.sh → Loop to 3 hours + add audio
       ↓
  compress_thumbnail.sh → Compress MidJourney image <2MB (no Bloom)
       ↓
  Claude → Generate title/description/tags from thumbnail
       ↓
  youtube_upload.py → Upload with metadata (PUBLIC)
```

### OLD Pipeline (v1 — Jan 2026, DEPRECATED)
```
MidJourney → MidJourney Video (30s) → Topaz Astra desktop (16x slow-mo + upscale) → loop
Problems: Bad physics, needed heavy slow-mo to hide artifacts, expensive ($45/mo total)
```

### System Architecture
- **Queue path:** `/Users/danfrieber/⚡ claudio/dream-beds/_ queue/`
- **Sync daemon:** `dreamwatch_sync.py`
- **Dreamwatch page in PL8:** `/dreamwatch` — real-time pipeline status (polls Supabase every 5s)
- **Supabase table:** `dreamwatch_pipeline`
- **Pipeline states:** STEP0_META → STEP1 → ... → PUBLISHED
- **Card statuses:** ACTIVE, QUEUED, PUBLISHED, FAILED, UNPAIRED_VIDEO, UNPAIRED_THUMB

### Active Scripts
- `dream_beds_video_maker.sh` — video looping
- `compress_thumbnail.sh` — thumbnail compression
- `youtube_upload.py` — API upload with metadata
- `youtube_metrics.py` — pull fresh channel stats

### Manual Commands
```bash
./dream_beds_video_maker.sh source.mp4      # Just make the video
./compress_thumbnail.sh thumbnail.png        # Just compress thumbnail
./youtube_upload.py --video final.mp4 --metadata metadata.json --thumbnail thumb.jpg --privacy unlisted
python3 dream-beds/scripts/youtube_metrics.py --all   # Pull metrics
```

---

## The Core Concept (LOCKED)

> A human-scale, deeply comfortable resting place suspended at the edge of vast outer space.

Not "space bedroom." Not "sci-fi luxury." This is:
- **Rest + infinity**
- **Vulnerability + protection**
- **Sleep + cosmic scale**

### Two Non-Negotiable Anchors

**Anchor 1: Cosmic Exterior** — Outer space, visible planets/stars/nebulae, massive scale, slow eternal feeling.

**Anchor 2: Human Comfort Zone** — Bed, mattress, cushions, blankets, soft fabrics, low posture, safety/warmth/intimacy.

Everything else is just **architecture skins**.

### Expanded Concept
Infinity doesn't have to be stars. A megacity at night IS infinity to the nervous system.

**Two lanes:**
- **Lane A — Cosmic Sanctuaries:** Orbiting beds, cathedral-in-space, floating cloud temples
- **Lane B — Liminal Urban Sanctuaries:** High-rise bedrooms, neon balconies, rain-soaked megacity overlooks

Both share: rest, night, vastness, quiet. That's a brand, not a contradiction.

### Core Rules
- Always a **resting posture** (bed, mattress, cushions)
- Always **night or low light**
- Always **warm foreground / cool distance**
- Always **no people**
- Always **a sense of looking out at something larger than you**

---

## Prompt Framework (4 Layers)

### Layer 1: WORLD FOUNDATION (always paste)
```
A serene, hyper-real environment where a human-scale resting place exists at the edge of outer space.
Massive cosmic scale contrasted with intimate comfort.
No chaos, no urgency, timeless, sacred calm.
The viewer feels protected while gazing into infinity.
```

### Layer 2: COMFORT ANCHOR (always paste)
```
Foreground features a deeply comfortable resting setup: a bed or mattress with soft blankets, pillows, flowing fabric, warm textures.
Low, grounded posture designed for rest, sleep, contemplation.
Warm interior lighting, candlelight or soft ambient glow.
```

### Layer 3: COSMIC ANCHOR (always paste)
```
Beyond the resting space is open outer space: visible planets, star fields, nebulae, or glowing atmospheric curvature.
Vast scale, slow celestial presence, silent infinity.
Cool cosmic light contrasts gently with the warm interior glow.
```

### Layer 4: ARCHITECTURAL SKIN (swap this)

**Miami Vice Balcony:** Pastel tones, smooth curves, glass railings, coastal luxury aesthetics. Open-air balcony floating in space.

**Roman Cathedral:** Grand arches, carved stone, gold inlays, flowing drapery. Sacred, monastic luxury suspended in space.

**Victorian Castle Balcony:** Ornate stonework, iron railings, candle lanterns, gothic elegance. A quiet balcony overlooking the cosmos.

**Outdoor Camping:** Minimalist natural setting, grassy hill, blankets laid out beneath the stars. The ground itself floats gently in space.

### Camera + Style Control (every time)
```
Cinematic wide-angle composition. Symmetrical or gently balanced framing.
Soft depth, no distortion. Hyper-real, physically plausible materials.
Dreamlike but grounded realism.
```

### Negative Prompt (mandatory)
```
people, human faces, movement, action, text, logos, clutter, futuristic UI, cyberpunk chaos,
oversaturation, cartoon style, anime, sharp angles, harsh lighting, noise, blur, fisheye distortion
```

### Tuning Tips
1. **Reduce perfection** — add "slightly imperfect," "lived-in," "gentle asymmetry"
2. **Add liminal cue** — faint stars in glass, city lights blending into sky, atmospheric haze
3. **Lower status signal** — fewer glossy highlights, softer materials, "private refuge" not "penthouse flex"

---

## Scene Categories

| Category | Examples | Sound Elements |
|----------|---------|---------------|
| **AQUATIC** | Underwater domes, submarine bedrooms | Ocean, whales, bubbles |
| **CELESTIAL** | Space stations, moon bases | Deep hum, cosmic noise |
| **ATMOSPHERIC** | Cloud bedrooms, floating sanctuaries | Thunder, wind, rain |
| **SUBTERRANEAN** | Bioluminescent caves, crystal caverns | Water drips, echo |
| **OVERGROWN** | Dystopian ruins, solarpunk treehouses | Rain on glass, nature |

### Theme Collections

**Golden Ages:** 1920s Paris, 1930s Shanghai, 1950s Havana, 1970s New York, 1980s Tokyo, 1990s Miami, 1990s Berlin, 2000s Dubai

**Ancient Luxury:** Ancient Rome senator's villa, 1700s Versailles, 1400s Florence (Medici), 1920s Cairo (King Tut era), 1890s Vienna (Klimt), Edo Period Kyoto

**Film Genre Beds:** Noir detective's apartment, Hitchcock blonde's hotel, Spaghetti Western brothel suite, French New Wave Paris flat, Kubrick sterile future, Lynch red curtain room

**Architecture Movements:** Art Deco penthouse, Art Nouveau Paris, Brutalist suite, Mid-Century Modern Palm Springs, Gothic Revival, Memphis Milano, Bauhaus, Googie atomic age

**Music Era Beds:** Jazz Age speakeasy, Bebop NYC loft, Motown Detroit, CBGB punk loft, Studio 54 VIP, Haçienda Manchester, Seattle grunge apartment, Berlin techno warehouse

**Weather/Elements:** Thunderstorm suite, Blizzard cabin, Monsoon penthouse, Fog bank tower, Sandstorm riad

**Emotions/Moments:** Last night before wedding, Night you got the news, Can't sleep heartbreak, Just fell in love, Finally made it

**Fictional/Literary:** Gatsby's bedroom, Bond villain's guest suite, Blade Runner replicant's apartment, Overlook Hotel room 237, Phantom's opera house lair

**Transportation:** Orient Express private cabin, Titanic first class, Zeppelin suite, Submarine captain's berth, Sleeper train across Siberia

**What Could Have Been:** If Rome never fell (2025), If Art Deco continued (NYC 1980), If Aztecs survived (Tenochtitlan 2025), If Tesla won (1950)

---

## Title Formula
```
[Wellness Trigger] in [Impossible Location] | [Sound Element] | 3 Hours
```

**Wellness Triggers:** Fall Asleep, Deep Sleep, Drift Off, Sleep Instantly, Rest Deeply

**Sound Elements by Scene:**
- Underwater: Ocean Sounds & Distant Whales
- Space: Space Station Hum & Deep Bass
- Sky/Clouds: Soft Thunder Below, Wind & Distant Rain
- Cave: Water Drips & Echo
- Dystopian: Distant City Hum, Rain on Metal

---

## Monetization Reminders

1. Position as **WELLNESS** (not music) → 5-10x higher CPM
2. Use wellness keywords: sleep, insomnia, therapy, deep sleep
3. Target English-speaking countries for highest CPM
4. 3-hour videos = optimal for ads
5. Upload as PRIVATE first → review → change to PUBLIC

---

## YouTube Automation Research

### High-CPM Niches

| Niche | CPM | Automation? |
|-------|-----|------------|
| Personal Finance | $12-22 | Yes |
| AI/Tech Tutorials | $15-22 | Yes |
| True Crime | $12-18 | Yes |
| ASMR/Wellness | $7-15 | **YES** |
| Educational | $10-25 | Yes |
| Entertainment/Satisfying | $1-4 | YES (volume) |

### AI Video Tool Landscape (2026)

| Tool | Type | Max | Price |
|------|------|-----|-------|
| **Topaz Video AI** | Slow-mo | 16x | $33-67/mo |
| RIFE (Flowframes) | Slow-mo | Unlimited | Free |
| **Kling 2.5** | Image-to-video | 2-3 min | $6.99-180/mo |
| Runway Gen-3 Alpha | Image-to-video | 34s | 5 credits/s |
| Sora 2 | Image-to-video | 20s | $20+/mo |

### Successful Faceless Channels
- **Lofi Girl:** 15M subs, $20-45K/month
- **ASMR Soap:** $860/day, never shows face
- **CSM Relaxing:** 4.73M subs, 2B views
- **Fern (true crime):** 2M+ subs, $80K+/month (3D docs)
- Faceless ambient channel: $193K in 90 days (138K subs, 32M views)

### YouTube Policy Warning (July 2025)
"Inauthentic content" update — mass-produced template videos ineligible. Must use ORIGINAL audio/video. Stay safe: vary formats, add human curation, disclose AI with "Altered Content" label.

### Pipeline Optimization Ideas
1. Kling 2.5 for image-to-video (better physics)
2. `medium` FFmpeg preset instead of `slow` — 3-4x faster
3. Aura AI / Luma AI Loop for seamless loops
4. Same base → Shorts + 10-min + 3-hour versions
5. Generate binaural beats procedurally for unique audio

### 12 Novel Channel Concepts (Same Pipeline)
**Tier 1 (Dream Beds pipeline):** Microscopic Worlds, Dream Weather, Texture Time, Dream Offices, Dream Libraries
**Tier 2 (different tools):** Synesthesia (audio-reactive), Satisfying Machines, The Loop Room, Binaural Landscapes
**Tier 3 (higher effort):** Data in Motion (D3.js), Time Collapse, Infinite Zoom

---

## Intel (Time-Sensitive)

| Date | Finding | Source | Expires |
|------|---------|--------|---------|
| Jan 22, 2026 | **$10.92 RPM confirmed for sleep/healing niche** — only ~20K competing channels | OutlierKit | Ongoing |
| Jan 22, 2026 | Lofi Girl makes $39K-$117K/mo streaming ambient without showing face | OutlierKit | Benchmark |
| Jan 22, 2026 | YouTube "inauthentic content" policy — mass-produced template videos ineligible | Gyre | Risk factor |
| Jan 22, 2026 | Must use ORIGINAL audio/video — "no-copyright" content triggers "reused content" rejection | TunePocket | Critical |
| Jan 22, 2026 | Evergreen content generates traffic for years | ShortVids | Strategy |
| Jan 22, 2026 | Don't rely only on AdSense — stack affiliates, digital products, merch, licensing | ShortVids | Monetization |
| Jan 22, 2026 | YouTube 2026 algo: 1,000+ signals, engagement quality > raw views | SubSub | Ongoing |
| Jan 22, 2026 | 8-10 hour videos maximize watch time — longer = more ads = more money | TunePocket | Strategy |
| Jan 22, 2026 | Shorts feed long-form monetization — use as funnel, not main strategy | Vozo | Strategy |
| Jan 23, 2026 | ASMR audiences = $7-15 CPM, peak 9-11pm | Research | Publish timing |

---

## Blockers

| What | Why | Unblock |
|------|-----|---------|
| Monetization | Need 1K subs + 4K watch hours | Produce more videos |
| Sponsorships | Need 10K+ subs | Keep growing |

---

## Open Questions

- What's the best posting schedule for algorithm?
- Which scene types perform best? (Need more analytics data)
- When do mattress brands typically reach out?
- Should we do community engagement or just focus on volume?
- Cross-promotion opportunity with sleep/ASMR creators?

---

## Action Queue

| # | Action | Status |
|---|--------|--------|
| 1 | Go thru all vids I have | To Do |
| 2 | Produce 10 underwater-themed videos | To Do |
| 3 | Batch render 20 MidJourney source images | To Do |
| 4 | Upload daily video (check /queue folder) | Daily |
| 5 | Hit 1K subs + 4K watch hours | Milestone |
| 6 | Optimize thumbnails based on CTR data | After data |
| 7 | Scale to daily uploads | To Do |
| 8 | Research mattress brand sponsorship rates | Later |
| 9 | Launch channel memberships at 25K subs | Later |

### Done
- [x] Set up YouTube Data API v3 + OAuth2 credentials
- [x] Build Python upload script for /queue folder workflow
- [x] Dreamwatch pipeline built and deployed
- [x] Queue path fixed (`_ queue/` not `! queue`)
- [x] Dreamwatch page live in PL8

---

## Files

*Located at: /Users/danfrieber/⚡ claudio/dream-beds/*
- scripts/ — automation scripts (dreamwatch_sync.py, youtube_upload.py, youtube_metrics.py)
- _ queue/ — upload workflow queue
- scripts/credentials/ — API keys
- scripts/templates/ — metadata templates
- audio/ — ambient_3hr.mp3

---

*Migrated from Notion (Dream Beds parent + Quick Reference + Video Performance Tracker + DREAM BEDS raw + YouTube Automation Research + Project Brain) — Feb 18, 2026*
