# Tango Chile Sauce — Brain

## Current Understanding

Tango is a premium hot sauce brand with 6 flavors: Sriracha, Mango, Truffle, Mild, Thai, Hot. Revenue comes through multiple channels — Amazon (direct), UNFI (distribution to Whole Foods, etc.), EXP Corp, and emerging channels (Costco, DTC, Faire, Mable).

The business is real and generating ~$6,900/mo but the goal is $50K/mo by Q2 2026. The gap is $43,100/mo.

Production happens at Foodies (co-packing) with ingredients from Deep. Packaging from Acorn (boxes) and labels. Shipping via Daylight.

**Channel vs Key Account distinction:** A "Channel" means you invoice them directly (Amazon, UNFI, Costco, EXP, Faire, Mable). A "Key Account" means they order through a distributor (e.g., Whole Foods orders via UNFI).

---

## Brand Identity

**Name**: Tango Chile Sauce, LLC
**Tagline**: Born in NYC, Made in LA
**Established**: April 29, 2013
**Federal EIN**: 46-2641462
**FDA Number**: 11095246958
**GS1 Account**: 30042269

## The Origin Story

When grandma first crafted her legendary chile in 1940s Honduras, she started with seven simple ingredients — most growing right outside her home. It started in her youth with a wild Scotch Bonnet plant that produced peppers every season.

It stayed small and honest at first — just family, neighbors, and friends. Then she started bottling it for the local market, where it took off. For a few bright years it lived out in the world, until she came to America and the recipe went quiet.

In 2015, she showed Dan her chile for the first time and it was over. He became obsessed. She showed him how to make it and he started making it naturally for himself, then for friends, then for stores, and Tango was born.

## Brand Voice

**Personality:** Approachable but premium. Health-conscious without being preachy. Bold, flavorful, fun.
**Tone:** Confident, not arrogant. Playful when appropriate. Honest about ingredients and process.
**Words We Use:** Clean, whole food, carrot-based, Keto-friendly, no sugar added, small batch, craft, artisan
**Words We Avoid:** Cheap, budget, discount, diet, low-cal, "Just like TRUFF"

## Key Messages

**Primary:** Truffle Tango delivers gourmet truffle flavor with clean, healthy ingredients — carrot-based, Keto-friendly, no sugar added.
**Elevator Pitch:** "Tango is the healthy truffle hot sauce. We use carrots instead of agave for natural sweetness, making us truly Keto-friendly. You get 8oz of gourmet truffle flavor at a better price than the big guys, and the NY Post named us one of the 14 best hot sauces."

## Key Selling Points

Carrot-Based, Vegan, No Preservatives, No Sugar, No Gums, Plant-Based, Organic Ingredients, 100% Clean Ingredients, Handmade in Small Batches in CA, Grandma's Recipe, Born in Brooklyn, Gluten-Free, American Made, Family-Owned, Good on Everything, 98%+ sell-through rate

## Competitor Positioning

| Competitor | Our Advantage |
|-----------|---------------|
| TRUFF | Keto-friendly (they use agave), better value $/oz |
| Melinda's | Premium quality, authentic Keto |
| Yellowbird | We lead with truffle premium |

## What We've Learned

- **Traffic is the bottleneck on Amazon**, not conversion — PPC barely running ($66/60d)
- **Truffle = 63% of Amazon revenue** — the star SKU
- **Mango mystery SOLVED**: 14.7% conversion is market-rate, not a problem
- **UNFI SoPac (LA) = WHERE THE GROWTH IS**: +516% YoY
- **UNFI Northeast = declining**: -9% YoY — needs Mango SKU expansion
- **Mango adds ~7 units/week net** at Whole Foods (34 new - 27 cannibalized)
- **Whole Foods sell-through**: SoPac (Hot 40%, Mango 33%, Mild 27%), NE (Hot 57%, Mild 43%)
- **Hot is the #1 seller** at Whole Foods across both regions
- **Klaviyo killed DTC email deliverability** — stale DNS records still haunting the domain
- **Shopify Email is the DTC play** — 10K free/mo, native, no branding

## COGS & Margins

| Flavor | COGS | UNFI Margin | Best Channel |
|--------|------|-------------|--------------|
| Sriracha | $2.74 | — | EXP 34%, Amazon 63% |
| Mango | $3.31 | **31%** | Best UNFI margin (high yield) |
| Truffle | $3.34 | — | EXP 60%, Amazon 70% |
| Mild | $3.37 | 30% | Amazon 55% |
| Thai | $3.42 | — | Amazon 54% |
| Hot | $3.49 | 28% | Amazon 53% |

## Production System

### Conversion Ratios
| Unit | Conversion |
|------|-----------|
| 1 drum (bote) | ~625 bottles |
| 1 case | 6 bottles |
| 1 cook shift (4hr) | 3 ollas |
| 1 pack shift (4hr) | 1,000 bottles |

### Batches per Olla
| Flavor | Batches/Olla |
|--------|-------------|
| Hot/Mild/Truffle | 4 |
| Mango | 2 (larger batch) |
| Sriracha | 2 or 3 |

### Process Flow
Ingredients → Batches → Ollas (cook) → Drums (cool 2 days) → Bottles (pack) → Cases

### Production Costs (Per Run)
| Item | Vendor | Cost |
|------|--------|------|
| Ingredients | Deep (My Orchard) | $1,300 |
| Co-pack | Foodies (Aria) | $1,100 |
| Boxes | Acorn | $804 |
| Labels | KSidrane (Zachary) | $695-$910 (see below) |
| Shipping | Daylight | $400 |
| **Total per run** | | **$5,104** |

### Label Pricing — KSidrane (Quote #23728, Feb 17 2026, valid 30 days)
**Contact:** Zachary Sidrane, ksidrane.com, (631) 393-6974
**Account #:** 1228
**Specs:** 4.6508" x 3" Special Shape Set, White BOPP + Matte Lamination, 4 Color Process, Permanent adhesive
**Payment:** Credit Card (50% deposit, balance on shipment), FOB Farmingdale NY

| Qty | Per 1,000 | Total |
|-----|-----------|-------|
| 1,000 | $490 | $490 |
| 2,000 | $268 | $536 |
| 5,000 | $139 | $695 |
| 10,000 | $91 | $910 |

**Note:** This quote is for **Mild labels only**. Sweet spot is 5K-10K range — nearly double labels for +$215. Quote expires ~March 19, 2026.

### Shift Costs
| Type | Hours | Cost |
|------|-------|------|
| COOK | 4 | $400 |
| PACK | 8 | $1,000 |

### Kitchen
Foodies Urban Kitchen, 8922 Norris Ave, Sun Valley

### Data Source
All production data lives in Supabase settings table (keys: `tango_production_*`). **Tango Dashboard is the single source of truth** — editable directly (packed counts, drum counts, status pills, ingredient inventory, bill plans, material status). Notion "Tango Production" page is **retired** as of Feb 17, 2026. Don't update it — update the dashboard instead.

## Channel Revenue Targets

| Channel | Target | Current | Gap | Weight |
|---------|--------|---------|-----|--------|
| Amazon | $10,000 | $3,500 | $6,500 | 25% |
| UNFI | $10,000 | $3,400 | $6,600 | 25% |
| Costco | $5,000 | $0 | $5,000 | 15% |
| DTC | $5,000 | $0 | $5,000 | 5% |
| **Total Tango** | **$30,000** | **$6,900** | **$23,100** | 65% |

## Key Contacts

| Name | Channel | Role | Status |
|------|---------|------|--------|
| Moses Romero | Costco | Asst Buyer, D13 Dry Grocery | ✅ Wants roadshows, call T-F |
| John Lawson | UNFI/WF | Whole Foods buyer | Emailed Jan 20, follow up needed |
| Lauren Martinez | Erewhon | Brand Management | Warm lead from 2022 |
| Brittney Langlois | UNFI | UpNext SDM | Monthly check-ins |

## Current Blockers

| Channel | Blocker | Impact |
|---------|---------|--------|
| Amazon | PPC barely running ($66/60d) | Traffic starved, $6,500 gap |
| UNFI NE | John Lawson response needed | Can't expand Mango into Northeast |
| UNFI | Endless Aisle paperwork incomplete | Online distribution blocked |
| DTC | Stale Klaviyo DNS records | Email deliverability broken |
| DTC | Email list dormant | Need to export, clean, warm up |

## Orders System (NEXT BUILD)

**Goal:** Full order lifecycle management on Tango Dashboard

### What We Need
1. **Supabase `orders` table** — id, channel, po_number, value, date, stage (new/processing/shipped/paid), doc paths (po_url, bol_url, inv_url), notes
2. **Migrate dashboard from localStorage → Supabase** — same pipeline UI, persistent data
3. **Drop zone for new POs** — drag PDF onto box, auto-scan/parse, create folder, create order card
4. **Document export links** — PO, BOL, Invoice buttons on each card link to actual files
5. **Existing folder:** `/Projects/🔥 tango/orders-invoices/` already has channel subfolders

### Architecture
- Order DATA → Supabase (stage, value, dates, doc URLs)
- Order FILES → Local folders (PDFs on machine, organized by channel/PO)
- Tango Dashboard reads from Supabase
- Drop zone: browser-side file handling → parse → create folder → insert row

## Goal

**This month:** Ship EXP pallet, fix Amazon PPC, close DTC sales
**12 months:** $30,000/mo across Amazon + UNFI + Costco + DTC

## Pipeline

### 📋 To Do
- [ ] Ship EXP pallet (Feb 28 pickup — pushed from Feb 19)
- [ ] Mon Feb 24: Cook (1 olla Hot + 1 olla Sriracha, 4hr)
- [ ] Thu Feb 27: Pack (4hr)
- [ ] Restart Amazon PPC
- [ ] Clean tangochilesauce.com DNS
- [ ] Export Klaviyo list → set up Shopify Email
- [ ] Follow up with Moses (Costco roadshows)
- [ ] Follow up with John Lawson (UNFI NE Mango)
- [ ] Complete Endless Aisle paperwork

### 🔨 In Progress
- [x] DTC email recovery plan designed

### ✅ Done
- [x] Production Brain on Tango Dashboard — editable, Supabase-backed (Feb 17)
- [x] Notion "Tango Production" page retired — dashboard is source of truth (Feb 17)
- [x] All production data synced Notion → Supabase (11 settings keys) (Feb 17)
- [x] Flavor Snapshot + Order Demand + Gap Analysis tables built (Feb 17)
- [x] DNS audit (Feb 17) — found stale Klaviyo SPF/DKIM
- [x] Tango Dashboard deployed (GitHub Pages)
- [x] Orders pipeline built (drag-and-drop kanban)

## Files

*Scanned Feb 16, 2026 from /Projects/🔥 tango/ (symlinked at /⚡ claudio/tango/)*

| Folder | Files | What's In There |
|--------|-------|-----------------|
| amazon/ | 1,776 | Listings, A+ content, flat files, FNSKU labels, PPC data |
| brand/ | 2,834 | Labels, logos, nutrition facts, UPCs, 2026 brand system |
| business/ | 421 | Legal, FDA, insurance, certificates, BOL, food safety |
| production/ | 1,201 | Kitchen photos, packaging suppliers, POs, billing |
| distribution/ | 563 | UNFI docs, Costco materials, Faire, old retailers |
| images/ | 2,882 | Product photography (new label, old label) |
| sales/ | 264 | Decks, data exports, one-sheets |
| marketing/ | 804 | Ads, collabs, events |
| media/ | 1,086 | Video, audio, press, Pixar intro, No More Clog |
| website/ | 1,847 | Old web builds, 2026-02-12 website data |
| tangofest/ | 1,586 | The big summer event |
| orders-invoices/ | 23 | By channel: Amazon, Costco, DTC, EXP, Faire, Mable, UNFI |
