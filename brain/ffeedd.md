# FFEEDD — Brain

**Target:** $5,000/month | **Current:** $0/month | **Gap:** $5,000/month
**Weight:** 15%

---

## My Current Understanding

FFEEDD is a minimalist iOS journal app with a retro terminal/CRT aesthetic. Green-on-black, JetBrainsMono font, blinking block cursor, double-newline to submit. Dark mode only. "Write like it's 1985."

**Status:** LAUNCHING. App is built. Monetization decided.

**Monetization (DECIDED Feb 14):** $10 upfront — premium positioning, exclusivity play. The Supreme model: the price IS the product. One cool girl has it → everyone wants it. Test at $10 for 30 days. If it doesn't move, drop to $1 as "80% off" which creates urgency + press hook. After 60 days → $1/month subscription via StoreKit.

- After Apple's 30% cut: **$7/download**
- 15 downloads = $105 (week 1 target)
- 72 downloads = $504 (month target)
- At $1/mo sub: need 5,000 subscribers for $5K/mo

**NO BLOCKER. SHIPPING.**

---

## Goals

| Timeframe | Goal |
|-----------|------|
| **This Month** | LAUNCH. Get on the App Store. First 15 paid downloads. |
| **12 Months** | $5K/month from subscriptions (~5,000 active subscribers) |

---

## Key Metrics

| Metric | Current | Target | Gap |
|--------|---------|--------|-----|
| Monthly Revenue | $0 | $5,000 | $5,000 |
| Downloads | 0 | 10,000 | +10,000 |
| Conversion rate | 0% | 5-10% | — |
| Paid subscribers | 0 | 5,000 | +5,000 |

### Post-Launch Targets

| Metric | Week 1 | Month 1 |
|--------|--------|---------|
| Downloads | 1,000 | 5,000 |
| DAU | 200 | 1,000 |
| Reviews | 25 | 100+ |
| Rating | 4.5+ | 4.5+ |

---

## Launch Checklist

### COMPOSE PAGE
- [ ] Checkbox line spacing (8pt between consecutive checkboxes)
- [ ] Long press checkbox insert (0.2s)
- [ ] Checkbox auto-continue on enter
- [ ] Empty checkbox deletion on enter
- [ ] Double-return to save
- [ ] Cursor positioning after checkbox insert

### FEED PAGE
- [ ] Checkbox toggle from feed (tap toggles [x]/[ ])
- [ ] Strikethrough on checked items
- [ ] Pin swipe (right swipe only, no double-slide)
- [ ] Entry expand/collapse animation (date slides down)
- [ ] Entry row tap vs checkbox tap priority

### SETTINGS PANEL
- [ ] Sidebar layout (fixed heights, no stretching)
- [ ] About content display
- [ ] Support/Privacy/Rate links
- [ ] Backup functionality
- [ ] Stats display
- [ ] Reset confirmation

### EDITOR PAGE
- [ ] Checkbox editing in existing entries
- [ ] Checkbox line spacing matching compose
- [ ] Back button dismiss
- [ ] Save on double-return

### APP-WIDE
- [ ] First-run warmup (no stutter)
- [ ] Splash screen timing
- [ ] Transitions smooth
- [ ] Haptics calibrated
- [ ] Memory/performance

### APP STORE SUBMISSION
- [ ] Apple Developer account active ($99/year)
- [ ] App icon (1024x1024)
- [ ] Screenshots (6.7", 6.5", 5.5" iPhone)
- [ ] App name: "FFEEDD"
- [ ] Subtitle (30 chars max)
- [ ] Description (4000 chars max)
- [ ] Keywords (100 chars max)
- [ ] Privacy Policy URL
- [ ] Support URL
- [ ] App category (Lifestyle primary, Productivity secondary)
- [ ] Age rating questionnaire
- [ ] StoreKit subscription setup ($1/month)
- [ ] In-app purchase review info
- [ ] Build uploaded via Xcode/Transporter
- [ ] Export compliance (encryption questionnaire)

---

## What We've Learned

### Confirmed
- **Core app works** — SwiftUI + SwiftData, terminal aesthetic is polished
- **UI concept is differentiated** — Most journal apps are soft/feminine. This is stark, focused, minimal.
- **The aesthetic resonates** — Terminal/retro computing has a niche but passionate audience
- **CaretlessTextView architecture** — Hide native caret via `tintColor = .clear`, NOT by overriding `caretRect()` (that breaks custom cursor positioning)
- **Checkbox format needs space inside** — `[ ] ` not `[] ` — cursor lands after the space for immediate typing
- **highPriorityGesture** — Use this in SwiftUI to make child taps override parent taps (checkbox vs entry expand)
- **Keyboard dismiss timing** — Must call `resignFirstResponder` BEFORE transition animation starts
- **Monetization DECIDED Feb 14, 2026** — $10 upfront launch (30-day test). Supreme pricing model — exclusivity IS the product. Can always drop to $1 but can never go up.
- **Day One pricing: $49.99/year** ($4.17/mo) — industry benchmark. Has free tier + premium (validates freemium). Annual only, no monthly.
- **2026 app pricing trend**: Subscriptions > one-time for retention + recurring revenue

### Pricing Evolution
1. Initially undecided (subscription vs one-time vs freemium)
2. Considered $4.99/mo or $29.99/year freemium
3. Decided $1 upfront + 60-day grace + $1/mo subscription
4. **Final (Feb 14):** $10 upfront (Supreme model), test 30 days, fallback to $1 "80% off"

---

## What We've Tried

| Date | Action | Result | Learning |
|------|--------|--------|----------|
| Jan 26, 2026 | Softer haptics (.soft, 0.5 intensity) | Feels better | Light haptics were too aggressive |
| Jan 26, 2026 | Doubled fade transitions (not tripled) | Better pacing | 0.6s compose, 0.6s edit, 1.0s feed, 2.0s splash |
| Jan 26, 2026 | Fixed cursor stuck top-left on edit | Works | CaretlessTextView can't override caretRect() to return .zero |
| Jan 26, 2026 | Added fade-to-black before opening posts | Smoother | 0.15s fade overlay before transition |
| Jan 26, 2026 | Fixed spam-enter race condition | No more duplicates | Added isSaving flag guard |
| Jan 26, 2026 | Rebuilt compose screen (CaretlessTextView) | Clean architecture | Unified with editor, removed 400pt inset hack |
| Jan 26, 2026 | Minimal ComposeActionBar (just cancel) | Cleaner UI | Matches editor's back button style |
| Jan 26, 2026 | Long press (0.2s) inserts checkbox | Works great | Inserts on new line with `[ ] ` format |
| Jan 26, 2026 | Checkbox auto-continue on enter | Works | Enter after checkbox line creates new checkbox |
| Jan 26, 2026 | Empty checkbox deletion on enter | Works | Removes empty checkbox, allows double-return to save |
| Jan 26, 2026 | Checkbox toggle from feed | Works | Tap checkbox area toggles, strikethrough on checked |

---

## Product Details

**Core Concept:**
- Green-on-black terminal style
- JetBrainsMono font
- Blinking block cursor as primary UI affordance
- Double-newline to submit entries (like a terminal)
- Dark mode only
- **To-do list support:** Long press inserts checkbox, enter auto-continues, tap in feed to toggle

**Tech Stack:** SwiftUI + SwiftData, UIKit integration for text input

**Architecture:**
- **CaretlessTextView** (shared) — custom UITextView with hidden caret via `tintColor = .clear`
- Block cursor via UILabel positioned at caretRect()
- ComposeActionBar / EditorActionBar — minimal action bars
- **highPriorityGesture** — SwiftUI child taps override parent taps
- **Keyboard dismiss** — `resignFirstResponder` BEFORE transition animation

**Potential Pro Features (post-launch):**
- Unlimited entries (free tier: X entries/month?)
- Export (markdown, txt)
- iCloud sync
- Additional themes (amber, blue, white-on-black)
- Widgets
- Streaks/statistics

---

## App Store Optimization

**Keywords (100 chars):**
```
journal,diary,retro,terminal,minimalist,dark mode,CRT,vintage,aesthetic,writing,notes,hacker,green
```

**Category:** Lifestyle (Primary), Productivity (Secondary)

**App Store Description:**
```
Write like it's 1985.

FFEEDD is a journaling app for people who love the glow of a CRT monitor
and the simplicity of a blinking cursor. No distractions. No cloud sync.
No social features. Just you, your thoughts, and a terminal.

Start writing. The cursor is waiting.
```

**Screenshot Frame Captions:**
1. "Write like it's 1985"
2. "Just you and the cursor"
3. "Color code your thoughts"
4. "Zero distractions"

**Visual Assets Needed:**
- App Icon (1024x1024)
- Screenshots (iPhone 6.7", 6.5", 5.5") — 4-8 per size
- App Preview Video (15-30 seconds)

---

## Launch Plan

### Pre-Launch: Beta Testing via TestFlight
**Goal:** 50-100 beta testers before launch
**Where to recruit:**
- r/journaling, r/TestFlight, r/retrobattlestations
- Twitter with #buildinpublic

### Launch Day Checklist
- [ ] Verify app is live on App Store
- [ ] Post to Product Hunt (12:01 AM PT)
- [ ] Show HN post on Hacker News
- [ ] Tweet announcement on all platforms
- [ ] Email beta testers: "We're live! Please leave a review"

### Reddit Posts (space out):
- r/apple — "I built a retro terminal journal app"
- r/iOSProgramming — "Just launched my first indie app"
- r/journaling — "Made a minimalist digital journal"
- r/retrobattlestations — "Journal app inspired by the terminals we love"

### Core Launch Message:
```
FFEEDD is live.

A journal app that looks like a 1985 terminal.
No cloud. No account. No distractions.
Just you, your thoughts, and a blinking cursor.

Download on iOS: [link]
```

### Key Success Factors
1. **Nail the aesthetic** in all marketing
2. **Target the niche** — Retro enthusiasts > general population
3. **Build in public** — Share the journey
4. **Reviews early** — 25+ reviews in first 48 hours
5. **Respond to everything** — Early users become evangelists

---

## Growth Plan

### The Funnel Math (to $5K MRR at $1/mo)

| Stage | Metric | Number Needed |
|-------|--------|---------------|
| **Paying subscribers** | Target | 5,000 |
| **Free users** | @ 5% conversion | 100,000 |
| **Downloads** | @ 50% activation | 200,000 |
| **App Store views** | @ 30% download rate | 670,000 |

**Key insight:** Conversion rate is the highest-leverage variable. 5% → 10% cuts required downloads in half.

### Paywall Strategy (Feature-Gated)

**Free tier:**
- 10 entries/month
- 1 color (green only)
- Basic functionality

**$1/month Premium:**
- Unlimited entries
- All 6 colors
- Future features (themes, export, widgets, sync)

### Growth Levers (Ranked)

1. **ASO** — 65-70% of app discovery is App Store search. Free traffic. Expected: 500-2,000 organic downloads/month.
2. **Viral/Referral** — "Give a friend 1 month free / Get 1 month free." Share entry as image with FFEEDD branding. Expected: 0.2-0.5 viral coefficient.
3. **Content Marketing** — Blog on ffeedd.us (SEO). Reddit (r/journaling = 1.4M members). TikTok (aesthetic content).
4. **Paid Acquisition** — With $1/mo LTV of ~$6, need CAC under $2. Very difficult. Use sparingly.

### Retention (Everything at $1/mo)

| Monthly Churn | Users After 12 Months (per 1K starting) |
|---------------|----------------------------------------|
| 10% | 282 |
| 5% | 540 |
| 3% | 694 |
| 2% | 785 |

**Retention tactics:**
1. Onboarding: First 7 days determine everything
2. Notifications: "The cursor is waiting" (on-brand)
3. Streaks: Don't break the chain psychology
4. Regular updates: New themes quarterly

### Phased Growth

| Phase | Months | Goal | Success Metric |
|-------|--------|------|----------------|
| Foundation | 1-2 | Launch with subscription | 500 downloads |
| Validate | 3-4 | Prove unit economics | 500 subscribers, 5%+ conversion |
| Scale | 5-8 | Reach 2,500 subscribers | Sustainable growth rate |
| Optimize | 9-12 | Hit $5K MRR | 5,000 subscribers |

### What to Build First (Before Launch)

**P0 (Must Have):**
1. StoreKit 2 integration
2. Paywall screen
3. Entitlement checking
4. Restore purchases
5. Free tier limits

**P1 (Should Have):**
1. Onboarding flow
2. Analytics
3. Push notifications
4. Settings screen

---

## Marketing Ideas

- **Product Hunt** — Terminal aesthetic will stand out
- **r/terminal, r/unixporn, r/mechanicalkeyboards** — The aesthetic audience
- **Developer Twitter** — Developers love terminal aesthetics
- **TikTok** — ASMR-ish typing videos with the green cursor
- **Hacker News** — If framed as a thoughtful, minimal tool
- **Influencer Outreach:** Retro tech YouTubers (LGR, Techmoan, 8-Bit Guy), Productivity YouTubers (Ali Abdaal, Thomas Frank), iOS reviewers (Christopher Lawley), Journaling influencers

---

## Brand / Messaging

- **Core tagline:** "Write like it's 1985" / "Quiet personal thoughts"
- **Positioning:** Private journaling, no social features, no sharing, no followers. Just you and your thoughts.
- **Tone:** Calm, understated, intimate. The anti-social-media journal.
- **Domain:** ffeedd.us (GoDaddy — dan@frieber.com)

---

## Open Questions

- ~~Subscription vs. one-time vs. freemium?~~ **DECIDED: $10 upfront (30-day test) → $1/mo sub after 60 days**
- What's the launch strategy — soft launch or Product Hunt splash?
- Who's the target user? Developers? Writers? ADHD folks who need simple?
- Post-60-day features: what's free vs paid?

---

## Blockers

**NONE. Launching.**

| What | Status |
|------|--------|
| ~~Payment flow~~ | ✅ $10 upfront, no StoreKit needed for launch |
| ~~App Store copy~~ | ✅ Pricing decided |
| ~~Marketing~~ | ✅ Unblocked after launch |
| StoreKit subscription build | 🚧 Build during 60-day window post-launch |

---

## Intel (Time-Sensitive)

| Date | Finding | Source | Expires |
|------|---------|--------|---------|
| Feb 14, 2026 | Monetization DECIDED: $10 upfront (Supreme model). Test 30 days, can drop to $1 "80% off" | Dan | Ongoing |
| Jan 22, 2026 | Day One pricing: $49.99/year ($4.17/mo) — industry benchmark | Day One | Ongoing |
| Jan 22, 2026 | Day One has free tier + premium (unlimited journals, cloud sync, photos, cross-device) | Day One | Feature comparison |
| Jan 22, 2026 | Day One = annual only, no monthly plans | Day One | Pricing decision |
| Jan 22, 2026 | 2026 app pricing trend: subscriptions > one-time for retention | FunnelFox | Ongoing |

---

## Pipeline

### 📋 To Do
- [ ] Finish launch checklist items (compose, feed, settings, editor, app-wide)
- [ ] App Store submission (screenshots, copy, build upload)
- [ ] Reddit marketing blitz — authentic posts in journaling/productivity subs
- [ ] TikTok screen recording — ASMR typing with the green cursor
- [ ] Product Hunt launch prep
- [ ] Week 1 metrics check — downloads, retention, reviews

### 🔨 In Progress
- [ ] App Store listing optimization (keywords, description, screenshots)

### ✅ Done
- [x] App built and ready (SwiftUI + SwiftData)
- [x] Terminal aesthetic polished
- [x] Monetization decided ($10 upfront, Supreme model)
- [x] Brand positioning locked
- [x] Checkbox/to-do system working
- [x] Haptics calibrated
- [x] Fade transitions tuned
- [x] CaretlessTextView architecture unified

---

## Files

*App code: /Users/danfrieber/⚡ claudio/ffeedd/*
*FFEEDD-specific instructions: /Users/danfrieber/⚡ claudio/ffeedd/CLAUDE.md*

---

*Migrated from Notion (FFEEDD parent + Project Brain + Launch Plan + Growth Plan) — Feb 18, 2026*
