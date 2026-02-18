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

    set({ orders: [], loading: false, initialized: true })
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
