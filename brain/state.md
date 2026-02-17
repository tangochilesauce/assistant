# JEFF State — Last Updated Feb 17, 2026 (Session 3)

This is the boot-up file. Read this first every session.

## What Happened This Session

### Big Wins
- **Brain page built** — Every project now has a Brain tab that renders the actual brain markdown files in the JEFF app. Nothing hidden from Dan anymore.
- **Brain build pipeline** — `scripts/build-brain.mjs` reads all brain files at build time, writes to `src/data/brain.ts`. Runs automatically via `prebuild` hook on every Vercel deploy.
- **Compact text rendering** — Brain pages use tiny text (11px body, 10px tables) so you can see maximum content per screen.
- **DTC email recovery plan** — Full research done: DNS audit, platform comparison, 4-email tiered re-engagement strategy, 14-day sprint timeline.
- **All brain files updated** — Every active project now has a rich, comprehensive brain file with strategy, learnings, metrics, pipelines, and intel.
- **13 DTC todos added** — Full email recovery pipeline in Supabase under tango-dtc.
- **Dan refactored project detail page** — Brain and Notes are now inline tabs on the project page (not separate routes). Smart move.

### Previous Session (Feb 17, Session 2)
- Vercel deployed — JEFF live at assistant-k5go.vercel.app
- Tango Dashboard deployed (GitHub Pages)
- Orders pipeline built on Tango Dashboard
- Notes system built (Supabase + Zustand + UI)
- UNFI sub-project added
- Waiting column removed, sidebar scroll fixed
- FFEEDD brand messaging captured

### Previous Session (Feb 16-17, Session 1)
- Imported 34 schedule items into Supabase
- Built deadline tag system
- Added Goals dashboard, Completed log, financial sidebar, sprint banner
- Square apple-icon for iPhone

## Current Pipeline Snapshot

### ✅ Done (This Session)
- Brain page built (per-project, renders markdown)
- Brain build pipeline (prebuild → brain.ts)
- Compact text rendering
- DTC email recovery research + plan
- All brain files updated to full depth
- 13 DTC email pipeline todos added to Supabase
- DTC brain: DNS audit, Shopify Email selected, 4-email strategy designed
- JEFF brain: corrected from "GitHub Pages" to Vercel, full architecture documented

### 📋 To Do (Next Priority)
- **DTC Sprint (URGENT):**
  - Log into Klaviyo → export list
  - Clean DNS in IONOS (remove stale Klaviyo SPF/DKIM)
  - Set up Shopify Email
  - Send first re-engagement email
- **Amazon:** Restart PPC ($10-20/day on Truffle)
- **Madder:** Single drops 2/22 (5 days away)
- **Costco:** Call Moses T-F this week
- **UNFI:** Follow up John Lawson, Endless Aisle paperwork
- **Orders system v2:** Supabase-backed orders + drop zone intake
- **Dream Beds:** Batch video sessions

## Active Projects

| Project | Weight | Status | Current Goal |
|---------|--------|--------|-------------|
| 🔥 Tango | 65% | Active | Ship EXP pallet, fix Amazon PPC, close DTC sales |
| 🔥 → Amazon | 25% | Active | Restart PPC, optimize Truffle listing |
| 🔥 → Costco | 15% | Active | Close roadshow deal with Moses |
| 🔥 → UNFI | 25% | Active | SKU expansion into Northeast, complete Endless Aisle |
| 🔥 → DTC | 5% | **SPRINT** | Clean DNS → export list → warm up → drive sales |
| 📱 FFEEDD | 15% | Launched | Get first 15 paid downloads |
| 🤖 JEFF | 10% | Building | Brain page live, all files visible to Dan |
| 🎸 Madder | 5% | Active | Drop single 2/22, build pre-save to 50+ |
| 🎬 Dream Beds | 5% | Active | Upload 28 videos, hit 100 subs |
| 🏠 Life Admin | 0% | Always | Pay all bills on time |

## 14-Day Sprint (Feb 14-28)
**Goal:** Ship pallet · Restart PPC · Drop single · Launch FFEEDD · DTC email push
**Target:** $5,000 new revenue
**Day:** 4 of 14

## Key Blockers

- **DTC:** Need to log into Klaviyo to confirm list is accessible (if account was fully closed, list is gone)
- **DTC:** Stale Klaviyo DNS records need cleaning in IONOS before any sends
- **UNFI:** John Lawson response needed for NE SKU expansion
- **UNFI:** Endless Aisle paperwork incomplete
- **Amazon:** PPC barely running (~$66/60d) — massive untapped lever
- **Cash:** Balance ~$45, tight until UNFI MOR (~Feb 23) and EXP invoice (~Mar 21)

## Key Contacts

| Name | Channel | Role | Status |
|------|---------|------|--------|
| Moses Romero | Costco | Asst Buyer, D13 | Roadshows discussion, call T-F |
| John Lawson | UNFI/WF | Whole Foods buyer | Follow up needed |
| Brittney Langlois | UNFI | UpNext SDM | Monthly check-ins |
| Lauren Martinez | Erewhon | Brand Management | Warm lead from 2022 |

## Financial Snapshot

- Balance: ~$45
- Monthly in: ~$12,144 (Amazon $1,900 + UNFI SoPac $3,422 + UNFI NE $3,422 + EXP $3,400)
- Monthly out: ~$4,037+ (Rent $2,878 + Insurance $376 + Storage $350 + Studio $300 + Claude $100 + PPC $33)
- Net: positive but tight — timing matters

## System Architecture

- **JEFF app:** /Users/danfrieber/⚡ claudio/jeff/ (Next.js 16, Vercel)
- **JEFF live:** assistant-k5go.vercel.app (auto-deploys from GitHub main)
- **Tango Dashboard:** tangochilesauce.github.io/tango-dashboard/ (GitHub Pages)
- **Brain files:** /Users/danfrieber/⚡ claudio/jeff/brain/ → built to src/data/brain.ts on deploy
- **Supabase:** muowpjabnjkqgwgzfmoj.supabase.co (tables: todos, settings, transactions, kanban_columns, dreamwatch_pipeline, notes)
- **GitHub repos:** tangochilesauce/assistant (JEFF), tangochilesauce/tango-dashboard
