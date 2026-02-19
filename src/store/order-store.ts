import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type {
  Order,
  OrderRow,
  OrderItem,
  OrderStage,
  ChecklistItem,
  OrderDocs,
  FlavorDemand,
} from '@/lib/types/order'

// ── Seed Data ─────────────────────────────────────────────────────

function getDefaultOrders(): Order[] {
  return [
    {
      id: 'unfi-1102034',
      channel: 'UNFI Hudson Valley',
      title: 'PO #1102034',
      value: '$3,480',
      dateStr: 'Pickup: Mar 25',
      stage: 'new',
      shipTo: 'Hudson Valley Warehouse, 525 Neelytown Rd, Montgomery, NY 12549',
      notes: 'Sent 02/18/26 from catherine.r.garcia@unfi.com. Ref: HH-79667-B18. ETA: 04/06/26.',
      items: [
        { sku: '224137', flavor: 'Mild', cases: 84, price: 29, packed: 0 },
        { sku: '224132', flavor: 'Hot', cases: 36, price: 29, packed: 0 },
      ],
      checklist: [],
      docs: { po: 'PO1102034.pdf', bol: null, inv: null },
      createdAt: '2026-02-18T08:40:00Z',
    },
    {
      id: 'unfi-1052998',
      channel: 'UNFI Hudson Valley',
      title: 'PO #1052998',
      value: '$3,422',
      dateStr: 'Pickup: Feb 25',
      stage: 'processing',
      shipTo: 'Hudson Valley Warehouse, 525 Neelytown Rd, Montgomery, NY 12549',
      notes: 'Palletized and ready. Pays ~Mar 11 (Net 14).',
      items: [],
      checklist: [
        { id: 'ck-hva-1', text: 'Palletized', done: true },
        { id: 'ck-hva-2', text: 'Confirm pickup with carrier', done: false },
        { id: 'ck-hva-3', text: 'Generate BOL', done: false },
      ],
      docs: { po: null, bol: null, inv: null },
      createdAt: '2026-02-01T00:00:00Z',
    },
    {
      id: 'unfi-044849783',
      channel: 'UNFI Moreno Valley',
      title: 'PO #044849783',
      value: '$3,422',
      dateStr: 'Shipped: Feb 9',
      stage: 'shipped',
      shipTo: null,
      notes: 'Pays ~Feb 23 (Net 14)',
      items: [],
      checklist: [],
      docs: { po: null, bol: null, inv: null },
      createdAt: '2026-01-20T00:00:00Z',
    },
    {
      id: 'exp-12165',
      channel: 'EXP Corp',
      title: 'PO #12165',
      value: '$3,450',
      dateStr: 'Pickup: Feb 19',
      stage: 'processing',
      shipTo: 'EXP Warehouse, 28-13 119th St, College Point, NY 11354',
      notes: 'Mango corrected to $25/case (was $5 typo). Sriracha reduced to 8 cases (only 48 bottles available). Mild caps need swap. Daylight pickup ~$400 net 7.',
      items: [
        { sku: 'TH01', flavor: 'Truffle', cases: 10, price: 50, packed: 0 },
        { sku: 'TH02', flavor: 'Hot', cases: 50, price: 25, packed: 10 },
        { sku: 'TH03', flavor: 'Mild', cases: 30, price: 25, packed: 0 },
        { sku: 'TH04', flavor: 'Mango', cases: 30, price: 25, packed: 0 },
        { sku: 'TH05', flavor: 'Sriracha', cases: 8, price: 25, packed: 0 },
      ],
      checklist: [
        { id: 'ck-1', text: 'Swap Mild caps (garage — wrong color)', done: false },
        { id: 'ck-2', text: 'Haul bottles upstairs', done: false },
        { id: 'ck-3', text: 'Tape bottoms on all boxes', done: false },
        { id: 'ck-4', text: 'Fill + tape + sticker: 30 Mango cases', done: false },
        { id: 'ck-5', text: 'Fill + tape + sticker: 10 Truffle cases', done: false },
        { id: 'ck-6', text: 'Fill + tape + sticker: 8 Sriracha (48 btl = all we have)', done: false },
        { id: 'ck-7', text: 'Get more boxes (need 92 more)', done: false },
        { id: 'ck-8', text: 'Pack 50 Hot cases (40 new + 10 already at kitchen)', done: false },
        { id: 'ck-9', text: 'Pack 30 Mild cases', done: false },
        { id: 'ck-10', text: 'Pack 12 more Sriracha cases (need 72 more bottles)', done: false },
        { id: 'ck-11', text: 'Palletize all 140 cases', done: false },
        { id: 'ck-12', text: 'Generate BOL', done: false },
        { id: 'ck-13', text: 'Confirm pickup time with EXP', done: false },
      ],
      docs: { po: 'EXP-PO-12165.pdf', bol: null, inv: null },
      createdAt: '2026-02-10T00:00:00Z',
    },
  ]
}

// ── Row Conversion ────────────────────────────────────────────────

function rowToOrder(row: OrderRow): Order {
  return {
    id: row.id,
    channel: row.channel,
    title: row.title,
    value: row.value,
    dateStr: row.date_str,
    stage: row.stage as OrderStage,
    shipTo: row.ship_to,
    notes: row.notes,
    items: row.items || [],
    checklist: row.checklist || [],
    docs: row.docs || { po: null, bol: null, inv: null },
    createdAt: row.created_at,
  }
}

function orderToRow(order: Order): Omit<OrderRow, 'created_at'> {
  return {
    id: order.id,
    channel: order.channel,
    title: order.title,
    value: order.value,
    date_str: order.dateStr,
    stage: order.stage,
    ship_to: order.shipTo,
    notes: order.notes,
    items: order.items,
    checklist: order.checklist,
    docs: order.docs,
    updated_at: new Date().toISOString(),
  }
}

// ── Store Interface ───────────────────────────────────────────────

export type OrderInput = Omit<Order, 'id' | 'createdAt'>

interface OrderState {
  orders: Order[]
  loading: boolean
  initialized: boolean
  selectedOrderId: string | null

  // CRUD
  fetchOrders: () => Promise<void>
  addOrder: (input: OrderInput) => Promise<string>
  updateOrder: (id: string, changes: Partial<Order>) => Promise<void>
  deleteOrder: (id: string) => Promise<void>

  // Pipeline
  moveOrder: (id: string, newStage: OrderStage) => Promise<void>

  // Detail
  selectOrder: (id: string | null) => void
  updateItems: (id: string, items: OrderItem[]) => Promise<void>
  toggleChecklistItem: (orderId: string, itemId: string) => Promise<void>
  addChecklistItem: (orderId: string, text: string) => Promise<void>
  uploadDoc: (orderId: string, docType: keyof OrderDocs, path: string) => Promise<void>
  updateNotes: (orderId: string, notes: string) => Promise<void>

  // Computed
  getOrdersByStage: () => Record<OrderStage, Order[]>
  getProductionDemand: () => FlavorDemand[]
}

// ── Store ─────────────────────────────────────────────────────────

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  loading: false,
  initialized: false,
  selectedOrderId: null,

  fetchOrders: async () => {
    if (get().initialized) return
    set({ loading: true })

    if (supabase) {
      const { data, error } = await supabase
        .from('tango_orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) {
        set({ orders: data.map(rowToOrder), loading: false, initialized: true })
        return
      }
    }

    // Fallback: localStorage
    try {
      const raw = localStorage.getItem('tango-orders')
      if (raw) {
        const parsed = JSON.parse(raw) as Order[]
        set({ orders: parsed, loading: false, initialized: true })
        return
      }
    } catch { /* ignore */ }

    set({ orders: getDefaultOrders(), loading: false, initialized: true })
  },

  addOrder: async (input: OrderInput) => {
    const id = crypto.randomUUID()
    const newOrder: Order = {
      ...input,
      id,
      createdAt: new Date().toISOString(),
    }

    set(s => ({ orders: [newOrder, ...s.orders] }))

    if (supabase) {
      await supabase.from('tango_orders').insert({
        ...orderToRow(newOrder),
        created_at: newOrder.createdAt,
      })
    }

    return id
  },

  updateOrder: async (id: string, changes: Partial<Order>) => {
    set(s => ({
      orders: s.orders.map(o => o.id === id ? { ...o, ...changes } : o),
    }))

    if (supabase) {
      const order = get().orders.find(o => o.id === id)
      if (order) {
        await supabase.from('tango_orders').update(orderToRow(order)).eq('id', id)
      }
    }
  },

  deleteOrder: async (id: string) => {
    set(s => ({ orders: s.orders.filter(o => o.id !== id) }))

    if (supabase) {
      await supabase.from('tango_orders').delete().eq('id', id)
    }
  },

  moveOrder: async (id: string, newStage: OrderStage) => {
    set(s => ({
      orders: s.orders.map(o => o.id === id ? { ...o, stage: newStage } : o),
    }))

    if (supabase) {
      await supabase.from('tango_orders').update({
        stage: newStage,
        updated_at: new Date().toISOString(),
      }).eq('id', id)
    }
  },

  selectOrder: (id: string | null) => {
    set({ selectedOrderId: id })
  },

  updateItems: async (id: string, items: OrderItem[]) => {
    set(s => ({
      orders: s.orders.map(o => o.id === id ? { ...o, items } : o),
    }))

    if (supabase) {
      await supabase.from('tango_orders').update({
        items,
        updated_at: new Date().toISOString(),
      }).eq('id', id)
    }
  },

  toggleChecklistItem: async (orderId: string, itemId: string) => {
    const order = get().orders.find(o => o.id === orderId)
    if (!order) return

    const checklist = order.checklist.map(c =>
      c.id === itemId ? { ...c, done: !c.done } : c
    )

    set(s => ({
      orders: s.orders.map(o => o.id === orderId ? { ...o, checklist } : o),
    }))

    if (supabase) {
      await supabase.from('tango_orders').update({
        checklist,
        updated_at: new Date().toISOString(),
      }).eq('id', orderId)
    }
  },

  addChecklistItem: async (orderId: string, text: string) => {
    const order = get().orders.find(o => o.id === orderId)
    if (!order) return

    const newItem: ChecklistItem = {
      id: crypto.randomUUID(),
      text,
      done: false,
    }
    const checklist = [...order.checklist, newItem]

    set(s => ({
      orders: s.orders.map(o => o.id === orderId ? { ...o, checklist } : o),
    }))

    if (supabase) {
      await supabase.from('tango_orders').update({
        checklist,
        updated_at: new Date().toISOString(),
      }).eq('id', orderId)
    }
  },

  uploadDoc: async (orderId: string, docType: keyof OrderDocs, path: string) => {
    const order = get().orders.find(o => o.id === orderId)
    if (!order) return

    const docs = { ...order.docs, [docType]: path }

    set(s => ({
      orders: s.orders.map(o => o.id === orderId ? { ...o, docs } : o),
    }))

    if (supabase) {
      await supabase.from('tango_orders').update({
        docs,
        updated_at: new Date().toISOString(),
      }).eq('id', orderId)
    }
  },

  updateNotes: async (orderId: string, notes: string) => {
    set(s => ({
      orders: s.orders.map(o => o.id === orderId ? { ...o, notes } : o),
    }))

    if (supabase) {
      await supabase.from('tango_orders').update({
        notes,
        updated_at: new Date().toISOString(),
      }).eq('id', orderId)
    }
  },

  getOrdersByStage: () => {
    const orders = get().orders
    const grouped: Record<OrderStage, Order[]> = {
      new: [],
      processing: [],
      shipped: [],
      paid: [],
    }
    for (const order of orders) {
      if (grouped[order.stage]) {
        grouped[order.stage].push(order)
      }
    }
    return grouped
  },

  getProductionDemand: () => {
    const orders = get().orders.filter(o => o.stage === 'new' || o.stage === 'processing')
    const demandMap = new Map<string, { cases: number; sources: string[] }>()

    for (const order of orders) {
      for (const item of order.items) {
        const key = item.flavor
        const existing = demandMap.get(key) || { cases: 0, sources: [] }
        existing.cases += item.cases
        existing.sources.push(`${order.title} (${item.cases})`)
        demandMap.set(key, existing)
      }
    }

    const demand: FlavorDemand[] = []
    for (const [flavor, { cases, sources }] of demandMap) {
      demand.push({
        flavor,
        cases,
        bottles: cases * 6,
        sourceOrders: sources,
      })
    }

    return demand.sort((a, b) => b.cases - a.cases)
  },
}))
