# JEFF — Brain

## Current Understanding

JEFF is the operating system for everything Dan builds. It's a Next.js web app deployed on GitHub Pages, plus a Claude Code slash command (/jeff) for conversational daily planning.

The philosophy: no scoring math, no rigid ranked lists. Show Dan the state of everything, let him pick. Priority is a story, not a formula.

## Goal

**This month:** Build JEFF into a usable daily tool
**12 months:** Replace Notion entirely as the single source of truth

## Tech Stack

- Next.js 16, TypeScript, Tailwind CSS 4, shadcn/ui
- Zustand state management
- Supabase for persistence (tables need creation)
- GitHub Pages hosting, GitHub Actions auto-deploy
- dnd-kit for drag-and-drop

## What Exists

- Unified kanban board (Today page) — all projects, color-coded, grouped
- Project detail pages with List/Board/About tabs
- About page system (JEFF has one, others pending)
- Cash Flow page (balance, income, expenses, forecast)
- Calendar page
- Dreamwatch page (video pipeline monitor)
- Sub-project support (Tango → Amazon, Costco, DTC)
- Brain file system (this directory)
- /jeff slash command

## Pipeline

- [ ] Be able to order/edit to-do list items
- [ ] README for each project (About pages)
- [ ] Add Tango dashboard
- [ ] Create Supabase tables
- [ ] Build file map system (index local folders)
- [ ] Connect /jeff command to brain files for boot-up

## Architecture

```
/Users/danfrieber/⚡ claudio/jeff/
├── brain/                ← My reading files (this directory)
│   ├── state.md          ← Boot-up file, read first
│   ├── tango/            ← Tango brain + sub-project brains
│   ├── ffeedd.md
│   ├── madder.md
│   ├── dream-beds.md
│   ├── jeff.md           ← This file
│   └── life-admin.md
├── src/                  ← Next.js app source
│   ├── app/              ← Pages (today, projects, board, cash, calendar)
│   ├── components/       ← UI components
│   ├── data/             ← Static data (projects, finance, about pages)
│   ├── store/            ← Zustand stores
│   └── lib/              ← Supabase client, utilities
├── .env                  ← Supabase credentials
└── out/                  ← Static build output
```

## Files

*This IS the JEFF directory. App code lives in src/.*
