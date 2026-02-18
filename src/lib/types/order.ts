// ── Order Types ──────────────────────────────────────────────────

export type OrderStage = 'new' | 'processing' | 'shipped' | 'paid'

export const ORDER_STAGES: { id: OrderStage; label: string; color?: string }[] = [
  { id: 'new', label: 'New' },
  { id: 'processing', label: 'Processing' },
  { id: 'shipped', label: 'Shipped' },
  { id: 'paid', label: 'Paid', color: '#22c55e' },
]

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
}

// Production demand aggregation
export interface FlavorDemand {
  flavor: string
  cases: number
  bottles: number      // cases × 6
  sourceOrders: string[]  // order titles contributing
}
