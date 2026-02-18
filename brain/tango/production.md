# Tango Production — Brain

**NOTE:** Live production data (inventory, orders, demand) lives on the **Tango Dashboard** (Supabase-backed). This brain file is the strategy/reference layer. Dashboard is the operational layer.

---

## My Current Understanding

Production runs through Foodies Urban Kitchen (co-packing with Aria) using ingredients from Deep (My Orchard). Process: Ingredients → Batches → Ollas (cook) → Drums (cool 2 days) → Bottles (pack) → Cases.

**Current situation (Feb 17):** EXP pallet in progress (pickup Thu Feb 19, ~$3,400). UNFI MOR done (pays ~Feb 23). UNFI HVA done (pickup Feb 25). Cash is tight ($45 balance), but UNFI MOR payment on Feb 23 unlocks the pipeline.

---

## Process Flow

```
Ingredients → Batches → Ollas (cook) → Drums (cool 2 days) → Bottles (pack) → Cases
```

## Conversion Ratios

| Unit | Conversion |
|------|-----------|
| 1 drum | ~625 bottles |
| 1 case | 6 bottles |
| 1 cook shift (4hr) | 3 ollas |
| 1 pack shift (4hr) | 1,000 bottles |
| 1 day max capacity | ~1,200 bottles |

## Batches per Olla

| Flavor | Batches/Olla |
|--------|-------------|
| Hot/Mild/Truffle | 4 |
| Mango | 2 (larger batch) |
| Sriracha | 2 or 3 |

## Kitchen Operations Detail

**Cooking setup:** 9 batches cook simultaneously — 3 batches per pot, on 3 burners total.
- 1 nine-batch run takes ~3 hours
- 18 batches = 3 drums = 1 full day of saucing (9 before lunch + 9 after)
- 1 drum = 6 batches
- Vinegar: 3 gallons per batch (for 3 batches = 9 gallons, so 5-gal bucket + 4-gal bucket)

**Truffle process (2-day):** Cook WITHOUT infusing (day 1) → cool → infuse and pack (day 2). This is why truffle runs take two shifts.

**Thai:** 40 lb Thai chilies per bote (6 batches)

**Mango:** 100 lb mango per olla (2 batches per olla), mango comes in 30 lb cases

**Sriracha scaling ratios (from R&D):**
| Batch Size | Jalapeno | Garlic | Water | Vinegar | Sugar | Salt |
|-----------|----------|--------|-------|---------|-------|------|
| 1x (home) | 0.5 lb | 0.18 lb | — | 0.22 lb | 0.08 lb | 0.08 lb |
| 20 lb | 20 lb | 6.4 lb | — | 8.8 lb | 3.2 lb | 4.4 lb |
| 25 lb (production) | 25 lb | 13 lb | 10 lb | 11 lb | 4 lb | 3 lb |
| 50 lb | 50 lb | 16 lb | — | 22 lb | 8 lb | 11 lb |

**Sriracha process:** Blend everything → low heat → boil that can't be stirred down → re-blend → strain. (Fermenting was tested and abandoned: "Fermenting is ass")

---

## COGS Per Bottle (Fully Loaded)

| Component | Hot | Mild | Thai | Mango | Truffle | Sriracha |
|-----------|-----|------|------|-------|---------|----------|
| Ingredients | $2.12 | $2.00 | $2.05 | $1.94 | $1.97 | $1.37 |
| Packaging | $0.87 | $0.87 | $0.87 | $0.87 | $0.87 | $0.87 |
| Pack labor | $0.50 | $0.50 | $0.50 | $0.50 | $0.50 | $0.50 |
| **TOTAL** | **$3.49** | **$3.37** | **$3.42** | **$3.31** | **$3.34** | **$2.74** |

*Packaging = bottle ($0.28) + cap ($0.025) + seal ($0.02) + label ($0.373) + box (~$0.167)*

## Margin by Channel

| Flavor | COGS | UNFI ($4.83) | EXP ($4.17) | Amazon (~$7.50) |
|--------|------|-------------|-------------|-----------------|
| Sriracha | $2.74 | — | 34% | ~63% |
| Mango | $3.31 | **31%** | 21% | ~56% |
| Truffle | $3.34 | — | 60% | ~70% |
| Mild | $3.37 | 30% | 19% | ~55% |
| Thai | $3.42 | — | 18% | ~54% |
| Hot | $3.49 | 28% | 16% | ~53% |

---

## Current Orders

### 1. EXP Corp (PO #12165) — NYC Bodegas
**Status:** IN PROGRESS | **Pickup:** Thu Feb 19 (Daylight ~$400, net 7) | **Value:** ~$3,400

| Product | Cases | Bottles | Status |
|---------|-------|---------|--------|
| Hot | 50 | 300 | Loose — box up Mon |
| Mild | 30 | 180 | Wrong caps — swap Sun, box Mon |
| Mango | 30 | 180 | Hand-fill Wed at Foodies |
| Truffle | 10 | 60 | Hand-fill Wed at Foodies |
| Sriracha | **8** (was 20) | 48 | Have loose — box Mon |

### 2. UNFI Moreno Valley (PO #044849783)
**Pickup:** Feb 9, 2026 | **Value:** $3,422 | **Status:** DONE — pays ~Feb 23

### 3. UNFI Hudson Valley (PO #1052998)
**Pickup:** Feb 25, 2026 | **Value:** $3,422 | **Status:** PALLETIZED AND READY

---

## Cash Flow Plan (Feb 14)

**Current balance: $45. EXP pallet: ~$3,400. Rent delayed to Mar 11.**

| Date | In | Out | Balance |
|------|----|----|---------|
| Sat Feb 14 | — | — | **$45** |
| ~Mon Feb 17 | Amazon +$561 | — | $606 |
| ~Sun Feb 23 | UNFI MOR +$3,422 | Deep -$1,299 / Foodies -$1,100 | **$1,629** |
| ~Fri Feb 28 | Amazon +$350 | — | **$1,979** |
| **~Mar 11** | UNFI HVA +$3,422 | Rent -$2,878 / Daylight -$400 | **$2,123** |
| ~Mar 14 | Amazon +$500 | — | **$2,623** |
| **~Mar 21** | EXP +$3,400 | Deep -$1,300 / Aria -$1,000 / Acorn -$804 / labels -$1,500 | **$1,419** |
| ~Mar 28 | Amazon +$500 | — | **$1,919** |
| **Apr 1** | — | Rent -$2,878 | **-$959 ← GAP** |
| ~Apr 7 | UNFI reorder? +$3,422 | — | $2,463 |

**Apr 1 gap: -$959.** Need ~$1,000 from DTC (~$500) + Faire orders + Amazon growth in March.

---

## Bills Owed (Feb 14)

| To | Amount | Due | Plan |
|----|--------|-----|------|
| **Deep (My Orchard)** | $1,298.80 | Feb 4 (overdue) | Pay Feb 23 from UNFI MOR |
| **Foodies (Aria)** | $1,100.00 | Overdue | Pay Feb 23 from UNFI MOR |
| **Acorn (boxes)** | $804.00 | Overdue | Pay Mar 21 from EXP |
| **Daylight Shipping** | ~$400.00 | ~Feb 26 (net 7) | Pay Mar 11 from UNFI HVA |
| **TOTAL** | **$3,602.80** | | |

---

## Shift Costs

| Type | Hours | Cost |
|------|-------|------|
| COOK | 4 | $400 ($100/hr, 2 staff) |
| PACK | 8 | $1,000 ($125/hr, 3 staff) |

---

## Suppliers

### Kitchen
**Foodies Urban Kitchen**, 8922 Norris Ave, Sun Valley
Aria — aria@foodiesurbankitchen.com | 800-781-3043

### Bottles
**Berlin Packaging** — Matt Barrington
matt.barrington@berlinpackaging.com | 404-821-4894
B320 8oz Clear PET Boston Round, 24-410 neck — $0.22/unit (14,000 qty, Jan 2026 PO)

### Ingredients
**My Orchard LLC (Deep)**, 1480 Long Beach Ave, LA
Delivery $80 | 2-day lead | Due on Receipt

### Supplier Pricing (Deep)

| Ingredient | Unit | Price |
|-----------|------|-------|
| Apple Cider Vinegar | case (4 gal) | $38.75 |
| Lime Juice | case (4 gal) | $58.00 |
| Garlic Peeled | case | $79.95-$109.00 |
| Culantro 14# | box | $69.00 |
| Salt 50 lb | bag | $13.00-$13.95 |
| Carrots Jumbo | 25-50 lb bag | $17.95-$28.00 |
| Habanero Chillies | 10# box | $28.00-$29.95 |
| Red Jalapeno | lb | $44.75 |
| White Vinegar | case | $17.95 |
| Sugar | case | $37.00 |
| Mango Chunks | 30 lb case | $46.50 |
| Thai Chili | 30# case | $49.50 |

---

## What We've Learned

| Date | Learning | Source |
|------|----------|-------|
| Feb 14, 2026 | EXP pays net 30 after pickup. Not net 14. | Dan |
| Feb 14, 2026 | UNFI pays ~2 weeks after shipment. | Dan |
| Feb 14, 2026 | Daylight Shipping = ~$400 for EXP pallet, net 7. | Dan |
| Feb 14, 2026 | Amazon ships in 25-packs, NOT 6-packs. | Dan |
| Feb 14, 2026 | Acorn 6-pack boxes = $804 per 1,000 ($0.79/box + $14 fuel). | Acorn |
| Feb 14, 2026 | Hand-filling from bote viable for small quantities. 240 bottles in ~3 hrs solo. | Dan |
| Feb 14, 2026 | Deep is flexible on payment — "no problem" to 2-week delay. | Text convo |
| Feb 14, 2026 | Aria open to scheduling shifts before balance paid. | Text convo |
| Feb 8, 2026 | Pack day: 2,248 bottles (~1,248 Hot, ~1,000 Mild). All Hot+Mild drums emptied. | Pack day |
| Jan 24, 2026 | Sriracha cheapest to produce ($2.74 COGS) | COGS analysis |
| Jan 24, 2026 | EXP serves NYC bodegas — biggest Sriracha order ever (20 cases) | PO 12165 |
| Jan 24, 2026 | WF SoPac sell-through: Hot 40%, Mango 33%, Mild 27% | WF data |
| Jan 24, 2026 | Mango adds ~7 units/week net (34 new - 27 cannibalized) | Regional data |

---

*Migrated from Notion (Tango Production) — Feb 17, 2026*
