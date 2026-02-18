# JEFF — Brain

## Current Understanding

JEFF is the operating system for everything Dan builds. It's a Next.js web app deployed on **Vercel** (auto-deploys on every push to main), backed by **Supabase** for all persistent data. Plus a Claude Code slash command (/jeff) for conversational daily planning.

The philosophy: no scoring math, no rigid ranked lists. Show Dan the state of everything, let him pick. Priority is a story, not a formula.

**Live URL:** assistant-k5go.vercel.app
**Repo:** github.com/tangochilesauce/assistant

## What We've Learned

- **Vercel > GitHub Pages for Next.js** — switched mid-session Feb 17. No more localhost crashes. Auto-deploys every push.
- **Localhost dev server is unreliable** — crashes constantly, needs `lsof -i :3000 | xargs kill -9` to recover. Vercel made this irrelevant.
- **Static export (`output: "export"`) works fine with Supabase** — all data is client-side fetched. No SSR needed for this use case.
- **Supabase tables need manual SQL creation** — can't create via REST API with anon key. Run SQL in Supabase dashboard.
- **Brain files are the soul of the system** — Claude reads/writes them between sessions, but Dan couldn't see them until the Brain page was built.
- **Tags system is powerful** — JSONB tags on todos handle: focus, deadline, completed:DATE, archived. Flexible metadata without schema changes.
- **dnd-kit closestCenter > closestCorners** — less finicky for 3-column layouts.
- **IECU scoring model abandoned** — Original Prisma schema had impact (1-10), ease (1-10), control (1-10), urgency (1-3) scoring on todos. Dropped in favor of "priority is a story, not a formula."
- **Prisma/SQLite was the original DB** — Dormant schema still exists in repo. Models: Project, Goal (hierarchical), TodoItem (with scoring), Transaction (recurring support), Settings. Replaced by Supabase.

### Platform Evolution
1. **Vercel attempt #1 (early Feb)** — Full backend, auto-deploy. Disaster: webhook integration failed silently, deploy hooks returned PENDING but never materialized. Multiple re-imports failed.
2. **GitHub Pages (Feb 15)** — Pivoted to static export. All data hardcoded in DashboardClient.tsx. Free, fast, actually worked. Deploy via GitHub Actions (~50s).
3. **Supabase added (Feb 16)** — Client-side data fetching. Replaced hardcoded constants with Zustand stores + Supabase tables.
4. **Vercel attempt #2 (Feb 17)** — Switched back. This time it worked. Auto-deploys every push to main. GitHub Pages deploy kept as fallback.

## Goal

**This month:** Build JEFF into a usable daily tool — fully operational command center
**12 months:** Replace Notion entirely as the single source of truth

## Tech Stack

- **Framework:** Next.js 16.1.6, TypeScript, Tailwind CSS 4
- **UI:** shadcn/ui (Radix primitives), Lucide icons, Geist font
- **State:** Zustand 5.0.11 (5 stores: todos, notes, transactions, columns, dreamwatch)
- **Database:** Supabase (PostgreSQL) — 6 tables: todos, notes, settings, transactions, kanban_columns, dreamwatch_pipeline
- **Drag & Drop:** @dnd-kit/core 6.3.1
- **Charts:** Recharts 2.15.4 (forecast, spending breakdown)
- **Hosting:** Vercel (auto-deploy from GitHub main branch)
- **Repo:** github.com/tangochilesauce/assistant

## What Exists (Feb 2026)

### Pages
| Route | Purpose |
|-------|---------|
| `/today` | Daily unified board — all projects, sprint banner, deadlines sidebar |
| `/board` | Full board with collapsible project sections |
| `/projects` | Project grid listing |
| `/projects/[slug]` | Project detail (List / Board / About tabs) |
| `/projects/[slug]/notes` | Per-project notes scratchpad (Supabase-backed) |
| `/projects/[slug]/brain` | Brain file viewer (renders markdown from brain files) |
| `/cash` | Financial dashboard (balance, forecast, transactions, recurring) |
| `/goals` | Revenue targets, strategy, 90d/6mo metrics per project |
| `/log` | Completed items journal (grouped by date) |
| `/calendar` | Month view with color-coded due dates |
| `/dreamwatch` | Dream Beds video encode/upload pipeline monitor |

### Features
- Drag-and-drop kanban (unified + per-project)
- Sprint banner with countdown + progress bar
- Deadline tags (only real hard-date items show in sidebar)
- Focus items float to top of columns
- Financial sidebar (debts, payments, income under deadlines)
- Auto-archive completed items (status: 'archived', not deleted)
- Notes per project (pin, edit inline, delete)
- Brain file viewer per project (renders markdown brain files in app)
- External link to Tango Dashboard (tangochilesauce.github.io/tango-dashboard/)

### Sub-Projects
- Tango → Amazon, Costco, UNFI, DTC
- Each has its own brain file, notes page, and board

### Stores (Zustand)
| Store | Tables | Purpose |
|-------|--------|---------|
| todo-store | todos | Tasks, kanban, focus, deadlines, archiving |
| note-store | notes | Per-project scratchpad notes |
| transaction-store | transactions, settings | Income, expenses, balance, forecast |
| column-store | kanban_columns | Custom kanban columns per project |
| dreamwatch-store | dreamwatch_pipeline | Video pipeline polling |

## Pipeline

### Done
- [x] Unified kanban board (Today page)
- [x] Project detail pages (List/Board/About)
- [x] Cash Flow page (balance, forecast, transactions, recurring)
- [x] Calendar page with color dots
- [x] Dreamwatch video pipeline monitor
- [x] Goals strategic dashboard (90d/6mo)
- [x] Completed items log (/log)
- [x] Sprint banner
- [x] Deadline tag system
- [x] Focus items float to top
- [x] Financial sidebar (debts, payments, income)
- [x] Notes per project (Supabase-backed)
- [x] Brain page per project (renders brain files in app)
- [x] Vercel deployment (no more localhost)
- [x] Square apple-icon for iPhone
- [x] UNFI sub-project
- [x] Tango Dashboard external link

### To Do
- [ ] Orders system v2 (Supabase-backed orders + drop zone intake on Tango Dashboard)
- [ ] Rich About/README pages for all projects (only JEFF populated)
- [ ] Supabase tables for contacts, learnings, intel
- [ ] Pattern detection and insights
- [ ] Connect /jeff command to brain files for boot-up

## Architecture

```
/Users/danfrieber/⚡ claudio/jeff/
├── brain/                ← Brain files (Claude reads/writes, app renders)
│   ├── state.md          ← Boot-up file, read first
│   ├── jeff.md           ← This file
│   ├── ffeedd.md
│   ├── madder.md
│   ├── dream-beds.md
│   ├── life-admin.md
│   └── tango/
│       ├── overview.md   ← Parent Tango strategy
│       ├── amazon.md
│       ├── costco.md
│       └── dtc.md
├── src/
│   ├── app/              ← Pages (today, projects, board, cash, goals, log, calendar, dreamwatch)
│   ├── components/       ← UI (kanban, cash, layout, action-line, sprint-banner, deadlines-sidebar)
│   ├── data/             ← Static data (projects.ts, finance.ts, about.ts, goals.ts)
│   ├── store/            ← Zustand stores (todo, note, transaction, column, dreamwatch)
│   └── lib/              ← Supabase client, forecast algorithm, utilities
├── .env.local            ← Supabase credentials (git-ignored)
├── supabase-setup.sql    ← Database schema reference
└── next.config.ts        ← output: "export", basePath conditional on GITHUB_PAGES env
```

## Theme

```
--background: #0a0a0a
--foreground: #e5e5e5
--card: #141414
--border: #262626
--accent: #f59e0b (amber)
```

Dark theme only. Hides scrollbars on mobile. Geist font.

## Supabase

**Project:** muowpjabnjkqgwgzfmoj.supabase.co
**RLS:** Open (single-user app, all tables allow all)

| Table | Purpose |
|-------|---------|
| todos | Tasks with kanban status, tags, due dates |
| notes | Per-project scratchpad notes |
| settings | Key-value store (cash_balance) |
| transactions | Income/expense records + recurring templates |
| kanban_columns | Custom column definitions per project |
| dreamwatch_pipeline | Video encode/upload pipeline state |

## Key Contacts

(See state.md for full contact list — this brain tracks JEFF development only)

## Files

*This IS the JEFF directory. App code lives in src/.*
