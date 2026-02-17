# Tango DTC — Brain

## Current Understanding

Direct-to-consumer sales are currently $0. This is an untapped channel with real potential — we have an email list in Klaviyo, a Shopify store, and a domain that just need to be cleaned up and activated.

**The Email Situation:** Dan previously used Klaviyo for email marketing, but deliverability tanked badly — most subscribers weren't seeing emails. Cancelled Klaviyo due to cost vs poor open rates. DNS was updated at that time but hasn't been checked in months. List is still in Klaviyo (account may be downgraded, not closed — need to verify).

**Domain:** tangochilesauce.com. Email handled by IONOS. Shopify store exists.

**14-Day Sprint Plan (Feb 14-28):** Clean DNS → export list → warm up with Shopify Email → drive first DTC sales.

## What We've Learned

- Klaviyo deliverability was destroyed — domain had stale Klaviyo DNS records left behind
- **DNS audit (Feb 17, 2026):** DMARC is solid (p=quarantine, 100%, reports to postmaster@). SPF has STALE Klaviyo + SendGrid includes. DKIM has two stale Klaviyo signing keys still live. MX records are clean (IONOS).
- Domain DNS was "updated" when Klaviyo cancelled but Klaviyo ghosts were left in — `include:klaviyo-mail.com` and `include:sendgrid.net` still in SPF, `kl._domainkey` and `kl2._domainkey` DKIM records still active
- Email list is dormant — needs tiered re-engagement, NOT a blast to everyone
- **Shopify Email is the play** — 10K free emails/mo, no branding, native Shopify integration, zero extra cost. Beats MailerLite (500 contact cap), Brevo (300/day limit), Mailchimp (250 contacts lol)
- Klaviyo data retention: if account was downgraded (not fully closed), all data is still there. If fully closed, data is permanently deleted
- Re-engagement math: expect 5-15% of dormant list to re-engage, 1-2% conversion on openers
- First email should NOT be a sale — "we're back" personal note to generate positive signals

## What We've Tried

- Klaviyo for email marketing — cancelled due to poor deliverability + high cost (date unknown, months ago)
- Updated domain DNS settings when Klaviyo was cancelled — but left stale Klaviyo records behind

## Open Questions

- ~~What domain is sending from?~~ **ANSWERED: tangochilesauce.com, IONOS mail**
- ~~What's the current SPF/DKIM/DMARC status?~~ **ANSWERED: DMARC good, SPF/DKIM have stale Klaviyo refs**
- ~~Is the Shopify store set up?~~ **ANSWERED: Yes, exists**
- ~~What email platform to use?~~ **ANSWERED: Shopify Email (10K free, native, no branding)**
- What's the current email list size? How old is it? When was the last send?
- Can Dan still log into Klaviyo to export the list?
- Is anyone monitoring postmaster@tangochilesauce.com for DMARC reports?
- DTC pricing strategy — same as Amazon? Higher? Bundle deals?
- Social media following / other traffic sources to pair with email?

## Short-Term Goal

**This month (Feb 2026):** Clean DNS → export list from Klaviyo → warm up via Shopify Email → drive first direct sales

## Long-Term Goal

**12 months:** $5,000/mo DTC revenue stream

## Pipeline

### 📋 To Do
- [ ] **Log into Klaviyo** — export full subscriber list as CSV (if account still accessible)
- [ ] **Clean DNS in IONOS** — remove klaviyo-mail.com from SPF, remove sendgrid.net from SPF, delete kl._domainkey CNAME, delete kl2._domainkey CNAME
- [ ] **Run domain health checks** — MXToolbox.com blacklist check, Sender Score, Google Postmaster Tools
- [ ] **Verify exported list** — run through NeverBounce/ZeroBounce free tier, kill dead emails
- [ ] **Set up Shopify Email** — Marketing section in Shopify admin, add Shopify SPF/DKIM to DNS
- [ ] **Segment list into tiers** — Tier 1 (50-100 known/recent), Tier 2 (100-200 moderate), Tier 3 (rest)
- [ ] **Draft Email 1** — "We're Back" personal note from Dan, no sale
- [ ] **Send Tier 1** — monitor opens/bounces/complaints for 24hr
- [ ] **Send Tier 2** — if Tier 1 clean
- [ ] **Send Tier 3** — if Tier 2 clean
- [ ] **Draft Email 2** — value content (recipe, brand story, behind the scenes)
- [ ] **Draft Email 3** — THE OFFER (discount code / bundle / free shipping)
- [ ] **Draft Email 4** — "Last chance" urgency
- [ ] Redesign Tango website/Shopify store for DTC sales
- [ ] Set up DTC pricing / promotions / bundles

### 🔨 In Progress
- [x] DNS audit — completed Feb 17, found stale Klaviyo records

### ✅ Done
- [x] Domain DNS audit (Feb 17) — identified stale SPF includes + DKIM keys
- [x] Platform research — Shopify Email selected (10K free, native, no branding)
- [x] Re-engagement strategy designed — 4-email tiered warmup over 14 days

## Intel (Time-Sensitive)

**Email Platform Free Tiers (Feb 2026):**
| Platform | Free Emails/mo | Free Contacts | Branding? | Winner? |
|----------|---------------|--------------|-----------|---------|
| Shopify Email | 10,000 | Unlimited | No watermark | ✅ YES |
| MailerLite | 12,000 | 500 | Yes | Too small |
| Brevo | ~9,000 (300/day) | 100,000 | Yes | Backup option |
| Mailchimp | 500 | 250 | Yes | Avoid |
| Klaviyo Free | 500 | 250 | Yes | Too small |

**DNS Records to Clean (IONOS panel):**
| Action | Record | What to Remove |
|--------|--------|---------------|
| Remove from SPF | TXT @ | `include:klaviyo-mail.com` |
| Remove from SPF | TXT @ | `include:sendgrid.net` (if no active SendGrid use) |
| Delete DKIM | CNAME kl._domainkey | Points to kl.domainkey.u161779.wl030.sendgrid.net |
| Delete DKIM | CNAME kl2._domainkey | Points to kl2.domainkey.u161779.wl030.sendgrid.net |

**Re-Engagement Timeline:**
- Email 1 (Day 3): "We're back" — personal, no sale
- Email 2 (Day 6-7): Value content — recipe/story
- Email 3 (Day 10): THE OFFER — discount/bundle
- Email 4 (Day 12-14): "Last chance" urgency

**Expected Results (1,000 person list):**
- ~150 re-engage (15%)
- ~10 buy (7% of engaged)
- ~$250 revenue from sprint
- Real value: clean engaged list for long-term DTC channel

## Files

*Shopify store: [need URL]*
*Klaviyo account: [need to check if accessible]*
*Located at: /Projects/🔥 tango/website/ (if exists)*
