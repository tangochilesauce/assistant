# JEFF State — Last Updated Feb 16, 2026

This is the boot-up file. Read this first every session.

## What Happened Last Session

- Built the JEFF web app's new unified kanban board (Today page)
- Cards are color-coded by project, grouped by project within columns
- Added sub-projects: Tango Amazon, Tango Costco, Tango DTC
- Added About page system — JEFF has its own About page, every project gets one
- Added "Waiting" column to pipeline (To Do → In Progress → Waiting → Done)
- Supabase is connected but database tables don't exist yet — app runs on seed data
- Renamed /assistant folder to /jeff
- Designed the brain file system (this file + per-project brains)
- Created /jeff slash command for conversational daily planning

## Current Pipeline Snapshot

### 🔨 In Progress
- Building JEFF infrastructure (brain files, folder maps, Supabase schema)

### ⏳ Waiting On
- Supabase tables need to be created (todos, transactions, settings, etc.)
- Real data needs to be entered (currently showing seed/default data)

### 📋 To Do (Top Priority)
- Create Supabase tables with full schema
- Build Tango About page (prototype for rich project pages)
- Add drag-and-drop reordering for todo items
- Build Tango dashboard (revenue, COGS, channel performance)
- Write About pages for each project

## Active Projects

| Project | Weight | Status | Current Goal |
|---------|--------|--------|-------------|
| 🔥 Tango | 65% | Active | Ship EXP pallet, fix Amazon PPC, close DTC sales |
| 🔥 → Amazon | 25% | Active | Restart PPC, optimize Truffle listing |
| 🔥 → Costco | 15% | Active | Close roadshow deal with Moses |
| 🔥 → DTC | 5% | Active | Drive direct website sales |
| 📱 FFEEDD | 15% | Launched | Get first 15 paid downloads |
| 🤖 JEFF | 10% | Building | Build into the operating system for everything |
| 🎸 Madder | 5% | Active | Drop single 2/22, build pre-save to 50+ |
| 🎬 Dream Beds | 5% | Active | Upload 28 videos, hit 100 subs |
| 🏠 Life Admin | 0% | Always | Pay all bills on time |

## Key Blockers

- UNFI pallet sitting at warehouse — need to email appointment desk
- Supabase tables empty — need schema creation
- No real todo data — seed data only

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
- Net: positive but tight, several unknown expenses

## System Architecture

- JEFF app: /Users/danfrieber/⚡ claudio/jeff/ (Next.js, deployed to GitHub Pages)
- Brain files: /Users/danfrieber/⚡ claudio/jeff/brain/ (this directory)
- Tango files: /Users/danfrieber/⚡ claudio/tango/ → symlink to /Projects/🔥 tango/
- FFEEDD code: /Users/danfrieber/⚡ claudio/ffeedd/
- Madder audio: /Users/danfrieber/⚡ claudio/madder/
- Dream Beds: /Users/danfrieber/⚡ claudio/dream-beds/
- Commands: /Users/danfrieber/⚡ claudio/.claude/commands/
