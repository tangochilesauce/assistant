// ── Tango Production Constants ─────────────────────────────────
// Extracted from production-store.ts — single source of truth for
// recipes, yields, units, and pricing.

export const FLAVORS = ['Hot', 'Mild', 'Mango', 'Truffle', 'Sriracha', 'Thai'] as const
export type Flavor = typeof FLAVORS[number]
export const FLAVOR_LC = FLAVORS.map(f => f.toLowerCase())

export const DRUM_BOTTLES = 625
export const LABELS_PER_ROLL = 1500
export const CAPS_PER_BOX = 5000

export const OLLA_YIELDS: Record<string, number> = {
  Hot: 400, Mild: 400, Truffle: 400, Thai: 400, Sriracha: 400,
  Mango: 450,
}

export const BATCHES_PER_OLLA: Record<string, number> = {
  Hot: 4, Mild: 4, Truffle: 4, Thai: 4, Sriracha: 4,
  Mango: 2,
}

// ── Recipes (per-batch ingredient needs) ─────────────────────

export const HOT_BATCH: Record<string, { amt: number; unit: string }> = {
  carrots:  { amt: 26.46, unit: 'lb' },
  garlic:   { amt: 8.82,  unit: 'lb' },
  lime:     { amt: 1.45,  unit: 'gal' },
  culantro: { amt: 3.75,  unit: 'lb' },
  habanero: { amt: 2.20,  unit: 'lb' },
  acv:      { amt: 3.01,  unit: 'gal' },
  salt:     { amt: 4.85,  unit: 'lb' },
}

export const MILD_BATCH: Record<string, { amt: number; unit: string }> = {
  carrots:  { amt: 26.46, unit: 'lb' },
  garlic:   { amt: 8.82,  unit: 'lb' },
  lime:     { amt: 1.45,  unit: 'gal' },
  culantro: { amt: 3.09,  unit: 'lb' },
  habanero: { amt: 1.10,  unit: 'lb' },
  acv:      { amt: 3.01,  unit: 'gal' },
  salt:     { amt: 4.41,  unit: 'lb' },
}

export const THAI_BATCH: Record<string, { amt: number; unit: string }> = {
  carrots:    { amt: 26.46, unit: 'lb' },
  garlic:     { amt: 8.82,  unit: 'lb' },
  lime:       { amt: 1.45,  unit: 'gal' },
  culantro:   { amt: 4.41,  unit: 'lb' },
  habanero:   { amt: 4.41,  unit: 'lb' },
  thai_chili: { amt: 6.61,  unit: 'lb' },
  acv:        { amt: 3.01,  unit: 'gal' },
  salt:       { amt: 4.85,  unit: 'lb' },
}

export const SRI_BATCH: Record<string, { amt: number; unit: string; kitchen?: boolean }> = {
  red_jalapeno: { amt: 25, unit: 'lb' },
  garlic:       { amt: 13, unit: 'lb' },
  sugar:        { amt: 4,  unit: 'lb' },
  salt:         { amt: 3,  unit: 'lb' },
  white_vinegar:{ amt: 11, unit: 'lb', kitchen: true },
  water:        { amt: 10, unit: 'lb', kitchen: true },
}

export const MANGO_BATCH: Record<string, { amt: number; unit: string }> = {
  mango_fruit: { amt: 50,    unit: 'lb' },
  carrots:     { amt: 26.46, unit: 'lb' },
  garlic:      { amt: 8.82,  unit: 'lb' },
  lime:        { amt: 1.45,  unit: 'gal' },
  culantro:    { amt: 4.41,  unit: 'lb' },
  habanero:    { amt: 1.10,  unit: 'lb' },
  acv:         { amt: 3.01,  unit: 'gal' },
  agave:       { amt: 2.20,  unit: 'lb' },
  salt:        { amt: 4.85,  unit: 'lb' },
}

export function getRecipe(flavor: string) {
  if (flavor === 'Sriracha') return SRI_BATCH
  if (flavor === 'Mango') return MANGO_BATCH
  if (flavor === 'Mild' || flavor === 'Truffle') return MILD_BATCH
  if (flavor === 'Thai') return THAI_BATCH
  return HOT_BATCH
}

// ── Deep Order units + pricing ──────────────────────────────

export const UNITS: Record<string, {
  pkg: number; unit: string; label: string; name: string; pLo: number; pHi: number
}> = {
  carrots:      { pkg: 25,  unit: 'lb',  label: '25lb bag',    name: 'carrots',             pLo: 14.95, pHi: 14.95 },
  garlic:       { pkg: 30,  unit: 'lb',  label: '30lb box',    name: 'garlic',              pLo: 84,    pHi: 84 },
  lime:         { pkg: 1,   unit: 'gal', label: 'gal',          name: 'lime juice',          pLo: 14.88, pHi: 14.88 },
  culantro:     { pkg: 14,  unit: 'lb',  label: '14lb box',    name: 'culantro',            pLo: 69,    pHi: 69 },
  habanero:     { pkg: 10,  unit: 'lb',  label: '~10lb box',   name: 'habanero',            pLo: 34.50, pHi: 34.50 },
  acv:          { pkg: 1,   unit: 'gal', label: 'gal',          name: 'apple cider vinegar', pLo: 9.94,  pHi: 9.94 },
  salt:         { pkg: 50,  unit: 'lb',  label: '50lb bag',    name: 'salt',                pLo: 14.95, pHi: 14.95 },
  red_jalapeno: { pkg: 25,  unit: 'lb',  label: '~25lb case',  name: 'red jalapeno',        pLo: 44.75, pHi: 44.75 },
  sugar:        { pkg: 50,  unit: 'lb',  label: '50lb bag',    name: 'cane sugar',          pLo: 37,    pHi: 37 },
  mango_fruit:  { pkg: 30,  unit: 'lb',  label: '30lb case',   name: 'mango',               pLo: 46.50, pHi: 46.50 },
  thai_chili:   { pkg: 30,  unit: 'lb',  label: '30lb case',   name: 'thai chilies',        pLo: 49.50, pHi: 49.50 },
  agave:        { pkg: 10,  unit: 'lb',  label: '~10lb jug',   name: 'agave nectar',        pLo: 25,    pHi: 30 },
  white_vinegar:{ pkg: 1,   unit: 'gal', label: 'gal',          name: 'white vinegar',       pLo: 5,     pHi: 5 },
}

export const DELIVERY_FEE = 80
export const SORT_ORDER = ['carrots', 'garlic', 'lime', 'culantro', 'habanero', 'acv', 'salt', 'red_jalapeno', 'sugar', 'mango_fruit']

// ── Flavor colors ───────────────────────────────────────────

export const FLAVOR_COLORS: Record<string, string> = {
  Hot: '#b93b35',
  Mild: '#3ca44f',
  Mango: '#d98095',
  Truffle: '#000000',
  Sriracha: '#3568B2',
  Thai: '#774684',
}

// ── Materials / Packaging ───────────────────────────────────

export type MaterialStatus = 'Have' | 'Low' | 'Order' | 'OTW'
export const MATERIAL_STATUSES: MaterialStatus[] = ['Have', 'Low', 'Order', 'OTW']

export interface MaterialItem {
  item: string
  status: MaterialStatus | string
  note: string
  quantity?: number | null
}

export const DEFAULT_MATERIALS: MaterialItem[] = [
  { item: 'Empty Bottles', status: 'Have', note: '' },
  { item: 'Seals', status: 'Have', note: '' },
  { item: '25-Pack Boxes', status: 'Have', note: '' },
  { item: 'Kraft Tape', status: 'Have', note: 'rolls' },
]

export const STATUS_COLORS: Record<MaterialStatus, string> = {
  Have: 'bg-green-500/15 text-green-700 dark:text-green-400',
  Low: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400',
  Order: 'bg-red-500/15 text-red-600 dark:text-red-400',
  OTW: 'bg-orange-500/15 text-orange-700 dark:text-orange-400',
}

// ── Ingredient keys for inventory tracking ──────────────────

export const INGREDIENT_KEYS = [
  'carrots', 'garlic', 'lime', 'culantro', 'habanero',
  'acv', 'salt', 'red_jalapeno', 'sugar', 'mango_fruit',
  'thai_chili', 'agave', 'white_vinegar',
] as const

export type IngredientKey = typeof INGREDIENT_KEYS[number]

export interface IngredientInventory {
  onHand: number
  unit: string
  lastUpdated: string
  note: string
}
