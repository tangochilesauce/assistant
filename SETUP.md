# Assistant Dashboard — Setup Reference

> For future Claude sessions or anyone picking this up. Everything you need to know about how this project is built, hosted, and deployed.

---

## What Is This?

A single-page dashboard that shows all active projects, priorities, income, expenses, and cash flow at a glance. Built as a static site — no database, no server, no backend. All data is hardcoded in `DashboardClient.tsx` and updated manually.

**Live URL:** https://tangochilesauce.github.io/assistant/

---

## Tech Stack

| Thing | What |
|-------|------|
| Framework | Next.js 16 (static export mode) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 (utility classes) |
| Hosting | GitHub Pages (free) |
| CI/CD | GitHub Actions (auto-deploys on push to `main`) |
| Repo | https://github.com/tangochilesauce/assistant (public) |

---

## How Deployment Works

**Push to `main` → GitHub Action builds → deploys to GitHub Pages. That's it.**

The workflow file is at `.github/workflows/deploy.yml`. Here's what it does:

1. Triggers on any push to `main` (or manual trigger via `workflow_dispatch`)
2. Checks out the code
3. Installs Node 20 + runs `npm ci`
4. Runs `npm run build` with `GITHUB_PAGES=true` env var
5. Uploads the `out/` folder as a Pages artifact
6. Deploys to GitHub Pages

**Build time:** ~50 seconds

### Key Config: `next.config.ts`

```ts
output: "export"              // Static HTML export (no server needed)
basePath: "/assistant"         // Only when GITHUB_PAGES=true (GitHub Pages serves from /assistant/)
images: { unoptimized: true }  // No image optimization (static export doesn't support it)
```

The `basePath` is needed because GitHub Pages serves project sites at `username.github.io/repo-name/`, not at the root.

---

## How To Update the Dashboard

All data lives in one file: `src/components/DashboardClient.tsx`

Open the file and edit the constants at the top:

| Constant | What it controls |
|----------|-----------------|
| `BALANCE` | Current bank balance number |
| `PROJECTS` | The project cards (name, emoji, color, weight, goal, actions) |
| `INCOME` | Income streams with status (locked/expected/sporadic/inactive) |
| `PERSONAL` | Personal expenses |
| `BUSINESS` | Business expenses |
| `PRODUCTION` | Per-run production costs |

After editing, push to `main` and it auto-deploys in ~50 seconds.

---

## Local Development

```bash
cd /Users/danfrieber/⚡\ claudio/assistant
npm run dev
# Opens at http://localhost:3000
```

Note: Locally there's no basePath, so it runs at root `/`. The `GITHUB_PAGES` env var only gets set during the GitHub Action build.

---

## Project Structure

```
assistant/
├── .github/workflows/deploy.yml   # GitHub Actions deployment
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout (html/body wrapper)
│   │   ├── page.tsx               # Home page (renders DashboardClient)
│   │   └── globals.css            # Tailwind imports
│   └── components/
│       └── DashboardClient.tsx    # THE file — all data + all UI
├── next.config.ts                 # Static export + basePath config
├── package.json                   # Dependencies + scripts
├── tailwind.config.ts             # Tailwind config
├── tsconfig.json                  # TypeScript config
└── out/                           # Build output (git-ignored)
```

---

## History & What NOT To Do

### Vercel (ABANDONED - Feb 2026)
We originally deployed on Vercel. It was a disaster:
- **Auto-deploy broke repeatedly** — pushes to `main` didn't trigger builds
- GitHub webhook integration failed silently
- Deploy hooks returned `PENDING` but never materialized
- Disconnecting and reconnecting the repo didn't fix it
- Multiple reimports of the project didn't fix it
- Vercel CLI wasn't authenticated and was another headache

**Lesson: Don't use Vercel for this project.** GitHub Pages is simpler, free, and actually works.

### Static Export Constraints
When we switched to `output: "export"` for GitHub Pages, we had to remove:
- All API routes (`src/app/api/*`) — static export can't have server routes
- Pages with `force-dynamic` — static export requires everything to be static
- Prisma/database dependency from the build — no server = no database at build time

This is fine because the dashboard is 100% client-side with hardcoded data anyway.

### Repo Is Public
GitHub Pages requires public repos on the free plan. The repo was made public to enable Pages. No secrets or sensitive data should be committed.

---

## Dependencies Worth Knowing

| Package | Why it's there |
|---------|---------------|
| `next` 16.1.6 | Framework |
| `react` / `react-dom` 19.2.3 | UI library |
| `tailwindcss` 4 | Styling |
| `@tailwindcss/postcss` 4 | Tailwind build integration |
| `prisma` / `@prisma/client` | Leftover from Vercel era — not used in build. Could be removed. |
| `typescript` 5 | Type checking |

### Cleanup Opportunity
The `prisma` and `@prisma/client` packages + the `prisma/` folder are leftovers from when this had a real database. They're not hurting anything but could be removed to slim down `npm ci` time.

---

## Quick Reference

| Task | Command |
|------|---------|
| Run locally | `npm run dev` |
| Build locally | `npm run build` |
| Deploy | `git push origin main` (automatic) |
| Check deployment | Go to repo → Actions tab → see latest run |
| Manual deploy | Go to repo → Actions → "Deploy to GitHub Pages" → Run workflow |

---

*Last updated: Feb 15, 2026*
