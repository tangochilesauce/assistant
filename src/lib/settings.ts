import { supabase } from '@/lib/supabase'

// ── Supabase Settings Helpers ─────────────────────────────────
// Shared load/save for the `settings` table (key-value JSON store).

export async function loadSetting<T = Record<string, unknown>>(key: string): Promise<T | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', key)
    .single()
  if (error || !data) return null
  return data.value as T
}

export async function saveSetting(key: string, value: unknown): Promise<void> {
  if (!supabase) return
  await supabase.from('settings').upsert({
    key,
    value,
    updated_at: new Date().toISOString(),
  })
}

// ── Settings Keys ────────────────────────────────────────────

export const SETTINGS_KEYS = {
  packed:          'tango_production_packed',
  drums:           'tango_production_drums',
  cookPlan:        'tango_production_cook_plan',
  materials:       'tango_production_materials',
  ingredients:     'tango_inventory_ingredients',
  packaging:       'tango_production_packaging',
  caps:            'tango_inventory_caps',
  labels:          'tango_inventory_labels',
  sealFilledCaps:  'tango_inventory_seal_filled_caps',
  boxes:           'tango_inventory_boxes',
} as const
