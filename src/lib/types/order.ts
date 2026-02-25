// ── Order Types ──────────────────────────────────────────────────

export type OrderStage = 'order' | 'cook' | 'pack' | 'ship' | 'paid'

export const ORDER_STAGES: { id: OrderStage; label: string; color?: string }[] = [
  { id: 'order', label: 'Ordered' },
  { id: 'cook', label: 'Cooking' },
  { id: 'pack', label: 'Packing' },
  { id: 'ship', label: 'Shipped' },
  { id: 'paid', label: 'Paid', color: '#22c55e' },
]

// Migration from old stages
export function migrateStage(raw: string): OrderStage {
  if (raw === 'new') return 'order'
  if (raw === 'processing') return 'cook'
  if (raw === 'shipped') return 'ship'
  if (raw === 'paid') return 'paid'
  // Already valid new stage
  if (['order', 'cook', 'pack', 'ship', 'paid'].includes(raw)) return raw as OrderStage
  return 'order'
}

export interface OrderItem {
  sku: string
  flavor: string
  cases: number
  price: number       // per case
  packed: number       // cases packed so far
}

export interface ChecklistItem {
  id: string
  text: string
  done: boolean
}

export interface OrderDocs {
  po: string | null    // Supabase storage path or URL
  bol: string | null
  inv: string | null
}

export type CarrierType = 'unfi' | 'daylight' | 'pickup' | null

export interface Order {
  id: string
  channel: string
  title: string         // e.g. "PO #1102034"
  value: string         // display value e.g. "$3,480"
  dateStr: string       // e.g. "Pickup: Mar 25"
  stage: OrderStage
  shipTo: string | null
  notes: string | null
  items: OrderItem[]
  checklist: ChecklistItem[]
  docs: OrderDocs
  createdAt: string
  // Ship & Pay fields
  carrier: CarrierType
  pickupDate: string | null
  trackingNumber: string | null
  invoiceSentAt: string | null
  invoiceNumber: string | null
  expectedPayDate: string | null
  paidAt: string | null
  paidAmount: number | null
}

// Supabase row shape (matches existing tango_orders table)
export interface OrderRow {
  id: string
  channel: string
  title: string
  value: string
  date_str: string
  stage: string
  ship_to: string | null
  notes: string | null
  items: OrderItem[]
  checklist: ChecklistItem[]
  docs: OrderDocs
  created_at: string
  updated_at: string
  // Ship & Pay columns (may not exist yet in DB — handled gracefully)
  carrier?: CarrierType
  pickup_date?: string | null
  tracking_number?: string | null
  invoice_sent_at?: string | null
  invoice_number?: string | null
  expected_pay_date?: string | null
  paid_at?: string | null
  paid_amount?: number | null
}

// Production demand aggregation
export interface FlavorDemand {
  flavor: string
  cases: number
  bottles: number      // cases x 6
  sourceOrders: string[]  // order titles contributing
}
