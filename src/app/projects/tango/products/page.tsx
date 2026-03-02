'use client'

import { useState, useCallback } from 'react'
import { Search, Copy, Check, ExternalLink } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { FLAVOR_COLORS } from '@/data/tango-constants'

// ── Data ──────────────────────────────────────────────────────────

const FLAVORS = ['Hot', 'Mild', 'Truffle', 'Mango', 'Thai', 'Sriracha'] as const

interface FlavorProduct {
  flavor: string
  tagline: string
  description: string
  heat: string
  ingredients: string[]
  claims: string[]
  cogs: string

  // links
  amazonSingle?: string
  amazon2Pack?: string
  shopify?: string
  faire?: string

  // UNFI
  unfiItem?: string
  unfiSku?: string

  // Single
  singleUpc: string
  singleAmzSku?: string
  singleAsin?: string
  singleFnsku?: string
  singlePrice?: string

  // 2-Pack
  twoPackUpc: string
  twoPackAmzSku?: string
  twoPackAsin?: string
  twoPackFnsku?: string
  twoPackPrice?: string

  // 3-Pack
  threePackUpc: string

  // 6-Pack (Case)
  caseUpc?: string

  // Recipe (per batch)
  recipe: string[]
}

const PRODUCTS: FlavorProduct[] = [
  {
    flavor: 'Hot',
    tagline: 'Smooth & Spicy',
    description: 'The crowd favorite. Signature delicious Tango flavor with the perfect amount of heat. If you love hot sauce, start with Hot Tango.',
    heat: 'Hot',
    ingredients: ['Carrots', 'Garlic', 'Limes', 'Habanero', 'Sawtooth Cilantro', 'Apple Cider Vinegar', 'Sea Salt'],
    claims: ['Plant-Based', 'Gluten-Free', 'Keto', 'No Sugar Added', 'No Preservatives', 'Cold-Fill Certified'],
    cogs: '$3.49',
    amazonSingle: 'https://amazon.com/dp/B07VXY26C6',
    amazon2Pack: 'https://amazon.com/dp/B0CM877VR6',
    shopify: 'https://tangochilesauce.com/products/hot-tango',
    faire: 'https://www.faire.com/brand/b_4ruezpily0',
    unfiItem: '224132', unfiSku: 'HOTT',
    singleUpc: '196852546671', singleAmzSku: 'HOT-TANGO', singleAsin: 'B07VXY26C6', singleFnsku: 'X002QOIWJF', singlePrice: '$10.99',
    twoPackUpc: '198168271391', twoPackAmzSku: 'HOTT2', twoPackAsin: 'B0CM877VR6', twoPackFnsku: 'X0041G8Y5N', twoPackPrice: '$19.99',
    threePackUpc: '199284582309',
    caseUpc: '195893456864',
    recipe: ['26.5 lb Carrots', '8.8 lb Garlic', '1.45 gal Lime Juice', '3.75 lb Culantro', '2.2 lb Habanero', '3 gal ACV', '4.85 lb Salt'],
  },
  {
    flavor: 'Mild',
    tagline: 'Flavor-First, Low Heat',
    description: 'The perfect hot sauce for beginners. Subtle sweetness of carrots and gentle spiciness of scotch bonnet. Kids love it. Great on salads.',
    heat: 'Mild',
    ingredients: ['Carrots', 'Garlic', 'Limes', 'Habanero', 'Sawtooth Cilantro', 'Apple Cider Vinegar', 'Sea Salt'],
    claims: ['Plant-Based', 'Gluten-Free', 'Keto', 'No Sugar Added', 'No Preservatives', 'Cold-Fill Certified'],
    cogs: '$3.37',
    amazonSingle: 'https://amazon.com/dp/B07WW1NFH9',
    amazon2Pack: 'https://amazon.com/dp/B0CM89191S',
    shopify: 'https://tangochilesauce.com/products/mild-tango',
    faire: 'https://www.faire.com/brand/b_4ruezpily0',
    unfiItem: '224137', unfiSku: 'MILD',
    singleUpc: '196852812899', singleAmzSku: 'MILD-TANGO', singleAsin: 'B07WW1NFH9', singleFnsku: 'X002QOSLCN', singlePrice: '$10.99',
    twoPackUpc: '198168148358', twoPackAmzSku: 'MILD2', twoPackAsin: 'B0CM89191S', twoPackFnsku: 'X0041GFNQV', twoPackPrice: '$19.99',
    threePackUpc: '199284808225',
    caseUpc: '195893300969',
    recipe: ['26.5 lb Carrots', '8.8 lb Garlic', '1.45 gal Lime Juice', '3.1 lb Culantro', '1.1 lb Habanero', '3 gal ACV', '4.4 lb Salt'],
  },
  {
    flavor: 'Truffle',
    tagline: 'Award-Winning Gourmet',
    description: 'The original award-winning collaboration with The Truffleist. Exceptional spicy truffle flavor in a healthful hot sauce guaranteed to take all your meals to the next level.',
    heat: 'Medium',
    ingredients: ['Carrots', 'Garlic', 'Limes', 'Chile Peppers', 'Sawtooth Cilantro', 'Truffle Flavoring', 'Apple Cider Vinegar', 'Sea Salt'],
    claims: ['Plant-Based', 'Gluten-Free', 'Keto', 'No Sugar Added', 'No Preservatives', 'Cold-Fill Certified'],
    cogs: '$3.34',
    amazonSingle: 'https://amazon.com/dp/B07WWYQ44K',
    amazon2Pack: 'https://amazon.com/dp/B0CM87YWJR',
    shopify: 'https://tangochilesauce.com/products/truffle-tango',
    faire: 'https://www.faire.com/brand/b_4ruezpily0',
    unfiSku: 'TRUF',
    singleUpc: '871661003842', singleAmzSku: 'TRUFFLETANGO', singleAsin: 'B07WWYQ44K', singleFnsku: 'X002UJ4RDL', singlePrice: '$17.99',
    twoPackUpc: '198168989760', twoPackAmzSku: 'TRUF2', twoPackAsin: 'B0CM87YWJR', twoPackFnsku: 'X0041G8ZGV', twoPackPrice: '$29.99',
    threePackUpc: '199284317352',
    caseUpc: '195893555284',
    recipe: ['Mild recipe base', '+ Truffle oil after cooking'],
  },
  {
    flavor: 'Mango',
    tagline: 'Sweet & Spicy Tropical',
    description: 'After years in the making. Indulge in an exotic new world of sweet spicy Mango Tango flavor. Fragrant ripe mangoes, limes, hot peppers, and a touch of agave in this Caribbean-inspired Tango.',
    heat: 'Mild',
    ingredients: ['Mangos', 'Carrots', 'Garlic', 'Limes', 'Habanero', 'Sawtooth Cilantro', 'Agave Nectar', 'Apple Cider Vinegar', 'Sea Salt'],
    claims: ['Plant-Based', 'Gluten-Free', 'Paleo', 'No Preservatives', 'Cold-Fill Certified'],
    cogs: '$3.31',
    amazonSingle: 'https://amazon.com/dp/B09NQHPCS3',
    amazon2Pack: 'https://amazon.com/dp/B0CM81YRTQ',
    shopify: 'https://tangochilesauce.com/products/mango-tango',
    faire: 'https://www.faire.com/brand/b_4ruezpily0',
    unfiSku: 'MANG',
    singleUpc: '195893424436', singleAmzSku: 'MANGO-TANGO', singleAsin: 'B09NQHPCS3', singlePrice: '$10.99',
    twoPackUpc: '198168818275', twoPackAmzSku: 'MANG2', twoPackAsin: 'B0CM81YRTQ', twoPackFnsku: 'X0041G8ZGL', twoPackPrice: '$19.99',
    threePackUpc: '199284781962',
    caseUpc: '196852060641',
    recipe: ['50 lb Mango', '26.5 lb Carrots', '8.8 lb Garlic', '1.45 gal Lime Juice', '4.4 lb Culantro', '1.1 lb Habanero', '2.2 lb Agave', '3 gal ACV', '4.85 lb Salt'],
  },
  {
    flavor: 'Thai',
    tagline: 'Clean Heat, No Linger',
    description: 'The hottest sauce we\'ve made yet. Fresh, spicy, sweet Tango with the heat turned all the way up. Thai chilies deliver a beautiful spicy flavor that doesn\'t linger on the tongue.',
    heat: 'Hot',
    ingredients: ['Carrots', 'Garlic', 'Limes', 'Habanero', 'Thai Chilies', 'Sawtooth Cilantro', 'Apple Cider Vinegar', 'Sea Salt'],
    claims: ['Plant-Based', 'Gluten-Free', 'Keto', 'No Sugar Added', 'No Preservatives', 'Cold-Fill Certified'],
    cogs: '$3.42',
    amazonSingle: 'https://amazon.com/dp/B09NQHHWVR',
    amazon2Pack: 'https://amazon.com/dp/B0CM7PLRPG',
    shopify: 'https://tangochilesauce.com/products/thai-tango',
    faire: 'https://www.faire.com/brand/b_4ruezpily0',
    unfiSku: 'THAI',
    singleUpc: '195893449477', singleAmzSku: 'THAI-TANGO', singleAsin: 'B09NQHHWVR', singlePrice: '$10.99',
    twoPackUpc: '198168289372', twoPackAmzSku: 'THAI2', twoPackAsin: 'B0CM7PLRPG', twoPackFnsku: 'X0041GAWMB', twoPackPrice: '$19.99',
    threePackUpc: '199284887008',
    caseUpc: '196852257539',
    recipe: ['26.5 lb Carrots', '8.8 lb Garlic', '1.45 gal Lime Juice', '4.4 lb Culantro', '4.4 lb Habanero', '6.6 lb Thai Chilies', '3 gal ACV', '4.85 lb Salt'],
  },
  {
    flavor: 'Sriracha',
    tagline: 'Clean & Simple',
    description: 'As close as we could get to the perfect Sriracha flavor we all love, while using only clean, simple ingredients.',
    heat: 'Hot',
    ingredients: ['Red Jalapeno', 'Garlic', 'White Vinegar', 'Cane Sugar', 'Sea Salt'],
    claims: ['Plant-Based', 'Gluten-Free', 'No Preservatives', 'Cold-Fill Certified'],
    cogs: '$2.74',
    shopify: 'https://tangochilesauce.com/products/sriracha-tango',
    faire: 'https://www.faire.com/brand/b_4ruezpily0',
    singleUpc: '198168929643', singlePrice: '$10.99',
    twoPackUpc: '199284382176',
    threePackUpc: '199284005822',
    recipe: ['25 lb Red Jalapeno', '13 lb Garlic', '11 lb White Vinegar', '4 lb Cane Sugar', '3 lb Salt'],
  },
]

// ── Business IDs ──────────────────────────────────────────────────

const BUSINESS_IDS = [
  { label: 'Company', value: 'Tango Chile Sauce, LLC' },
  { label: 'Federal EIN', value: '46-2641462' },
  { label: 'FDA Number', value: '11095246958' },
  { label: 'GS1 Account', value: '30042269' },
  { label: 'DUNS Number', value: '119248742' },
  { label: 'NAICS Code', value: '311941' },
  { label: 'CA Establishment #', value: '709122' },
  { label: 'Amazon Parent SKU', value: 'TANGO-HS-PARENT2' },
]

const LEGACY_UPCS = [
  { flavor: 'Hot', upc: '019962102103', note: 'Original Hot UPC' },
  { flavor: 'Mild', upc: '019962102202', note: 'Original Mild UPC' },
]

// ── Search ────────────────────────────────────────────────────────

function matchesSearch(p: FlavorProduct, q: string): boolean {
  const s = q.toLowerCase()
  const all = [
    p.flavor, p.tagline, p.description, p.heat,
    ...p.ingredients, ...p.recipe,
    p.unfiItem, p.unfiSku,
    p.singleUpc, p.singleAmzSku, p.singleAsin, p.singleFnsku,
    p.twoPackUpc, p.twoPackAmzSku, p.twoPackAsin, p.twoPackFnsku,
    p.threePackUpc, p.caseUpc,
  ]
  return all.some(v => v && v.toLowerCase().includes(s))
}

// ── Copy Cell ─────────────────────────────────────────────────────

function CC({ v, mono }: { v?: string; mono?: boolean }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = useCallback(() => {
    if (!v) return
    navigator.clipboard.writeText(v)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [v])

  if (!v) return <span className="text-muted-foreground/15 text-[10px]">—</span>

  return (
    <button
      onClick={handleCopy}
      className={`group/c inline-flex items-center gap-1 hover:text-orange-400 transition-colors text-left ${mono ? 'font-mono' : ''}`}
      title="Click to copy"
    >
      <span className="truncate">{v}</span>
      {copied ? (
        <Check className="size-2.5 text-green-400 shrink-0" />
      ) : (
        <Copy className="size-2.5 opacity-0 group-hover/c:opacity-40 shrink-0 transition-opacity" />
      )}
    </button>
  )
}

function ExtLink({ href, label }: { href?: string; label: string }) {
  if (!href) return <span className="text-muted-foreground/15 text-[10px]">—</span>
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-orange-400/80 hover:text-orange-400 transition-colors"
    >
      <span className="truncate">{label}</span>
      <ExternalLink className="size-2.5 shrink-0 opacity-60" />
    </a>
  )
}

// ── Section Row ───────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <td
      colSpan={7}
      className="px-3 py-2 text-[10px] uppercase tracking-widest text-orange-400/60 font-bold bg-orange-500/5 border-t border-border/40"
    >
      {children}
    </td>
  )
}

function Row({ label, children, wrap }: { label: string; children: React.ReactNode; wrap?: boolean }) {
  return (
    <tr className="border-t border-border/15 hover:bg-muted/10 transition-colors">
      <td className="px-3 py-2 text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium whitespace-nowrap sticky left-0 bg-background z-10 border-r border-border/10">
        {label}
      </td>
      {children}
    </tr>
  )
}

function Cell({ children, wrap }: { children: React.ReactNode; wrap?: boolean }) {
  return (
    <td className={`px-3 py-2 ${wrap ? '' : 'whitespace-nowrap'} text-xs`}>
      {children}
    </td>
  )
}

// ── Component ─────────────────────────────────────────────────────

export default function ProductsPage() {
  const [search, setSearch] = useState('')

  const filtered = search.trim()
    ? PRODUCTS.filter(p => matchesSearch(p, search.trim()))
    : PRODUCTS

  return (
    <>
      <PageHeader title="Products" count={6} />

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        {/* Search */}
        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search UPC, SKU, ASIN, flavor, ingredient..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-muted/30 border border-border rounded-lg outline-none focus:border-orange-500/50 focus:bg-muted/50 transition-colors placeholder:text-muted-foreground/30"
            autoFocus
          />
        </div>

        {/* Master table — 6 flavor columns, one row */}
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[1100px]">
              {/* Flavor headers */}
              <thead>
                <tr className="border-b border-border">
                  <th className="px-3 py-3 text-left w-24 sticky left-0 bg-background z-10 border-r border-border/10" />
                  {filtered.map(p => {
                    const color = FLAVOR_COLORS[p.flavor] || '#999'
                    return (
                      <th key={p.flavor} className="px-3 py-3 text-left" style={{ minWidth: 170 }}>
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block w-3 h-3 rounded-full shrink-0"
                            style={{ background: color }}
                          />
                          <span className="text-sm font-bold" style={{ color }}>{p.flavor}</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground/50 mt-0.5 font-normal">{p.tagline}</div>
                      </th>
                    )
                  })}
                </tr>
              </thead>

              <tbody>
                {/* ── OVERVIEW ── */}
                <tr><SectionLabel>Overview</SectionLabel></tr>

                <Row label="Description">
                  {filtered.map(p => (
                    <Cell key={p.flavor} wrap>
                      <span className="text-muted-foreground leading-relaxed">{p.description}</span>
                    </Cell>
                  ))}
                </Row>

                <Row label="Heat">
                  {filtered.map(p => (
                    <Cell key={p.flavor}>
                      <span className={
                        p.heat === 'Hot' ? 'text-red-400 font-medium' :
                        p.heat === 'Medium' ? 'text-yellow-400 font-medium' :
                        'text-green-400 font-medium'
                      }>{p.heat}</span>
                    </Cell>
                  ))}
                </Row>

                <Row label="COGS">
                  {filtered.map(p => <Cell key={p.flavor}><span className="text-muted-foreground tabular-nums">{p.cogs}</span></Cell>)}
                </Row>

                <Row label="Claims">
                  {filtered.map(p => (
                    <Cell key={p.flavor} wrap>
                      <div className="flex flex-wrap gap-1">
                        {p.claims.map(c => (
                          <span key={c} className="text-[9px] px-1.5 py-0.5 rounded bg-muted/30 text-muted-foreground/60">{c}</span>
                        ))}
                      </div>
                    </Cell>
                  ))}
                </Row>

                {/* ── LINKS ── */}
                <tr><SectionLabel>Links</SectionLabel></tr>

                <Row label="Amazon">
                  {filtered.map(p => (
                    <Cell key={p.flavor}>
                      <div className="space-y-0.5">
                        <ExtLink href={p.amazonSingle} label="Single" />
                        {p.amazon2Pack && <div><ExtLink href={p.amazon2Pack} label="2-Pack" /></div>}
                      </div>
                    </Cell>
                  ))}
                </Row>

                <Row label="Website">
                  {filtered.map(p => <Cell key={p.flavor}><ExtLink href={p.shopify} label="Shop" /></Cell>)}
                </Row>

                <Row label="Faire">
                  {filtered.map(p => <Cell key={p.flavor}><ExtLink href={p.faire} label="Wholesale" /></Cell>)}
                </Row>

                {/* ── SINGLE ── */}
                <tr><SectionLabel>Single (8 oz)</SectionLabel></tr>

                <Row label="UPC">
                  {filtered.map(p => <Cell key={p.flavor}><CC v={p.singleUpc} mono /></Cell>)}
                </Row>
                <Row label="AMZ SKU">
                  {filtered.map(p => <Cell key={p.flavor}><CC v={p.singleAmzSku} mono /></Cell>)}
                </Row>
                <Row label="ASIN">
                  {filtered.map(p => <Cell key={p.flavor}><CC v={p.singleAsin} mono /></Cell>)}
                </Row>
                <Row label="FNSKU">
                  {filtered.map(p => <Cell key={p.flavor}><CC v={p.singleFnsku} mono /></Cell>)}
                </Row>
                <Row label="Price">
                  {filtered.map(p => <Cell key={p.flavor}><span className="text-muted-foreground tabular-nums">{p.singlePrice || '—'}</span></Cell>)}
                </Row>

                {/* ── 2-PACK ── */}
                <tr><SectionLabel>2-Pack</SectionLabel></tr>

                <Row label="UPC">
                  {filtered.map(p => <Cell key={p.flavor}><CC v={p.twoPackUpc} mono /></Cell>)}
                </Row>
                <Row label="AMZ SKU">
                  {filtered.map(p => <Cell key={p.flavor}><CC v={p.twoPackAmzSku} mono /></Cell>)}
                </Row>
                <Row label="ASIN">
                  {filtered.map(p => <Cell key={p.flavor}><CC v={p.twoPackAsin} mono /></Cell>)}
                </Row>
                <Row label="FNSKU">
                  {filtered.map(p => <Cell key={p.flavor}><CC v={p.twoPackFnsku} mono /></Cell>)}
                </Row>
                <Row label="Price">
                  {filtered.map(p => <Cell key={p.flavor}><span className="text-muted-foreground tabular-nums">{p.twoPackPrice || '—'}</span></Cell>)}
                </Row>

                {/* ── 3-PACK ── */}
                <tr><SectionLabel>3-Pack</SectionLabel></tr>

                <Row label="UPC">
                  {filtered.map(p => <Cell key={p.flavor}><CC v={p.threePackUpc} mono /></Cell>)}
                </Row>

                {/* ── CASE ── */}
                <tr><SectionLabel>6-Pack (Case)</SectionLabel></tr>

                <Row label="UPC">
                  {filtered.map(p => <Cell key={p.flavor}><CC v={p.caseUpc} mono /></Cell>)}
                </Row>

                {/* ── UNFI ── */}
                <tr><SectionLabel>UNFI / Distribution</SectionLabel></tr>

                <Row label="UNFI Item #">
                  {filtered.map(p => <Cell key={p.flavor}><CC v={p.unfiItem} mono /></Cell>)}
                </Row>
                <Row label="UNFI SKU">
                  {filtered.map(p => <Cell key={p.flavor}><CC v={p.unfiSku} mono /></Cell>)}
                </Row>

                {/* ── INGREDIENTS ── */}
                <tr><SectionLabel>Ingredients & Recipe</SectionLabel></tr>

                <Row label="Ingredients">
                  {filtered.map(p => (
                    <Cell key={p.flavor} wrap>
                      <ul className="space-y-0.5 text-muted-foreground">
                        {p.ingredients.map(ing => (
                          <li key={ing} className="flex items-start gap-1.5">
                            <span className="text-muted-foreground/25 mt-px">&#8226;</span>
                            <span>{ing}</span>
                          </li>
                        ))}
                      </ul>
                    </Cell>
                  ))}
                </Row>

                <Row label="Recipe / Batch">
                  {filtered.map(p => (
                    <Cell key={p.flavor} wrap>
                      <ul className="space-y-0.5 text-muted-foreground/60">
                        {p.recipe.map(line => (
                          <li key={line} className="flex items-start gap-1.5">
                            <span className="text-muted-foreground/20 mt-px">&#8226;</span>
                            <span>{line}</span>
                          </li>
                        ))}
                      </ul>
                    </Cell>
                  ))}
                </Row>
              </tbody>
            </table>
          </div>
        </div>

        {/* Business IDs + Legacy + Specs in a row below */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Business IDs */}
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="px-4 py-2.5 bg-muted/10 border-b border-border">
              <h3 className="text-xs font-semibold">Business IDs</h3>
            </div>
            <div className="divide-y divide-border/20">
              {BUSINESS_IDS.map(item => (
                <div key={item.label} className="px-3 py-2 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground/60">{item.label}</span>
                  <CC v={item.value} mono />
                </div>
              ))}
            </div>
          </div>

          {/* Packaging Specs */}
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="px-4 py-2.5 bg-muted/10 border-b border-border">
              <h3 className="text-xs font-semibold">Packaging Specs</h3>
            </div>
            <div className="divide-y divide-border/20">
              {[
                ['Bottle', '2.25" x 2.25" x 6.25"'],
                ['Filled weight', '~10 oz (308g)'],
                ['1-bottle box', '14.4 oz'],
                ['2-bottle box', '1 lb 12 oz'],
                ['3-bottle box', '2 lb 7 oz'],
                ['6-pack case', '4 lb 5 oz'],
                ['Case dims', '12.25" x 12.25" x 6.25"'],
                ['Pallet', '288 cases (1,728 btl)'],
              ].map(([label, val]) => (
                <div key={label} className="px-3 py-2 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground/60">{label}</span>
                  <span className="tabular-nums">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Legacy UPCs */}
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="px-4 py-2.5 bg-muted/10 border-b border-border">
              <h3 className="text-xs font-semibold">Legacy UPCs</h3>
              <p className="text-[9px] text-muted-foreground/40 mt-0.5">Old barcodes that may still appear in some systems</p>
            </div>
            <div className="divide-y divide-border/20">
              {LEGACY_UPCS.map(item => (
                <div key={item.upc} className="px-3 py-2 flex items-center gap-3 text-xs">
                  <span className="text-muted-foreground/60 w-12">{item.flavor}</span>
                  <CC v={item.upc} mono />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="h-12" />
      </div>
    </>
  )
}
