# JEFF State — Last Updated Feb 17, 2026

This is the boot-up file. Read this first every session.

## What Happened Last Session

### Big Wins
- **Vercel deployed** — JEFF is live at assistant-k5go.vercel.app. No more localhost crashes. Auto-deploys on every push to main.
- **Tango Dashboard deployed** — Live at tangochilesauce.github.io/tango-dashboard/ via GitHub Pages
- **Orders pipeline built** — Drag-and-drop kanban on Tango Dashboard (New → Processing → Shipped → Paid) with PO/BOL/Invoice document links
- **Notes system built** — Per-project notes pages (/projects/[slug]/notes) backed by Supabase. Quick-capture, pin, edit inline, delete.
- **UNFI sub-project added** — Under Tango, with Endless Aisle + John Lawson + Brittney todos seeded
- **Waiting column removed** — Board is now clean 3-column: To Do → In Progress → Done
- **Sidebar horizontal scroll fixed** — overflow-x-hidden on SidebarContent
- **FFEEDD brand messaging captured** — "Quiet personal thoughts" tagline saved to brain file

### Previous Session (Feb 16-17)
- Imported 34 schedule items from schedule.html into Supabase
- Built deadline tag system (only ~12 real deadlines show in sidebar)
- Added Goals strategic dashboard (/goals) with 90d/6mo horizons
- Added Completed log (/log) with archive-instead-of-delete
- Added financial sections to deadlines sidebar (debts, payments, income)
- Added 14-day sprint banner (Feb 14-28)
- Square apple-icon for iPhone
- Focus items float to top of entire column

## Current Pipeline Snapshot

### ✅ Done (This Session)
- Vercel deployment
- Tango Dashboard deployment (GitHub Pages)
- Orders pipeline on Tango Dashboard
- Notes system (Supabase + Zustand + UI)
- UNFI sub-project
- Sidebar fixes
- FFEEDD brand copy captured

### 📋 To Do (Next Priority)
- Test notes page on Vercel (add first note to FFEEDD: "quiet personal thoughts")
- Add more orders to Tango Dashboard pipeline as they come in
- Build out About pages for each project
- Amazon PPC restart (sprint goal)
- Drop Madder single (sprint goal)

## Active Projects

| Project | Weight | Status | Current Goal |
|---------|--------|--------|-------------|
| 🔥 Tango | 65% | Active | Ship EXP pallet, fix Amazon PPC, close DTC sales |
| 🔥 → Amazon | 25% | Active | Restart PPC, optimize Truffle listing |
| 🔥 → Costco | 15% | Active | Close roadshow deal with Moses |
| 🔥 → UNFI | 25% | Active | SKU expansion into Northeast, complete Endless Aisle |
| 🔥 → DTC | 5% | Active | Drive direct website sales |
| 📱 FFEEDD | 15% | Launched | Get first 15 paid downloads |
| 🤖 JEFF | 10% | Building | Build into the operating system for everything |
| 🎸 Madder | 5% | Active | Drop single 2/22, build pre-save to 50+ |
| 🎬 Dream Beds | 5% | Active | Upload 28 videos, hit 100 subs |
| 🏠 Life Admin | 0% | Always | Pay all bills on time |

## 14-Day Sprint (Feb 14-28)
**Goal:** Ship pallet · Restart PPC · Drop single · Launch FFEEDD
**Target:** $5,000 new revenue
**Day:** 4 of 14

## Key Blockers

- UNFI: John Lawson response needed for SKU expansion
- UNFI: Endless Aisle paperwork incomplete
- Amazon: PPC barely running (~$66/60d) — massive untapped lever

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
- Net: positive but tight

## System Architecture

- **JEFF app:** /Users/danfrieber/⚡ claudio/jeff/ (Next.js)
- **JEFF live:** assistant-k5go.vercel.app (Vercel, auto-deploys from GitHub)
- **Tango Dashboard:** tangochilesauce.github.io/tango-dashboard/ (GitHub Pages)
- **Tango Dashboard repo:** /Users/danfrieber/⚡ claudio/tango-dashboard/
- **Brain files:** /Users/danfrieber/⚡ claudio/jeff/brain/
- **Tango files:** /Users/danfrieber/⚡ claudio/tango/ → symlink to /Projects/🔥 tango/
- **FFEEDD code:** /Users/danfrieber/⚡ claudio/ffeedd/
- **Madder audio:** /Users/danfrieber/⚡ claudio/madder/
- **Dream Beds:** /Users/danfrieber/⚡ claudio/dream-beds/
- **Commands:** /Users/danfrieber/⚡ claudio/.claude/commands/
- **Supabase:** muowpjabnjkqgwgzfmoj.supabase.co (tables: todos, settings, transactions, kanban_columns, dreamwatch_pipeline, notes)
- **GitHub repos:** tangochilesauce/assistant (JEFF), tangochilesauce/tango-dashboard
