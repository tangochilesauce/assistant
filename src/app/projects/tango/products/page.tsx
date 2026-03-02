'use client'

import { useState, useCallback } from 'react'
import { Search, Copy, Check, ChevronDown, ChevronRight } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { FLAVOR_COLORS } from '@/data/tango-constants'

// ── Product Data ──────────────────────────────────────────────────

interface ChannelIDs {
  sku?: string
  asin?: string
  fnsku?: string
}

interface Product {
  flavor: string
  pack: string         // '1-pack', '2-pack', '3-pack', '6-pack (case)'
  upc: string
  amazon?: ChannelIDs
  unfiItemNo?: string
  unfiSku?: string
  price?: { amazon?: string }
}

const PRODUCTS: Product[] = [
  // ── Hot ──
  { flavor: 'Hot', pack: 'Single (8oz)', upc: '196852546671',
    amazon: { sku: 'HOT-TANGO', asin: 'B07VXY26C6', fnsku: 'X002QOIWJF' },
    unfiItemNo: '224132', unfiSku: 'HOTT',
    price: { amazon: '$10.99' } },
  { flavor: 'Hot', pack: '2-Pack', upc: '198168271391',
    amazon: { sku: 'HOTT2', asin: 'B0CM877VR6', fnsku: 'X0041G8Y5N' },
    price: { amazon: '$19.99' } },
  { flavor: 'Hot', pack: '3-Pack', upc: '199284582309' },
  { flavor: 'Hot', pack: '6-Pack (Case)', upc: '195893456864' },

  // ── Mild ──
  { flavor: 'Mild', pack: 'Single (8oz)', upc: '196852812899',
    amazon: { sku: 'MILD-TANGO', asin: 'B07WW1NFH9', fnsku: 'X002QOSLCN' },
    unfiItemNo: '224137', unfiSku: 'MILD',
    price: { amazon: '$10.99' } },
  { flavor: 'Mild', pack: '2-Pack', upc: '198168148358',
    amazon: { sku: 'MILD2', asin: 'B0CM89191S', fnsku: 'X0041GFNQV' },
    price: { amazon: '$19.99' } },
  { flavor: 'Mild', pack: '3-Pack', upc: '199284808225' },
  { flavor: 'Mild', pack: '6-Pack (Case)', upc: '195893300969' },

  // ── Truffle ──
  { flavor: 'Truffle', pack: 'Single (8oz)', upc: '871661003842',
    amazon: { sku: 'TRUFFLETANGO', asin: 'B07WWYQ44K', fnsku: 'X002UJ4RDL' },
    unfiSku: 'TRUF',
    price: { amazon: '$17.99' } },
  { flavor: 'Truffle', pack: '2-Pack', upc: '198168989760',
    amazon: { sku: 'TRUF2', asin: 'B0CM87YWJR', fnsku: 'X0041G8ZGV' },
    price: { amazon: '$29.99' } },
  { flavor: 'Truffle', pack: '3-Pack', upc: '199284317352' },
  { flavor: 'Truffle', pack: '6-Pack (Case)', upc: '195893555284' },

  // ── Mango ──
  { flavor: 'Mango', pack: 'Single (8oz)', upc: '195893424436',
    amazon: { sku: 'MANGO-TANGO', asin: 'B09NQHPCS3' },
    unfiSku: 'MANG',
    price: { amazon: '$10.99' } },
  { flavor: 'Mango', pack: '2-Pack', upc: '198168818275',
    amazon: { sku: 'MANG2', asin: 'B0CM81YRTQ', fnsku: 'X0041G8ZGL' },
    price: { amazon: '$19.99' } },
  { flavor: 'Mango', pack: '3-Pack', upc: '199284781962' },
  { flavor: 'Mango', pack: '6-Pack (Case)', upc: '196852060641' },

  // ── Thai ──
  { flavor: 'Thai', pack: 'Single (8oz)', upc: '195893449477',
    amazon: { sku: 'THAI-TANGO', asin: 'B09NQHHWVR' },
    unfiSku: 'THAI',
    price: { amazon: '$10.99' } },
  { flavor: 'Thai', pack: '2-Pack', upc: '198168289372',
    amazon: { sku: 'THAI2', asin: 'B0CM7PLRPG', fnsku: 'X0041GAWMB' },
    price: { amazon: '$19.99' } },
  { flavor: 'Thai', pack: '3-Pack', upc: '199284887008' },
  { flavor: 'Thai', pack: '6-Pack (Case)', upc: '196852257539' },

  // ── Sriracha ──
  { flavor: 'Sriracha', pack: 'Single (8oz)', upc: '198168929643',
    price: { amazon: '$10.99' } },
  { flavor: 'Sriracha', pack: '2-Pack', upc: '199284382176' },
  { flavor: 'Sriracha', pack: '3-Pack', upc: '199284005822' },
  // No 6-pack case UPC registered for Sriracha
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

// ── Legacy UPCs (for reference) ───────────────────────────────────

const LEGACY_UPCS = [
  { flavor: 'Hot', upc: '019962102103', note: 'Original Hot UPC' },
  { flavor: 'Mild', upc: '019962102202', note: 'Original Mild UPC' },
]

// ── Helpers ───────────────────────────────────────────────────────

const FLAVORS_ORDER = ['Hot', 'Mild', 'Truffle', 'Mango', 'Thai', 'Sriracha']

function groupByFlavor(products: Product[]): Record<string, Product[]> {
  const grouped: Record<string, Product[]> = {}
  for (const f of FLAVORS_ORDER) grouped[f] = []
  for (const p of products) {
    if (!grouped[p.flavor]) grouped[p.flavor] = []
    grouped[p.flavor].push(p)
  }
  return grouped
}

function matchesSearch(product: Product, q: string): boolean {
  const s = q.toLowerCase()
  return (
    product.flavor.toLowerCase().includes(s) ||
    product.pack.toLowerCase().includes(s) ||
    product.upc.includes(s) ||
    (product.amazon?.sku?.toLowerCase().includes(s) ?? false) ||
    (product.amazon?.asin?.toLowerCase().includes(s) ?? false) ||
    (product.amazon?.fnsku?.toLowerCase().includes(s) ?? false) ||
    (product.unfiItemNo?.includes(s) ?? false) ||
    (product.unfiSku?.toLowerCase().includes(s) ?? false)
  )
}

// ── Copy Button ───────────────────────────────────────────────────

function CopyCell({ value, mono }: { value?: string; mono?: boolean }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    if (!value) return
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [value])

  if (!value) return <span className="text-muted-foreground/20">—</span>

  return (
    <button
      onClick={handleCopy}
      className={`group/copy inline-flex items-center gap-1.5 hover:text-orange-400 transition-colors text-left ${
        mono ? 'font-mono' : ''
      }`}
      title="Click to copy"
    >
      <span>{value}</span>
      {copied ? (
        <Check className="size-3 text-green-400 shrink-0" />
      ) : (
        <Copy className="size-3 opacity-0 group-hover/copy:opacity-40 shrink-0 transition-opacity" />
      )}
    </button>
  )
}

// ── Component ─────────────────────────────────────────────────────

export default function ProductsPage() {
  const [search, setSearch] = useState('')
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const filtered = search.trim()
    ? PRODUCTS.filter(p => matchesSearch(p, search.trim()))
    : PRODUCTS

  const grouped = groupByFlavor(filtered)

  const toggleFlavor = (flavor: string) => {
    setCollapsed(prev => ({ ...prev, [flavor]: !prev[flavor] }))
  }

  return (
    <>
      <PageHeader title="Products" count={filtered.length} />

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

        {/* Product cards by flavor */}
        <div className="space-y-4">
          {FLAVORS_ORDER.map(flavor => {
            const products = grouped[flavor]
            if (!products || products.length === 0) return null
            const color = FLAVOR_COLORS[flavor] || '#999'
            const isDark = flavor === 'Truffle'
            const isCollapsed = collapsed[flavor]

            return (
              <div key={flavor} className="border border-border rounded-lg overflow-hidden">
                {/* Flavor header */}
                <button
                  onClick={() => toggleFlavor(flavor)}
                  className="w-full px-4 py-3 flex items-center gap-2 text-left"
                  style={{
                    background: `${color}15`,
                    borderBottom: isCollapsed ? 'none' : `2px solid ${color}40`,
                  }}
                >
                  {isCollapsed ? (
                    <ChevronRight className="size-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="size-4 text-muted-foreground" />
                  )}
                  <span
                    className="inline-block w-3 h-3 rounded-full shrink-0"
                    style={{ background: color, border: isDark ? '1px solid #444' : undefined }}
                  />
                  <h3 className="text-sm font-semibold">{flavor}</h3>
                  <span className="text-[10px] text-muted-foreground ml-auto tabular-nums">
                    {products.length} SKU{products.length !== 1 ? 's' : ''}
                  </span>
                </button>

                {!isCollapsed && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border/50">
                          <th className="px-4 py-2">Pack</th>
                          <th className="px-4 py-2">UPC</th>
                          <th className="px-4 py-2">AMZ SKU</th>
                          <th className="px-4 py-2">ASIN</th>
                          <th className="px-4 py-2">FNSKU</th>
                          <th className="px-4 py-2">UNFI Item #</th>
                          <th className="px-4 py-2">UNFI SKU</th>
                          <th className="px-4 py-2 text-right">AMZ Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((p, i) => (
                          <tr
                            key={`${p.flavor}-${p.pack}`}
                            className={`border-t border-border/30 hover:bg-muted/20 transition-colors ${
                              i % 2 === 0 ? '' : 'bg-muted/5'
                            }`}
                          >
                            <td className="px-4 py-2.5 font-medium whitespace-nowrap">{p.pack}</td>
                            <td className="px-4 py-2.5 whitespace-nowrap"><CopyCell value={p.upc} mono /></td>
                            <td className="px-4 py-2.5 whitespace-nowrap"><CopyCell value={p.amazon?.sku} mono /></td>
                            <td className="px-4 py-2.5 whitespace-nowrap"><CopyCell value={p.amazon?.asin} mono /></td>
                            <td className="px-4 py-2.5 whitespace-nowrap"><CopyCell value={p.amazon?.fnsku} mono /></td>
                            <td className="px-4 py-2.5 whitespace-nowrap"><CopyCell value={p.unfiItemNo} mono /></td>
                            <td className="px-4 py-2.5 whitespace-nowrap"><CopyCell value={p.unfiSku} mono /></td>
                            <td className="px-4 py-2.5 text-right text-muted-foreground whitespace-nowrap">
                              {p.price?.amazon || '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )
          })}
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
                <CopyCell value={item.value} mono />
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
                <CopyCell value={item.upc} mono />
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
