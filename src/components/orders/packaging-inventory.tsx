'use client'

import { useInventoryStore } from '@/store/inventory-store'
import { FLAVORS, FLAVOR_COLORS } from '@/data/tango-constants'
import { StepperInput } from './stepper-input'
import { SaveInput } from './save-input'

const SEAL_OPTIONS = ['none', 'some', 'a lot'] as const

const ITEM_HINTS: Record<string, string> = {
  'Kraft Tape': 'rolls',
}

export function PackagingInventory() {
  const {
    materials, setMaterialNote, setMaterialQuantity,
    caps, setCaps,
    labels, setLabels,
    sealFilledCaps, setSealFilledCaps,
    boxes, setBoxes,
    caseLabels, setCaseLabels,
  } = useInventoryStore()

  // Filter to non-flavor items only (caps/labels/boxes/seal-filled live in flavor grid)
  const generalItems = materials
    .map((mat, idx) => ({ mat, idx }))
    .filter(({ mat }) =>
      !mat.item.startsWith('Caps') &&
      !mat.item.startsWith('Labels') &&
      !mat.item.startsWith('Seal-Filled') &&
      !mat.item.startsWith('Seal Filled')
    )

  const flavorDot = (f: string) => (
    <span className="inline-block w-2 h-2 rounded-full mr-1.5 relative top-[-1px]" style={{ background: FLAVOR_COLORS[f] || '#999' }} />
  )

  return (
    <div className="border border-border rounded-lg p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Packaging</h3>
      </div>

      {/* General items */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
              <th className="pb-2 pr-4">Item</th>
              <th className="pb-2 px-4">Qty</th>
              <th className="pb-2 px-4">Note</th>
            </tr>
          </thead>
          <tbody>
            {generalItems.map(({ mat, idx }) => (
              <tr key={`${mat.item}-${idx}`} className="border-t border-border/50">
                <td className="py-1.5 pr-4 font-medium whitespace-nowrap">
                  {mat.item}
                  {ITEM_HINTS[mat.item] && (
                    <span className="text-[10px] text-muted-foreground/50 font-normal ml-1">{ITEM_HINTS[mat.item]}</span>
                  )}
                </td>
                <td className="py-1.5 px-4">
                  <StepperInput
                    value={mat.quantity ?? 0}
                    step={1}
                    onSave={v => setMaterialQuantity(idx, v === 0 ? null : v)}
                  />
                </td>
                <td className="py-1.5 px-4">
                  <SaveInput
                    type="text"
                    value={mat.note}
                    onSave={v => setMaterialNote(idx, v)}
                    placeholder="—"
                    className="w-full bg-transparent text-sm border-none focus:outline-none focus:ring-0 placeholder:text-muted-foreground/20"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Per-flavor grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
              <th className="pb-2 pr-4"></th>
              {FLAVORS.map(f => (
                <th key={f} className="pb-2 text-center px-1 min-w-[52px]">{flavorDot(f)}{f}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-border/50">
              <td className="py-1.5 pr-4 font-medium whitespace-nowrap">
                Caps <span className="text-[10px] text-muted-foreground/50 font-normal">boxes</span>
              </td>
              {FLAVORS.map(f => (
                <td key={f} className="py-1.5 px-1 text-center">
                  <StepperInput value={caps[f] || 0} step={1} onSave={v => setCaps(f, v)} />
                </td>
              ))}
            </tr>
            <tr className="border-t border-border/50">
              <td className="py-1.5 pr-4 font-medium whitespace-nowrap">
                Labels <span className="text-[10px] text-muted-foreground/50 font-normal">rolls</span>
              </td>
              {FLAVORS.map(f => (
                <td key={f} className="py-1.5 px-1 text-center">
                  <StepperInput value={labels[f] || 0} step={1} onSave={v => setLabels(f, v)} />
                </td>
              ))}
            </tr>
            <tr className="border-t border-border/50">
              <td className="py-1.5 pr-4 font-medium whitespace-nowrap">Seal-Filled Caps</td>
              {FLAVORS.map(f => (
                <td key={f} className="py-1.5 px-1 text-center">
                  <select
                    value={sealFilledCaps[f] || 'none'}
                    onChange={e => setSealFilledCaps(f, e.target.value)}
                    className="bg-card border border-border rounded-lg text-xs py-1 px-1.5 text-center appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-foreground/20 w-full"
                  >
                    {SEAL_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </td>
              ))}
            </tr>
            <tr className="border-t border-border/50">
              <td className="py-1.5 pr-4 font-medium whitespace-nowrap">
                Case Labels <span className="text-[10px] text-muted-foreground/50 font-normal">sheets</span>
              </td>
              {FLAVORS.map(f => (
                <td key={f} className="py-1.5 px-1 text-center">
                  <StepperInput value={caseLabels[f] || 0} step={1} onSave={v => setCaseLabels(f, v)} />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
