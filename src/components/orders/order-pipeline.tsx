'use client'

import { useState, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { ORDER_STAGES, type Order, type OrderStage } from '@/lib/types/order'
import { useOrderStore } from '@/store/order-store'
import { OrderCard } from './order-card'

// ── Column ────────────────────────────────────────────────────────

function OrderColumn({ stageId, label, color, orders }: {
  stageId: OrderStage
  label: string
  color?: string
  orders: Order[]
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${stageId}`,
    data: { type: 'column', columnId: stageId },
  })

  return (
    <div className="flex flex-col min-w-[220px] flex-1">
      <div className="flex items-center gap-2 px-3 py-2.5 mb-2">
        {color ? (
          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
        ) : (
          <div className="w-2 h-2 rounded-full shrink-0 bg-muted-foreground/30" />
        )}
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground truncate">
          {label}
        </span>
        <span className="text-[10px] text-muted-foreground/60 tabular-nums ml-auto shrink-0">
          {orders.length}
        </span>
      </div>

      <SortableContext items={orders.map(o => o.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={`flex-1 rounded-lg p-1.5 space-y-2 min-h-[80px] transition-colors ${
            isOver ? 'bg-accent/40 ring-1 ring-accent' : 'bg-accent/10'
          }`}
        >
          {orders.length === 0 ? (
            <div className="flex items-center justify-center h-[60px] text-[10px] text-muted-foreground/40">
              Drop here
            </div>
          ) : (
            orders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  )
}

// ── Pipeline Board ────────────────────────────────────────────────

export function OrderPipeline() {
  const { orders, moveOrder } = useOrderStore()
  const [activeOrder, setActiveOrder] = useState<Order | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const order = event.active.data.current?.order as Order | undefined
    if (order) setActiveOrder(order)
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    setActiveOrder(null)

    if (!over) return

    const draggedOrder = active.data.current?.order as Order | undefined
    if (!draggedOrder) return

    let targetColumnId: string
    if (over.data.current?.type === 'column') {
      targetColumnId = over.data.current.columnId as string
    } else if (over.data.current?.type === 'card') {
      const overOrder = over.data.current.order as Order
      targetColumnId = overOrder.stage
    } else {
      return
    }

    if (targetColumnId !== draggedOrder.stage) {
      moveOrder(draggedOrder.id, targetColumnId as OrderStage)
    }
  }, [moveOrder])

  // Group orders by stage
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

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 overflow-x-auto pb-4">
        {ORDER_STAGES.map(stage => (
          <OrderColumn
            key={stage.id}
            stageId={stage.id}
            label={stage.label}
            color={stage.color}
            orders={grouped[stage.id]}
          />
        ))}
      </div>
      <DragOverlay dropAnimation={null}>
        {activeOrder ? <OrderCard order={activeOrder} overlay /> : null}
      </DragOverlay>
    </DndContext>
  )
}
