# Tango DTC — Brain

## Current Understanding

Direct-to-consumer sales are currently $0 but the infrastructure is WAY bigger than we thought. DNS is now clean (Feb 19), Klaviyo lists are exported and segmented, and Shopify Email is the platform.

**The Big Discovery (Feb 19):** Shopify has **62,007 customers** (3,806 orders) and **11,472 are email-subscribed** (18.5% of total). Klaviyo only had ~4,900 contacts — just 8% of the real database. The Shopify customer database IS the email goldmine, and Shopify Email has native access to all 11,472 subscribers natively. No CSV import needed for the main list.

**The Email Situation:** Klaviyo was cancelled months ago due to poor deliverability + cost. DNS was poisoned with stale Klaviyo records until Feb 19 when Dan cleaned them all. Klaviyo lists were exported as CSV before the account potentially disappears. Shopify Email (10K free/mo, native integration) is the go-to platform.

**Domain:** tangochilesauce.com. Email handled by IONOS. DNS is now CLEAN. Shopify store exists with 62K customers.

**Strategy:** Warm up with Klaviyo-sourced Tier 1 VIPs (115 contacts) → expand to Tier 2 (987) → then unlock all 11,472 Shopify subscribers via native segments. 10K free Shopify Emails/mo covers the entire subscribed list in one send.

## What We've Learned

- Klaviyo deliverability was destroyed — domain had stale Klaviyo DNS records left behind
- **DNS audit (Feb 17):** DMARC is solid (p=quarantine, 100%, reports to postmaster@). SPF had stale Klaviyo + SendGrid includes. DKIM had two stale Klaviyo signing keys still live. MX records clean (IONOS).
- **DNS CLEANED (Feb 19):** Dan removed all stale records from IONOS panel:
  - Removed `include:klaviyo-mail.com` from SPF
  - Removed `include:sendgrid.net` from SPF (Klaviyo's SendGrid, NOT Shopify's)
  - Deleted `kl._domainkey` CNAME (Klaviyo DKIM)
  - Deleted `kl2._domainkey` CNAME (Klaviyo DKIM)
  - Deleted `email` CNAME (pointed to Klaviyo SendGrid u161779)
  - Deleted `pm-bounces` CNAME (pointed to Postmark pm.mtasv.net)
  - Clean SPF is now: `v=spf1 include:_spf.perfora.net include:_spf.kundenserver.de ~all`
  - Shopify's own SendGrid DKIM records (u36844960) kept — they authenticate Shopify Email
- **Klaviyo list analysis (Feb 19):** Exported 3 CSVs from Klaviyo:
  - File 1: 43 website signups — 88% open rate, 63% click rate, 56% buyers. THE GOLD.
  - File 2: 11 SMS subscribers — tiny, includes Dan's email
  - File 3: 4,845 legacy Shopify import — 72% never opened, 2,415 buyers, $78K total CLV
  - Total unique: 4,881 contacts
- **Segmentation results (Feb 19):**
  - Tier 1 "Inner Circle": 115 contacts (website signups + 3-order repeat buyers who open)
  - Tier 2 "Warm List": 987 contacts (subscribed + opened + accepts marketing)
  - Tier 3 "Long Shots": 1,346 contacts (buyers who went dark)
  - Dead List: 1,736 (never opened, never bought)
  - Removed (spam/unsub/fake): 697
  - Total sendable from Klaviyo: 2,448
- **SHOPIFY HAS 62K CUSTOMERS (Feb 19):** Klaviyo only had 8% of the real database. Shopify's 62,007 customers (3,806 orders) are accessible natively through Shopify Email — no import needed.
- **11,472 EMAIL SUBSCRIBERS (Feb 19):** 18.5% of 62K customers are email-subscribed in Shopify. This is the real sendable list — 4.7x bigger than the entire Klaviyo export. Shopify Email can send to this native segment directly.
- **Shopify Email is the play** — 10K free emails/mo, no branding, native Shopify integration, native access to 62K customer database, zero extra cost
- Email list is dormant — needs tiered re-engagement, NOT a blast to everyone
- First email should NOT be a sale — "we're back" personal note to generate positive signals
- Re-engagement math (revised with 62K): even 15% email-subscribed = ~9,300 sendable

## What We've Tried

- Klaviyo for email marketing — cancelled due to poor deliverability + high cost (date unknown, months ago)
- Updated domain DNS settings when Klaviyo was cancelled — but left stale Klaviyo records behind
- **DNS cleanup (Feb 19)** — removed all 6 stale records. DNS is now clean.
- **Klaviyo list export (Feb 19)** — rescued all data as 3 CSVs before account potentially closes
- **List segmentation (Feb 19)** — built automated script, segmented into 4 tiers + removed list

## Open Questions

- ~~What domain is sending from?~~ **ANSWERED: tangochilesauce.com, IONOS mail**
- ~~What's the current SPF/DKIM/DMARC status?~~ **ANSWERED: DNS CLEANED Feb 19**
- ~~Is the Shopify store set up?~~ **ANSWERED: Yes, 62,007 customers, 3,806 orders**
- ~~What email platform to use?~~ **ANSWERED: Shopify Email (10K free, native, no branding)**
- ~~What's the current email list size?~~ **ANSWERED: Klaviyo had ~4,900. Shopify has 62,007 customers.**
- ~~Can Dan still log into Klaviyo to export the list?~~ **ANSWERED: YES — exported 3 CSVs Feb 19**
- ~~How many of the 62K Shopify customers are email-subscribed?~~ **ANSWERED: 11,472 (18.5%)**
- Is anyone monitoring postmaster@tangochilesauce.com for DMARC reports?
- DTC pricing strategy — same as Amazon? Higher? Bundle deals?
- Social media following / other traffic sources to pair with email?

## Short-Term Goal

**This month (Feb 2026):** Send first warmup email to Tier 1 VIPs → expand to Tier 2 → set up Shopify Email native segments for the full 62K database → drive first DTC sales

## Long-Term Goal

**12 months:** $5,000/mo DTC revenue stream

## Pipeline

### 📋 To Do
- [ ] **Check Shopify email subscriber count** — Customers → Segments → "Subscribed to email marketing" to see how many of 62K are opted in
- [ ] **Run domain health checks** — MXToolbox.com blacklist check, Sender Score, Google Postmaster Tools
- [ ] **Verify Tier 1 emails** — run 115 contacts through NeverBounce/ZeroBounce free tier
- [ ] **Set up Shopify Email** — Marketing section in Shopify admin, verify Shopify SPF/DKIM in DNS (should already be there — u36844960 records)
- [ ] **Import Tier 1 CSV** — 115 VIPs into Shopify (or tag them if they're already in the 62K)
- [ ] **Draft Email 1** — "We're Back" personal note from Dan, no sale
- [ ] **Send Tier 1** — monitor opens/bounces/complaints for 24hr
- [ ] **Send Tier 2** — if Tier 1 clean (987 contacts)
- [ ] **Build native Shopify segments** — email_subscription_status = subscribed + number_of_orders >= 1
- [ ] **Draft Email 2** — value content (recipe, brand story, behind the scenes)
- [ ] **Draft Email 3** — THE OFFER (discount code / bundle / free shipping)
- [ ] **Draft Email 4** — "Last chance" urgency
- [ ] Redesign Tango website/Shopify store for DTC sales
- [ ] Set up DTC pricing / promotions / bundles

### 🔨 In Progress
(none — ready for next action)

### ✅ Done
- [x] Domain DNS audit (Feb 17) — identified stale SPF includes + DKIM keys
- [x] **DNS CLEANED (Feb 19)** — all 6 stale records removed, SPF clean, DKIM clean
- [x] Platform research — Shopify Email selected (10K free, native, no branding)
- [x] Re-engagement strategy designed — 4-email tiered warmup over 14 days
- [x] **Klaviyo list exported (Feb 19)** — 3 CSVs rescued (43 + 11 + 4,845 contacts)
- [x] **List analysis (Feb 19)** — full engagement/purchase/CLV analysis of all contacts
- [x] **Segmentation complete (Feb 19)** — Tier 1 (115), Tier 2 (987), Tier 3 (1,346), Dead (1,736), Removed (697)
- [x] **62K customer database discovered (Feb 19)** — Shopify has 12.5x more contacts than Klaviyo

## Intel (Time-Sensitive)

**Shopify Customer Database (Feb 19, 2026):**
| Metric | Value |
|--------|-------|
| Total Shopify customers | 62,007 |
| **Email subscribers** | **11,472 (18.5%)** |
| Total orders | 3,806 |
| Klaviyo contacts | 4,881 (8% of Shopify) |
| Klaviyo sendable | 2,448 |
| Shopify-only subscribers | ~6,500+ (not in Klaviyo at all) |

**Klaviyo Segment Breakdown (Feb 19, 2026):**
| Segment | Count | Quality |
|---------|-------|---------|
| Tier 1 Inner Circle | 115 | Website signups + 3x buyers who open |
| Tier 2 Warm List | 987 | Subscribed + opened + accepts marketing |
| Tier 3 Long Shots | 1,346 | Buyers who went dark |
| Dead List | 1,736 | Never opened, never bought |
| Removed | 697 | Spam, unsub, fake, Dan's own |
| **Total sendable** | **2,448** | |

**Email Platform Free Tiers (Feb 2026):**
| Platform | Free Emails/mo | Free Contacts | Branding? | Winner? |
|----------|---------------|--------------|-----------|---------|
| Shopify Email | 10,000 | Unlimited | No watermark | YES |
| MailerLite | 12,000 | 500 | Yes | Too small |
| Brevo | ~9,000 (300/day) | 100,000 | Yes | Backup option |
| Mailchimp | 500 | 250 | Yes | Avoid |
| Klaviyo Free | 500 | 250 | Yes | Too small |

**Re-Engagement Timeline:**
- Email 1 (Day 1-3): "We're back" — personal, no sale (Tier 1 first, then Tier 2)
- Email 2 (Day 6-7): Value content — recipe/story
- Email 3 (Day 10): THE OFFER — discount/bundle
- Email 4 (Day 12-14): "Last chance" urgency

**Revised Revenue Projections (CONFIRMED — 11,472 subscribers):**
| Scenario | Sendable | Re-engage (15%) | Convert (5%) | Revenue |
|----------|----------|-----------------|--------------|---------|
| Klaviyo only | 2,448 | 367 | 18 | ~$270 (@$15) |
| **Full Shopify subscribers** | **11,472** | **1,720** | **86** | **~$1,290 (@$15)** |
| With bundle pricing | 11,472 | 1,720 | 86 | **~$2,150 (@$25)** |
| 4-email sequence total | 11,472 | — | — | **~$2,000-3,000** |

## Files

**Segment CSVs (built Feb 19):**
- `/Users/danfrieber/⚡ claudio/_ plate drop/segments/tier-1-inner-circle.csv` (115 contacts)
- `/Users/danfrieber/⚡ claudio/_ plate drop/segments/tier-2-warm-list.csv` (987 contacts)
- `/Users/danfrieber/⚡ claudio/_ plate drop/segments/tier-3-long-shots.csv` (1,346 contacts)
- `/Users/danfrieber/⚡ claudio/_ plate drop/segments/dead-list-do-not-send.csv` (1,736 contacts)
- `/Users/danfrieber/⚡ claudio/_ plate drop/segments/removed-spam-unsub.csv` (697 contacts)

**Source Exports (Klaviyo, Feb 19):**
- `/Users/danfrieber/⚡ claudio/_ plate drop/List Export 2026-02-19.csv` (43 — website signups)
- `/Users/danfrieber/⚡ claudio/_ plate drop/List Export 2026-02-19 (1).csv` (11 — SMS)
- `/Users/danfrieber/⚡ claudio/_ plate drop/List Export 2026-02-19 (2).csv` (4,845 — legacy import)

**Scripts:**
- `/Users/danfrieber/⚡ claudio/_ plate drop/build-segments.mjs` — segmentation script

**Shopify store:** [need URL]
