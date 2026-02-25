'use client'

import { useEffect, useState } from 'react'
import { X, Plus } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { useRecipeStore } from '@/store/recipe-store'
import { BATCHES_PER_OLLA, OLLA_YIELDS, UNITS } from '@/data/tango-constants'

// ── Flavor colors (brand) ───────────────────────────────────────

const FLAVOR_COLORS: Record<string, string> = {
  Hot: '#b93b35',
  Mild: '#3ca44f',
  Mango: '#d98095',
  Truffle: '#000000',
  Sriracha: '#3568B2',
  Thai: '#774684',
}

// ── Conversion constants ────────────────────────────────────────

const GRAMS_PER_LB = 453.592
const GRAMS_PER_GAL = 3785

// ── Recipe data (per batch) ─────────────────────────────────────

interface Ingredient {
  name: string
  grams: number | null
  unit: 'weight' | 'volume'
  unitKey?: string
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

function fmtWeight(grams: number): string {
  const lbs = grams / GRAMS_PER_LB
  if (lbs >= 1) return `${lbs.toFixed(1)} lb`
  return `${(lbs * 16).toFixed(1)} oz`
}

function fmtVolume(grams: number): string {
  return `${(grams / GRAMS_PER_GAL).toFixed(2)} gal`
}

function fmtImperial(ing: Ingredient, mult: number): string {
  if (ing.grams === null) return 'dropper'
  const g = ing.grams * mult
  return ing.unit === 'volume' ? fmtVolume(g) : fmtWeight(g)
}

function fmtCommodity(ing: Ingredient, mult: number): string {
  if (ing.grams === null) return '—'
  if (!ing.unitKey) return '—'
  const u = UNITS[ing.unitKey]
  if (!u) return '—'
  const g = ing.grams * mult
  const imperial = ing.unit === 'volume' ? g / GRAMS_PER_GAL : g / GRAMS_PER_LB
  const pkgs = Math.ceil(imperial / u.pkg * 10) / 10
  return `${pkgs.toFixed(1)}× ${u.label}`
}

// ── Component ───────────────────────────────────────────────────

export default function RecipesPage() {
  const { initialized, notes, fetchNotes, addNote, deleteNote } = useRecipeStore()

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
                notes={notes[recipe.flavor] || []}
                onAddNote={(text) => addNote(recipe.flavor, text)}
                onDeleteNote={(id) => deleteNote(recipe.flavor, id)}
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
  notes: { id: string; text: string }[]
  onAddNote: (text: string) => void
  onDeleteNote: (id: string) => void
}

function RecipeSection({ recipe, notes, onAddNote, onDeleteNote }: RecipeSectionProps) {
  const [newNote, setNewNote] = useState('')
  const color = FLAVOR_COLORS[recipe.flavor] || '#999'
  const batches = BATCHES_PER_OLLA[recipe.flavor] || 4
  const bottles = OLLA_YIELDS[recipe.flavor] || 400
  const isDark = recipe.flavor === 'Truffle'

  const handleAddNote = () => {
    const trimmed = newNote.trim()
    if (trimmed) {
      onAddNote(trimmed)
      setNewNote('')
    }
  }

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
          {batches} batches/olla &middot; ~{bottles} btl/olla
        </span>
      </div>

      <div className="p-4 space-y-4">
        {/* Ingredient table — all views in one */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="pb-2 pr-4">Ingredient</th>
                <th className="pb-2 text-right px-2 w-[72px]">
                  <div>1 Batch</div>
                </th>
                <th className="pb-2 text-right px-2 w-[72px]">
                  <div>1 Olla</div>
                  <div className="text-muted-foreground/40 normal-case font-normal">×{batches}</div>
                </th>
                <th className="pb-2 text-right pl-2 w-[120px] border-l border-border/30">
                  <div>Order Qty</div>
                  <div className="text-muted-foreground/40 normal-case font-normal">per olla</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {recipe.ingredients.map(ing => (
                <tr key={ing.name} className="border-t border-border/50">
                  <td className="py-1.5 pr-4 font-medium">{ing.name}</td>
                  <td className="py-1.5 text-right tabular-nums px-2 text-muted-foreground">
                    {fmtImperial(ing, 1)}
                  </td>
                  <td className="py-1.5 text-right tabular-nums px-2">
                    {fmtImperial(ing, batches)}
                  </td>
                  <td className="py-1.5 text-right tabular-nums pl-2 border-l border-border/30 text-orange-400 font-medium">
                    {fmtCommodity(ing, batches)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Notes — todo list style */}
        <div>
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium block mb-1.5">
            Notes
          </label>
          <div className="space-y-1">
            {notes.map(note => (
              <div key={note.id} className="flex items-start gap-2 group text-sm">
                <span className="flex-1 text-muted-foreground">{note.text}</span>
                <button
                  onClick={() => onDeleteNote(note.id)}
                  className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground/40 hover:text-red-400"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <Plus className="size-3 text-muted-foreground/30 shrink-0" />
              <input
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAddNote() }}
                placeholder="Add a note..."
                className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground/30"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
