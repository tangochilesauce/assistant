# JEFF State — Last Updated Feb 19, 2026 (Session 6)

This is the boot-up file. Read this first every session.

## What Happened This Session (Session 6)

### Big Wins
- **Dreamwatch Streak Counter + Calendar BUILT** — Full motivational system added to top of Dreamwatch page. Streak counter with drill-sergeant/encouraging messages, 60-day calendar strip (past 30 + future 30) with green (published) / amber (queued) / empty dots. Auto-scrolls to today.
- **YouTube History Synced** — New Python daemon (`dreamwatch_calendar_sync.py`) fetches all published videos from YouTube API, populates `dreamwatch_calendar` Supabase table. 21 videos synced, 15 unique dates.
- **Auto-Scheduling Engine Built** — Queue pairs auto-assigned to next empty calendar day at 5 PM ET. FIFO order. Writes schedule into metadata JSON for upload pipeline pickup.
- **Leopard Upload Recovered** — Was stuck at 66% due to expired token + ServerNotFoundError. Re-authed, relaunched. Currently uploading, scheduled for Feb 20 5 PM ET.
- **Deploy Cleaned Up** — Killed GitHub Pages workflow entirely. Vercel is sole deploy target. Removed basePath conditional from next.config.ts. Updated MEMORY.md.
- **MEMORY.md Updated** — Added "NEVER use localhost" rule and "Vercel only" deployment info.

### Sunday Feb 22 — Dream Beds Pipeline Rebuild
Dan wants to rebuild the entire Dream Beds pipeline on Sunday. Two PL8 todos created with due date Feb 22:
1. **Rebuild Dream Beds pipeline script (unified daemon)** — Merge `dreamwatch_sync.py` + `dreamwatch_calendar_sync.py` into one daemon. Add launchd plist for auto-start on boot. Upload watchdog for auto-retry. FSEvents file watcher on `_ queue/` for fully automatic pipeline (drop pair → encode → upload → schedule → publish). The whole thing.
2. **Switch Dreamwatch calendar display to Pacific Time** — Dan lives in PT. Calendar currently shows ET. Need to change: `dreamwatch-calendar-store.ts` (getTodayET → getTodayPT), `streak-header.tsx` (same), and `dreamwatch_calendar_sync.py` (store dates as PT instead of ET). Upload scheduling stays at 5 PM ET. Started the change but reverted — saving for Sunday.

### Previous Sessions
- Session 5 (Feb 18): DNS cleanup, 62K customer discovery, Amazon PPC analysis, Strategy C, 30-day plan, financial corrections
- Session 4 (Feb 18): Financial excavation (149 statements, 11,069 txns), 7 analysis reports, Dan profile, 10 revenue opportunities, 2026 Action Plan
- Session 3 (Feb 17): Brain page built, DTC email recovery planned, all brain files updated
- Session 2 (Feb 17): Vercel deploy, Tango Dashboard, notes system, UNFI sub-project
- Session 1 (Feb 16-17): Schedule import, deadline tags, Goals dashboard, financial sidebar

### Key Discoveries
- **Balance is -$300** (not $45 — updated from Dan tonight)
- **11,472 email subs** out of 62K customers = massive untapped DTC potential
- **Shopify Email = "Messaging"** in Shopify admin. Has 6 active automations still running, 2 drafts, 4 failed (from when DNS was poisoned).
- **Amazon PPC works** but barely spending — bids likely too low to win impressions consistently
- **Dan is NOT a traditional developer** — ships via AI tools. Freelance positioning should be "AI-powered product builder" not "Node.js developer"
- **Madder single track not done until 2/22** — no DistroKid pre-upload, YouTube + socials release only
- **Dan's birthday is October 5** (NOT February 22)
- **Berlin Packaging owes $4,129** — Net 30, goal is pay at least half (~$2,064). Equal priority to rent.

### Previous Sessions
- Session 4 (Feb 18): Financial excavation (149 statements, 11,069 txns), 7 analysis reports, Dan profile, 10 revenue opportunities, 2026 Action Plan
- Session 3 (Feb 17): Brain page built, DTC email recovery planned, all brain files updated
- Session 2 (Feb 17): Vercel deploy, Tango Dashboard, notes system, UNFI sub-project
- Session 1 (Feb 16-17): Schedule import, deadline tags, Goals dashboard, financial sidebar

## The Real Financial Picture

| Metric | Value |
|--------|-------|
| **Monthly Revenue** | $6,900 (6-month avg from statements) |
| **Monthly Burn** | ~$10,500 |
| **Monthly Gap** | ~-$3,600 |
| **Total CC Debt** | $40,475 (7 cards, 25-29% APR) |
| **Monthly Interest** | $917 |
| **Bank Balance** | ~-$300 (as of Feb 18) |
| **Cuttable Subs** | ~$82/mo (Topaz $39, Illustrator $23, Fox One $20) — cancel TONIGHT |

### Critical Cash Flow (Next 30 Days)
| Date | In/Out | Amount | Source |
|------|--------|--------|--------|
| ~Feb 23 | 💰 IN | $3,422 | UNFI MOR |
| Feb 23 | 💸 OUT | -$1,100 | Foodies/Aria |
| Feb 23 | 💸 OUT | -$1,299 | Deep (ingredients) |
| Feb 28 | 💰 IN | $553 | Amazon payout |
| ~Feb 28 | 💸 OUT | -$2,064 | Berlin Packaging (half) |
| Mar 1 | 💸 OUT | -$2,878 | RENT |
| ~Mar 21 | 💰 IN | $3,400 | EXP invoice |
| ~April | 💰 IN | $3,480 | UNFI NE PO #1102034 |

## 30-Day Plan (Feb 18 – Mar 20, 2026)

### 🟡 Life Admin
- [ ] Cancel Topaz, Illustrator, Fox One (-$82/mo) — TONIGHT
- [ ] Call Capital One re: hardship program — THIS WEEK
- [ ] Build expenses/cash flow tracker (noted for later session)

### 🟠 Tango Amazon
- [ ] Pause SR-PHRASE-TEST + TT-AUTO-LOOSE — TONIGHT
- [ ] Check bids on 3 winning campaigns — TONIGHT
- [ ] Review coupon profitability — when Dan drops report

### 🟠 Tango DTC
- [ ] Start site redesign — TONIGHT
- [ ] Complete redesign — by Feb 21
- [ ] Redesign email templates — Feb 22-23
- [ ] Deliverability test (small batch) — Feb 24
- [ ] First campaign: Tier 1 inner circle (115 VIPs) — Feb 26

### 🟠 Tango Costco
- [ ] Call Moses — ~Feb 25
- [ ] Rework pitch deck — after call

### 🟠 Tango UNFI
- [ ] UNFI NE PO ships — pickup Mar 25
- [ ] Follow up John Lawson re: Mango NE — early March

### 🔵 Madder
- [ ] Finish single — by Feb 22
- [ ] YouTube + socials release — Feb 22
- [ ] Upload to DistroKid — after Feb 22
- [ ] EP drops — Mar 3

### 🟢 FFEEDD
- [ ] Final build — tomorrow (Feb 19)
- [ ] Submit to App Store — Feb 19-20
- [ ] Live + announce — ~Feb 22

### 🟣 Dream Beds
- [ ] Keep uploading 2-3x/week — ongoing

### 💼 Freelance / Consulting
- [ ] Create Upwork profile ("AI-powered product builds") — this week
- [ ] Create Toptal/Gun.io profile — next week
- [ ] Update LinkedIn — next week

## Active Projects

| Project | Weight | Status | Current Goal |
|---------|--------|--------|-------------|
| 🟠 Tango | 65% | Active | Site redesign + first DTC campaign + PPC optimization |
| 🟠 → Amazon | 25% | **ACTION** | Pause losers, check bids on winners (3.24x ROAS) |
| 🟠 → Costco | 15% | Waiting | Call Moses ~2/25 |
| 🟠 → UNFI | 25% | Active | New NE PO ($3,480), John Lawson follow-up |
| 🟠 → DTC | 5% | **SPRINT** | Site redesign tonight → email campaign by Feb 26 |
| 🟠 → Production | 10% | Active | Berlin bottles arriving, Foodies co-packs running |
| 🟢 FFEEDD | 15% | **1 DAY OUT** | Final build → App Store submit |
| 🔵 Madder | 5% | Active | Single drops 2/22, EP 3/3 |
| 🟣 Dream Beds | 5% | **IN SWING** | ~20 videos up, 173 views/28d, keep uploading |
| 💼 Freelance | NEW | **BUILD** | Upwork profile this week |
| 🍽️ PL8 | 10% | Updated | 30-day plan + financial data corrected |
| 🟡 Life Admin | — | **URGENT** | Cancel 3 subs, Cap One call, nail March rent |

## Key Contacts

| Name | Channel | Role | Status |
|------|---------|------|--------|
| Moses Romero | Costco | Asst Buyer, D13 | Call ~Feb 25 |
| John Lawson | UNFI/WF | Whole Foods buyer | Follow up early March |
| Brittney Langlois | UNFI | UpNext SDM | Monthly check-ins |
| Aria | Foodies | Production | Gets $1,100 from MOR (Feb 23) |

## System Architecture

- **JEFF app:** /Users/danfrieber/⚡ claudio/jeff/ (Next.js 16, Vercel)
- **JEFF live:** assistant-k5go.vercel.app (auto-deploys from GitHub main)
- **Tango Dashboard:** tangochilesauce.github.io/tango-dashboard/ (GitHub Pages)
- **Brain files:** /Users/danfrieber/⚡ claudio/jeff/brain/ → built to src/data/brain.ts on deploy
- **Financial data:** /Users/danfrieber/⚡ claudio/_/financial/ (scripts, parsed, analysis)
- **Supabase:** muowpjabnjkqgwgzfmoj.supabase.co
- **GitHub repos:** tangochilesauce/assistant (JEFF), tangochilesauce/tango-dashboard
