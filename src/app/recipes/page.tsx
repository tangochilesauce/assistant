'use client'

import { useEffect } from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { useRecipeStore } from '@/store/recipe-store'
import { BATCHES_PER_OLLA, OLLA_YIELDS } from '@/store/production-store'

// ── Flavor colors (from cook-planner.tsx) ───────────────────────

const FLAVOR_COLORS: Record<string, string> = {
  Hot: '#CC0000',
  Mild: '#3BA226',
  Mango: '#F5D623',
  Truffle: '#1A1A1A',
  Sriracha: '#2B6EC2',
  Thai: '#F5D623',
}

// ── Conversion constants ────────────────────────────────────────

const GRAMS_PER_LB = 453.592
const GRAMS_PER_GAL = 3785

// ── Recipe data (per batch, in grams unless noted) ──────────────

interface Ingredient {
  name: string
  grams: number | null   // null = non-standard unit
  imperial: string       // human-readable imperial
}

interface RecipeCard {
  flavor: string
  subtitle?: string
  ingredients: Ingredient[]
}

function gramsToImperial(grams: number): string {
  const lbs = grams / GRAMS_PER_LB
  if (lbs >= 1) {
    return `${lbs.toFixed(1)} lb`
  }
  return `${(lbs * 16).toFixed(1)} oz`
}

function gramsToGallons(grams: number): string {
  const gal = grams / GRAMS_PER_GAL
  return `${gal.toFixed(2)} gal`
}

const RECIPES: RecipeCard[] = [
  {
    flavor: 'Hot',
    ingredients: [
      { name: 'Carrots', grams: 12000, imperial: gramsToImperial(12000) },
      { name: 'Garlic', grams: 4000, imperial: gramsToImperial(4000) },
      { name: 'Lime Juice', grams: 5500, imperial: gramsToGallons(5500) },
      { name: 'Culantro', grams: 1700, imperial: gramsToImperial(1700) },
      { name: 'Chile (Habanero)', grams: 1000, imperial: gramsToImperial(1000) },
      { name: 'Apple Cider Vinegar', grams: 11400, imperial: gramsToGallons(11400) },
      { name: 'Salt', grams: 2200, imperial: gramsToImperial(2200) },
    ],
  },
  {
    flavor: 'Mild',
    subtitle: 'Same base as Truffle (add dropper of truffle oil for Truffle)',
    ingredients: [
      { name: 'Carrots', grams: 12000, imperial: gramsToImperial(12000) },
      { name: 'Garlic', grams: 4000, imperial: gramsToImperial(4000) },
      { name: 'Lime Juice', grams: 5500, imperial: gramsToGallons(5500) },
      { name: 'Culantro', grams: 1400, imperial: gramsToImperial(1400) },
      { name: 'Chile (Habanero)', grams: 500, imperial: gramsToImperial(500) },
      { name: 'Apple Cider Vinegar', grams: 11400, imperial: gramsToGallons(11400) },
      { name: 'Salt', grams: 2000, imperial: gramsToImperial(2000) },
    ],
  },
  {
    flavor: 'Truffle',
    subtitle: 'Same base as Mild + truffle oil dropper',
    ingredients: [
      { name: 'Carrots', grams: 12000, imperial: gramsToImperial(12000) },
      { name: 'Garlic', grams: 4000, imperial: gramsToImperial(4000) },
      { name: 'Lime Juice', grams: 5500, imperial: gramsToGallons(5500) },
      { name: 'Culantro', grams: 1400, imperial: gramsToImperial(1400) },
      { name: 'Chile (Habanero)', grams: 500, imperial: gramsToImperial(500) },
      { name: 'Apple Cider Vinegar', grams: 11400, imperial: gramsToGallons(11400) },
      { name: 'Salt', grams: 2000, imperial: gramsToImperial(2000) },
      { name: 'Truffle Oil', grams: null, imperial: 'dropper' },
    ],
  },
  {
    flavor: 'Thai',
    ingredients: [
      { name: 'Carrots', grams: 12000, imperial: gramsToImperial(12000) },
      { name: 'Garlic', grams: 4000, imperial: gramsToImperial(4000) },
      { name: 'Lime Juice', grams: 5500, imperial: gramsToGallons(5500) },
      { name: 'Culantro', grams: 2000, imperial: gramsToImperial(2000) },
      { name: 'Habanero', grams: 2000, imperial: gramsToImperial(2000) },
      { name: 'Thai Chilies', grams: 3000, imperial: gramsToImperial(3000) },
      { name: 'Apple Cider Vinegar', grams: 11400, imperial: gramsToGallons(11400) },
      { name: 'Salt', grams: 2200, imperial: gramsToImperial(2200) },
    ],
  },
  {
    flavor: 'Mango',
    ingredients: [
      { name: 'Mango', grams: Math.round(50 * GRAMS_PER_LB), imperial: '50 lb' },
      { name: 'Carrots', grams: 12000, imperial: gramsToImperial(12000) },
      { name: 'Garlic', grams: 4000, imperial: gramsToImperial(4000) },
      { name: 'Lime Juice', grams: 5500, imperial: gramsToGallons(5500) },
      { name: 'Culantro', grams: 2000, imperial: gramsToImperial(2000) },
      { name: 'Habanero', grams: 500, imperial: gramsToImperial(500) },
      { name: 'Agave', grams: 1000, imperial: gramsToImperial(1000) },
      { name: 'Apple Cider Vinegar', grams: 11400, imperial: gramsToGallons(11400) },
      { name: 'Salt', grams: 2200, imperial: gramsToImperial(2200) },
    ],
  },
  {
    flavor: 'Sriracha',
    ingredients: [
      { name: 'Red Jalapeno', grams: Math.round(25 * GRAMS_PER_LB), imperial: '25 lb' },
      { name: 'Garlic', grams: Math.round(13 * GRAMS_PER_LB), imperial: '13 lb' },
      { name: 'Water', grams: Math.round(10 * GRAMS_PER_LB), imperial: '10 lb' },
      { name: 'White Vinegar', grams: Math.round(11 * GRAMS_PER_LB), imperial: '11 lb' },
      { name: 'Sugar', grams: Math.round(4 * GRAMS_PER_LB), imperial: '4 lb' },
      { name: 'Salt', grams: Math.round(3 * GRAMS_PER_LB), imperial: '3 lb' },
    ],
  },
]

// ── Component ───────────────────────────────────────────────────

export default function RecipesPage() {
  const { initialized, notes, fetchNotes, setNote } = useRecipeStore()

  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  return (
    <>
      <PageHeader title="Recipes" count={RECIPES.length} />

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        {!initialized ? (
          <div className="text-sm text-muted-foreground text-center py-8">Loading...</div>
        ) : (
          <div className="space-y-6">
            {RECIPES.map(recipe => (
              <RecipeSection
                key={recipe.flavor}
                recipe={recipe}
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
  note: string
  onNoteChange: (value: string) => void
}

function RecipeSection({ recipe, note, onNoteChange }: RecipeSectionProps) {
  const color = FLAVOR_COLORS[recipe.flavor] || '#999'
  const batches = BATCHES_PER_OLLA[recipe.flavor] || 4
  const bottles = OLLA_YIELDS[recipe.flavor] || 325

  // For Truffle, use the same text color treatment as dark bg
  const isDark = recipe.flavor === 'Truffle'

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
                <th className="pb-2 text-right px-2 w-28">Grams</th>
                <th className="pb-2 text-right px-2 w-28">Imperial</th>
              </tr>
            </thead>
            <tbody>
              {recipe.ingredients.map(ing => (
                <tr key={ing.name} className="border-t border-border/50">
                  <td className="py-1.5 pr-4 font-medium">{ing.name}</td>
                  <td className="py-1.5 text-right tabular-nums px-2">
                    {ing.grams !== null ? `${ing.grams.toLocaleString()}g` : '--'}
                  </td>
                  <td className="py-1.5 text-right tabular-nums px-2">
                    {ing.imperial}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
