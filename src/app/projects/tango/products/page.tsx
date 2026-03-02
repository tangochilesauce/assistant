'use client'

import { useState, useCallback } from 'react'
import { Search, Copy, Check } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { FLAVOR_COLORS } from '@/data/tango-constants'

// ── Data ──────────────────────────────────────────────────────────

interface PackData {
  upc?: string
  amzSku?: string
  asin?: string
  fnsku?: string
  amzPrice?: string
}

interface FlavorProduct {
  flavor: string
  unfiItem?: string
  unfiSku?: string
  single: PackData
  twoPack: PackData
  threePack: PackData
  casePack: PackData   // 6-pack case
}

const PRODUCTS: FlavorProduct[] = [
  {
    flavor: 'Hot',
    unfiItem: '224132', unfiSku: 'HOTT',
    single:    { upc: '196852546671', amzSku: 'HOT-TANGO',  asin: 'B07VXY26C6', fnsku: 'X002QOIWJF', amzPrice: '$10.99' },
    twoPack:   { upc: '198168271391', amzSku: 'HOTT2',      asin: 'B0CM877VR6', fnsku: 'X0041G8Y5N', amzPrice: '$19.99' },
    threePack: { upc: '199284582309' },
    casePack:  { upc: '195893456864' },
  },
  {
    flavor: 'Mild',
    unfiItem: '224137', unfiSku: 'MILD',
    single:    { upc: '196852812899', amzSku: 'MILD-TANGO', asin: 'B07WW1NFH9', fnsku: 'X002QOSLCN', amzPrice: '$10.99' },
    twoPack:   { upc: '198168148358', amzSku: 'MILD2',      asin: 'B0CM89191S', fnsku: 'X0041GFNQV', amzPrice: '$19.99' },
    threePack: { upc: '199284808225' },
    casePack:  { upc: '195893300969' },
  },
  {
    flavor: 'Truffle',
    unfiSku: 'TRUF',
    single:    { upc: '871661003842', amzSku: 'TRUFFLETANGO', asin: 'B07WWYQ44K', fnsku: 'X002UJ4RDL', amzPrice: '$17.99' },
    twoPack:   { upc: '198168989760', amzSku: 'TRUF2',        asin: 'B0CM87YWJR', fnsku: 'X0041G8ZGV', amzPrice: '$29.99' },
    threePack: { upc: '199284317352' },
    casePack:  { upc: '195893555284' },
  },
  {
    flavor: 'Mango',
    unfiSku: 'MANG',
    single:    { upc: '195893424436', amzSku: 'MANGO-TANGO', asin: 'B09NQHPCS3', amzPrice: '$10.99' },
    twoPack:   { upc: '198168818275', amzSku: 'MANG2',       asin: 'B0CM81YRTQ', fnsku: 'X0041G8ZGL', amzPrice: '$19.99' },
    threePack: { upc: '199284781962' },
    casePack:  { upc: '196852060641' },
  },
  {
    flavor: 'Thai',
    unfiSku: 'THAI',
    single:    { upc: '195893449477', amzSku: 'THAI-TANGO', asin: 'B09NQHHWVR', amzPrice: '$10.99' },
    twoPack:   { upc: '198168289372', amzSku: 'THAI2',      asin: 'B0CM7PLRPG', fnsku: 'X0041GAWMB', amzPrice: '$19.99' },
    threePack: { upc: '199284887008' },
    casePack:  { upc: '196852257539' },
  },
  {
    flavor: 'Sriracha',
    single:    { upc: '198168929643', amzPrice: '$10.99' },
    twoPack:   { upc: '199284382176' },
    threePack: { upc: '199284005822' },
    casePack:  {},
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

function flavorMatchesSearch(product: FlavorProduct, q: string): boolean {
  const s = q.toLowerCase()
  if (product.flavor.toLowerCase().includes(s)) return true
  const allVals = [
    product.unfiItem, product.unfiSku,
    ...Object.values(product.single),
    ...Object.values(product.twoPack),
    ...Object.values(product.threePack),
    ...Object.values(product.casePack),
  ]
  return allVals.some(v => typeof v === 'string' && v.toLowerCase().includes(s))
}

// ── Copy Cell ─────────────────────────────────────────────────────

function CopyCell({ value, label }: { value?: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    if (!value) return
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [value])

  if (!value) return <span className="text-muted-foreground/15 text-[10px]">—</span>

  return (
    <button
      onClick={handleCopy}
      className="group/copy flex items-center gap-1.5 font-mono text-xs hover:text-orange-400 transition-colors text-left w-full"
      title="Click to copy"
    >
      {label && <span className="text-[10px] text-muted-foreground/40 uppercase w-14 shrink-0 font-sans">{label}</span>}
      <span className="truncate">{value}</span>
      {copied ? (
        <Check className="size-3 text-green-400 shrink-0" />
      ) : (
        <Copy className="size-3 opacity-0 group-hover/copy:opacity-40 shrink-0 transition-opacity" />
      )}
    </button>
  )
}

// ── Row helper ────────────────────────────────────────────────────

function DataRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <div className="py-1">
      <CopyCell value={value} label={label} />
    </div>
  )
}

function PackBlock({ title, data }: { title: string; data: PackData }) {
  const hasData = Object.values(data).some(Boolean)
  if (!hasData) return null

  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-medium mb-0.5">{title}</div>
      <div className="space-y-0">
        <DataRow label="UPC" value={data.upc} />
        <DataRow label="SKU" value={data.amzSku} />
        <DataRow label="ASIN" value={data.asin} />
        <DataRow label="FNSKU" value={data.fnsku} />
        {data.amzPrice && (
          <div className="py-1 flex items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground/40 uppercase w-14 shrink-0">Price</span>
            <span className="text-xs text-muted-foreground">{data.amzPrice}</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Flavor Card ───────────────────────────────────────────────────

function FlavorCard({ product }: { product: FlavorProduct }) {
  const color = FLAVOR_COLORS[product.flavor] || '#999'
  const isDark = product.flavor === 'Truffle'

  return (
    <div className="border border-border rounded-lg overflow-hidden flex flex-col">
      {/* Flavor header */}
      <div
        className="px-4 py-3 flex items-center gap-2"
        style={{
          background: `${color}15`,
          borderBottom: `2px solid ${color}40`,
        }}
      >
        <span
          className="inline-block w-3 h-3 rounded-full shrink-0"
          style={{ background: color, border: isDark ? '1px solid #444' : undefined }}
        />
        <h3 className="text-sm font-semibold">{product.flavor}</h3>
      </div>

      <div className="p-4 space-y-4 flex-1">
        {/* UNFI IDs (flavor-level) */}
        {(product.unfiItem || product.unfiSku) && (
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-medium mb-0.5">UNFI</div>
            <DataRow label="Item #" value={product.unfiItem} />
            <DataRow label="SKU" value={product.unfiSku} />
          </div>
        )}

        {/* Pack sections */}
        <PackBlock title="Single (8 oz)" data={product.single} />
        <PackBlock title="2-Pack" data={product.twoPack} />
        <PackBlock title="3-Pack" data={product.threePack} />
        <PackBlock title="6-Pack (Case)" data={product.casePack} />
      </div>
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────

export default function ProductsPage() {
  const [search, setSearch] = useState('')

  const filtered = search.trim()
    ? PRODUCTS.filter(p => flavorMatchesSearch(p, search.trim()))
    : PRODUCTS

  return (
    <>
      <PageHeader title="Products" count={6} />

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        {/* Search bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search UPC, SKU, ASIN, flavor..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-muted/30 border border-border rounded-lg outline-none focus:border-orange-500/50 focus:bg-muted/50 transition-colors placeholder:text-muted-foreground/30"
            autoFocus
          />
        </div>

        {/* 6 flavor columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(product => (
            <FlavorCard key={product.flavor} product={product} />
          ))}
        </div>

        {/* Business IDs */}
        <div className="mt-8 border border-border rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-muted/10 border-b border-border">
            <h3 className="text-sm font-semibold">Business IDs</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
            {BUSINESS_IDS.map((item, i) => (
              <div
                key={item.label}
                className={`px-4 py-2.5 flex items-center justify-between text-sm ${
                  i < BUSINESS_IDS.length - (BUSINESS_IDS.length % 2 === 0 ? 2 : 1)
                    ? 'border-b border-border/30'
                    : ''
                }`}
              >
                <span className="text-muted-foreground">{item.label}</span>
                <CopyCell value={item.value} />
              </div>
            ))}
          </div>
        </div>

        {/* Legacy UPCs */}
        <div className="mt-4 border border-border rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-muted/10 border-b border-border">
            <h3 className="text-sm font-semibold text-muted-foreground">Legacy UPCs</h3>
            <p className="text-[10px] text-muted-foreground/50 mt-0.5">Old barcodes — no longer on labels but may still appear in some systems</p>
          </div>
          <div className="divide-y divide-border/30">
            {LEGACY_UPCS.map(item => (
              <div key={item.upc} className="px-4 py-2.5 flex items-center gap-4 text-sm">
                <span className="text-muted-foreground w-16">{item.flavor}</span>
                <CopyCell value={item.upc} />
                <span className="text-[10px] text-muted-foreground/40 ml-auto">{item.note}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Packaging specs */}
        <div className="mt-4 border border-border rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-muted/10 border-b border-border">
            <h3 className="text-sm font-semibold text-muted-foreground">Packaging Specs</h3>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 text-sm">
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Bottle size</span>
              <span className="tabular-nums">2.25&quot; x 2.25&quot; x 6.25&quot;</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Filled weight</span>
              <span className="tabular-nums">~10 oz (308g)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">1-bottle box</span>
              <span className="tabular-nums">14.4 oz</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">2-bottle box</span>
              <span className="tabular-nums">1 lb 12 oz</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">3-bottle box</span>
              <span className="tabular-nums">2 lb 7 oz</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">6-pack case</span>
              <span className="tabular-nums">4 lb 5 oz</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Case dims</span>
              <span className="tabular-nums">12.25&quot; x 12.25&quot; x 6.25&quot;</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Pallet</span>
              <span className="tabular-nums">288 cases (1,728 btl)</span>
            </div>
          </div>
        </div>

        <div className="h-12" />
      </div>
    </>
  )
}
