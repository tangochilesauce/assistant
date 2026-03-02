'use client'

import { useState, useCallback } from 'react'
import { Search, Copy, Check } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { FLAVOR_COLORS } from '@/data/tango-constants'

// ── Types ─────────────────────────────────────────────────────────

interface FlavorData {
  upc?: string
  amzSku?: string
  asin?: string
  fnsku?: string
  unfiItem?: string
  unfiSku?: string
  amzPrice?: string
}

interface PackSection {
  pack: string
  flavors: Record<string, FlavorData>
}

// ── Data ──────────────────────────────────────────────────────────

const FLAVORS = ['Hot', 'Mild', 'Truffle', 'Mango', 'Thai', 'Sriracha'] as const

const PACKS: PackSection[] = [
  {
    pack: 'Single (8 oz)',
    flavors: {
      Hot:      { upc: '196852546671', amzSku: 'HOT-TANGO',    asin: 'B07VXY26C6', fnsku: 'X002QOIWJF', unfiItem: '224132', unfiSku: 'HOTT', amzPrice: '$10.99' },
      Mild:     { upc: '196852812899', amzSku: 'MILD-TANGO',   asin: 'B07WW1NFH9', fnsku: 'X002QOSLCN', unfiItem: '224137', unfiSku: 'MILD', amzPrice: '$10.99' },
      Truffle:  { upc: '871661003842', amzSku: 'TRUFFLETANGO', asin: 'B07WWYQ44K', fnsku: 'X002UJ4RDL',                     unfiSku: 'TRUF', amzPrice: '$17.99' },
      Mango:    { upc: '195893424436', amzSku: 'MANGO-TANGO',  asin: 'B09NQHPCS3',                                          unfiSku: 'MANG', amzPrice: '$10.99' },
      Thai:     { upc: '195893449477', amzSku: 'THAI-TANGO',   asin: 'B09NQHHWVR',                                          unfiSku: 'THAI', amzPrice: '$10.99' },
      Sriracha: { upc: '198168929643',                                                                                                         amzPrice: '$10.99' },
    },
  },
  {
    pack: '2-Pack',
    flavors: {
      Hot:      { upc: '198168271391', amzSku: 'HOTT2', asin: 'B0CM877VR6', fnsku: 'X0041G8Y5N', amzPrice: '$19.99' },
      Mild:     { upc: '198168148358', amzSku: 'MILD2', asin: 'B0CM89191S', fnsku: 'X0041GFNQV', amzPrice: '$19.99' },
      Truffle:  { upc: '198168989760', amzSku: 'TRUF2', asin: 'B0CM87YWJR', fnsku: 'X0041G8ZGV', amzPrice: '$29.99' },
      Mango:    { upc: '198168818275', amzSku: 'MANG2', asin: 'B0CM81YRTQ', fnsku: 'X0041G8ZGL', amzPrice: '$19.99' },
      Thai:     { upc: '198168289372', amzSku: 'THAI2', asin: 'B0CM7PLRPG', fnsku: 'X0041GAWMB', amzPrice: '$19.99' },
      Sriracha: { upc: '199284382176' },
    },
  },
  {
    pack: '3-Pack',
    flavors: {
      Hot:      { upc: '199284582309' },
      Mild:     { upc: '199284808225' },
      Truffle:  { upc: '199284317352' },
      Mango:    { upc: '199284781962' },
      Thai:     { upc: '199284887008' },
      Sriracha: { upc: '199284005822' },
    },
  },
  {
    pack: '6-Pack (Case)',
    flavors: {
      Hot:     { upc: '195893456864' },
      Mild:    { upc: '195893300969' },
      Truffle: { upc: '195893555284' },
      Mango:   { upc: '196852060641' },
      Thai:    { upc: '196852257539' },
      // Sriracha — no case UPC registered
    },
  },
]

const ROWS: { key: keyof FlavorData; label: string }[] = [
  { key: 'upc',      label: 'UPC' },
  { key: 'amzSku',   label: 'AMZ SKU' },
  { key: 'asin',     label: 'ASIN' },
  { key: 'fnsku',    label: 'FNSKU' },
  { key: 'unfiItem', label: 'UNFI Item #' },
  { key: 'unfiSku',  label: 'UNFI SKU' },
  { key: 'amzPrice', label: 'AMZ Price' },
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

function packMatchesSearch(section: PackSection, q: string): boolean {
  const s = q.toLowerCase()
  if (section.pack.toLowerCase().includes(s)) return true
  for (const flavor of FLAVORS) {
    if (flavor.toLowerCase().includes(s)) return true
    const data = section.flavors[flavor]
    if (!data) continue
    for (const row of ROWS) {
      const val = data[row.key]
      if (val && val.toLowerCase().includes(s)) return true
    }
  }
  return false
}

// ── Copy Cell ─────────────────────────────────────────────────────

function CopyCell({ value }: { value?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    if (!value) return
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [value])

  if (!value) return <span className="text-muted-foreground/15">—</span>

  return (
    <button
      onClick={handleCopy}
      className="group/copy inline-flex items-center gap-1 font-mono hover:text-orange-400 transition-colors text-left"
      title="Click to copy"
    >
      <span className="truncate">{value}</span>
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

  const filtered = search.trim()
    ? PACKS.filter(p => packMatchesSearch(p, search.trim()))
    : PACKS

  return (
    <>
      <PageHeader title="Products" />

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

        {/* Pack sections — flavors as columns */}
        <div className="space-y-6">
          {filtered.map(section => (
            <div key={section.pack} className="border border-border rounded-lg overflow-hidden">
              {/* Pack header */}
              <div className="px-4 py-3 bg-muted/10 border-b border-border">
                <h3 className="text-sm font-semibold">{section.pack}</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  {/* Flavor column headers */}
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="px-3 py-2.5 text-left text-[10px] uppercase tracking-wider text-muted-foreground w-24 shrink-0" />
                      {FLAVORS.map(flavor => {
                        const color = FLAVOR_COLORS[flavor] || '#999'
                        const isDark = flavor === 'Truffle'
                        return (
                          <th key={flavor} className="px-3 py-2.5 text-left">
                            <div className="flex items-center gap-1.5">
                              <span
                                className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ background: color, border: isDark ? '1px solid #444' : undefined }}
                              />
                              <span className="text-xs font-semibold" style={{ color }}>{flavor}</span>
                            </div>
                          </th>
                        )
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {ROWS.map((row, i) => {
                      // Skip rows where no flavor has data for this pack
                      const hasAny = FLAVORS.some(f => section.flavors[f]?.[row.key])
                      if (!hasAny) return null

                      return (
                        <tr
                          key={row.key}
                          className={`border-t border-border/20 ${i % 2 === 1 ? 'bg-muted/5' : ''}`}
                        >
                          <td className="px-3 py-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium whitespace-nowrap">
                            {row.label}
                          </td>
                          {FLAVORS.map(flavor => (
                            <td key={flavor} className="px-3 py-2 whitespace-nowrap">
                              <CopyCell value={section.flavors[flavor]?.[row.key]} />
                            </td>
                          ))}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
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
