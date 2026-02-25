'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { useRecipeStore } from '@/store/recipe-store'
import { BATCHES_PER_OLLA, OLLA_YIELDS, UNITS } from '@/store/production-store'

// ── Flavor colors ───────────────────────────────────────────────

const FLAVOR_COLORS: Record<string, string> = {
  Hot: '#CC0000',
  Mild: '#3BA226',
  Mango: '#F5D623',
  Truffle: '#1A1A1A',
  Sriracha: '#2B6EC2',
  Thai: '#F5D623',
}

// ── View modes ──────────────────────────────────────────────────

type ViewMode = 'batch' | 'olla' | 'commodity'

const VIEW_LABELS: Record<ViewMode, string> = {
  batch: '1 Batch',
  olla: '1 Olla',
  commodity: 'Commodity',
}

// ── Conversion constants ────────────────────────────────────────

const GRAMS_PER_LB = 453.592
const GRAMS_PER_GAL = 3785

// ── Recipe data (per batch) ─────────────────────────────────────

interface Ingredient {
  name: string
  grams: number | null      // null = non-standard unit (truffle oil, etc.)
  unit: 'weight' | 'volume' // weight = lb, volume = gal
  unitKey?: string           // key in UNITS for commodity mapping
}

interface RecipeCard {
  flavor: string
  subtitle?: string
  ingredients: Ingredient[]
}

const RECIPES: RecipeCard[] = [
  {
    flavor: 'Hot',
    ingredients: [
      { name: 'Carrots',              grams: 12000, unit: 'weight', unitKey: 'carrots' },
      { name: 'Garlic',               grams: 4000,  unit: 'weight', unitKey: 'garlic' },
      { name: 'Lime Juice',           grams: 5500,  unit: 'volume', unitKey: 'lime' },
      { name: 'Culantro',             grams: 1700,  unit: 'weight', unitKey: 'culantro' },
      { name: 'Chile (Habanero)',     grams: 1000,  unit: 'weight', unitKey: 'habanero' },
      { name: 'Apple Cider Vinegar',  grams: 11400, unit: 'volume', unitKey: 'acv' },
      { name: 'Salt',                 grams: 2200,  unit: 'weight', unitKey: 'salt' },
    ],
  },
  {
    flavor: 'Mild',
    subtitle: 'Same base as Truffle (add truffle oil after cooking)',
    ingredients: [
      { name: 'Carrots',              grams: 12000, unit: 'weight', unitKey: 'carrots' },
      { name: 'Garlic',               grams: 4000,  unit: 'weight', unitKey: 'garlic' },
      { name: 'Lime Juice',           grams: 5500,  unit: 'volume', unitKey: 'lime' },
      { name: 'Culantro',             grams: 1400,  unit: 'weight', unitKey: 'culantro' },
      { name: 'Chile (Habanero)',     grams: 500,   unit: 'weight', unitKey: 'habanero' },
      { name: 'Apple Cider Vinegar',  grams: 11400, unit: 'volume', unitKey: 'acv' },
      { name: 'Salt',                 grams: 2000,  unit: 'weight', unitKey: 'salt' },
    ],
  },
  {
    flavor: 'Truffle',
    subtitle: 'Mild recipe + truffle oil added right after cooking',
    ingredients: [
      { name: 'Carrots',              grams: 12000, unit: 'weight', unitKey: 'carrots' },
      { name: 'Garlic',               grams: 4000,  unit: 'weight', unitKey: 'garlic' },
      { name: 'Lime Juice',           grams: 5500,  unit: 'volume', unitKey: 'lime' },
      { name: 'Culantro',             grams: 1400,  unit: 'weight', unitKey: 'culantro' },
      { name: 'Chile (Habanero)',     grams: 500,   unit: 'weight', unitKey: 'habanero' },
      { name: 'Apple Cider Vinegar',  grams: 11400, unit: 'volume', unitKey: 'acv' },
      { name: 'Salt',                 grams: 2000,  unit: 'weight', unitKey: 'salt' },
      { name: 'Truffle Oil',          grams: null,  unit: 'weight' },
    ],
  },
  {
    flavor: 'Thai',
    ingredients: [
      { name: 'Carrots',              grams: 12000, unit: 'weight', unitKey: 'carrots' },
      { name: 'Garlic',               grams: 4000,  unit: 'weight', unitKey: 'garlic' },
      { name: 'Lime Juice',           grams: 5500,  unit: 'volume', unitKey: 'lime' },
      { name: 'Culantro',             grams: 2000,  unit: 'weight', unitKey: 'culantro' },
      { name: 'Habanero',             grams: 2000,  unit: 'weight', unitKey: 'habanero' },
      { name: 'Thai Chilies',         grams: 3000,  unit: 'weight', unitKey: 'thai_chili' },
      { name: 'Apple Cider Vinegar',  grams: 11400, unit: 'volume', unitKey: 'acv' },
      { name: 'Salt',                 grams: 2200,  unit: 'weight', unitKey: 'salt' },
    ],
  },
  {
    flavor: 'Mango',
    ingredients: [
      { name: 'Mango',                grams: Math.round(50 * GRAMS_PER_LB), unit: 'weight', unitKey: 'mango_fruit' },
      { name: 'Carrots',              grams: 12000, unit: 'weight', unitKey: 'carrots' },
      { name: 'Garlic',               grams: 4000,  unit: 'weight', unitKey: 'garlic' },
      { name: 'Lime Juice',           grams: 5500,  unit: 'volume', unitKey: 'lime' },
      { name: 'Culantro',             grams: 2000,  unit: 'weight', unitKey: 'culantro' },
      { name: 'Habanero',             grams: 500,   unit: 'weight', unitKey: 'habanero' },
      { name: 'Agave',                grams: 1000,  unit: 'weight', unitKey: 'agave' },
      { name: 'Apple Cider Vinegar',  grams: 11400, unit: 'volume', unitKey: 'acv' },
      { name: 'Salt',                 grams: 2200,  unit: 'weight', unitKey: 'salt' },
    ],
  },
  {
    flavor: 'Sriracha',
    ingredients: [
      { name: 'Red Jalapeno',         grams: Math.round(25 * GRAMS_PER_LB), unit: 'weight', unitKey: 'red_jalapeno' },
      { name: 'Garlic',               grams: Math.round(13 * GRAMS_PER_LB), unit: 'weight', unitKey: 'garlic' },
      { name: 'Water',                grams: Math.round(10 * GRAMS_PER_LB), unit: 'weight' },
      { name: 'White Vinegar',        grams: Math.round(11 * GRAMS_PER_LB), unit: 'weight', unitKey: 'white_vinegar' },
      { name: 'Sugar',                grams: Math.round(4 * GRAMS_PER_LB),  unit: 'weight', unitKey: 'sugar' },
      { name: 'Salt',                 grams: Math.round(3 * GRAMS_PER_LB),  unit: 'weight', unitKey: 'salt' },
    ],
  },
]

// ── Helpers ─────────────────────────────────────────────────────

function formatWeight(grams: number): string {
  const lbs = grams / GRAMS_PER_LB
  if (lbs >= 1) return `${lbs.toFixed(1)} lb`
  return `${(lbs * 16).toFixed(1)} oz`
}

function formatVolume(grams: number): string {
  return `${(grams / GRAMS_PER_GAL).toFixed(2)} gal`
}

function formatImperial(ing: Ingredient, multiplier: number): string {
  if (ing.grams === null) return 'dropper'
  const g = ing.grams * multiplier
  return ing.unit === 'volume' ? formatVolume(g) : formatWeight(g)
}

function formatCommodity(ing: Ingredient, multiplier: number): string {
  if (ing.grams === null) return 'dropper'
  if (!ing.unitKey) return '—'
  const u = UNITS[ing.unitKey]
  if (!u) return '—'

  const g = ing.grams * multiplier
  const imperial = ing.unit === 'volume' ? g / GRAMS_PER_GAL : g / GRAMS_PER_LB
  const pkgsExact = imperial / u.pkg
  const pkgsRounded = Math.ceil(pkgsExact * 10) / 10 // round up to 0.1

  if (pkgsRounded < 1) {
    return `${pkgsRounded.toFixed(1)} × ${u.label}`
  }
  return `${pkgsRounded.toFixed(1)} × ${u.label}`
}

// ── Component ───────────────────────────────────────────────────

export default function RecipesPage() {
  const { initialized, notes, fetchNotes, setNote } = useRecipeStore()
  const [view, setView] = useState<ViewMode>('batch')

  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  return (
    <>
      <PageHeader title="Recipes" count={RECIPES.length} />

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        {/* View toggle */}
        <div className="flex gap-1 mb-6 bg-muted/50 rounded-lg p-1 w-fit">
          {(['batch', 'olla', 'commodity'] as ViewMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => setView(mode)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                view === mode
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {VIEW_LABELS[mode]}
            </button>
          ))}
        </div>

        {!initialized ? (
          <div className="text-sm text-muted-foreground text-center py-8">Loading...</div>
        ) : (
          <div className="space-y-6">
            {RECIPES.map(recipe => (
              <RecipeSection
                key={recipe.flavor}
                recipe={recipe}
                view={view}
                note={notes[recipe.flavor] || ''}
                onNoteChange={(val) => setNote(recipe.flavor, val)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}

// ── Recipe Section ──────────────────────────────────────────────

interface RecipeSectionProps {
  recipe: RecipeCard
  view: ViewMode
  note: string
  onNoteChange: (value: string) => void
}

function RecipeSection({ recipe, view, note, onNoteChange }: RecipeSectionProps) {
  const color = FLAVOR_COLORS[recipe.flavor] || '#999'
  const batches = BATCHES_PER_OLLA[recipe.flavor] || 4
  const bottles = OLLA_YIELDS[recipe.flavor] || 400
  const isDark = recipe.flavor === 'Truffle'

  const multiplier = view === 'batch' ? 1 : batches

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Flavor header bar */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{
          background: `${color}15`,
          borderBottom: `2px solid ${color}40`,
        }}
      >
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-3 h-3 rounded-full"
            style={{ background: color, border: isDark ? '1px solid #444' : undefined }}
          />
          <h3 className="text-sm font-semibold">{recipe.flavor}</h3>
          {recipe.subtitle && (
            <span className="text-xs text-muted-foreground ml-2">{recipe.subtitle}</span>
          )}
        </div>
        <span className="text-[10px] text-muted-foreground tabular-nums">
          {batches} batches/olla &middot; ~{bottles} bottles/olla
        </span>
      </div>

      <div className="p-4 space-y-4">
        {/* Ingredient table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="pb-2 pr-4">Ingredient</th>
                <th className="pb-2 text-right px-2 w-24">Grams</th>
                <th className="pb-2 text-right px-2 w-24">Imperial</th>
                {view === 'commodity' && (
                  <th className="pb-2 text-right pl-2 w-36">Order Qty</th>
                )}
              </tr>
            </thead>
            <tbody>
              {recipe.ingredients.map(ing => (
                <tr key={ing.name} className="border-t border-border/50">
                  <td className="py-1.5 pr-4 font-medium">{ing.name}</td>
                  <td className="py-1.5 text-right tabular-nums px-2">
                    {ing.grams !== null ? `${(ing.grams * multiplier).toLocaleString()}g` : '—'}
                  </td>
                  <td className="py-1.5 text-right tabular-nums px-2">
                    {formatImperial(ing, multiplier)}
                  </td>
                  {view === 'commodity' && (
                    <td className="py-1.5 text-right tabular-nums pl-2 text-orange-400 font-medium">
                      {formatCommodity(ing, multiplier)}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* View mode label */}
        <div className="text-[10px] text-muted-foreground">
          {view === 'batch' && `Showing per-batch quantities (×${batches} for full olla)`}
          {view === 'olla' && `Showing full olla quantities (${batches} batches × 1 olla)`}
          {view === 'commodity' && `Showing full olla quantities mapped to purchasable units from Deep`}
        </div>

        {/* Notes */}
        <div>
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium block mb-1">
            Notes
          </label>
          <textarea
            value={note}
            onChange={e => onNoteChange(e.target.value)}
            placeholder="Add recipe notes..."
            rows={2}
            className="w-full bg-transparent text-sm border border-border/50 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-foreground/20 placeholder:text-muted-foreground/30 resize-y"
          />
        </div>

        {/* Image placeholder */}
        <div className="border-2 border-dashed border-border/50 rounded-lg p-6 text-center">
          <p className="text-xs text-muted-foreground/50">Drop recipe card image here</p>
        </div>
      </div>
    </div>
  )
}
