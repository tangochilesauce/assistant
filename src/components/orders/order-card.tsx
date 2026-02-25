'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, FileText, Truck, Receipt } from 'lucide-react'
import type { Order } from '@/lib/types/order'
import { useOrderStore } from '@/store/order-store'

interface OrderCardProps {
  order: Order
  overlay?: boolean
}

const STAGE_BADGE: Record<string, { label: string; cls: string }> = {
  order: { label: 'ORDER', cls: 'bg-blue-500/15 text-blue-400' },
  cook: { label: 'COOK', cls: 'bg-orange-500/15 text-orange-400' },
  pack: { label: 'PACK', cls: 'bg-purple-500/15 text-purple-400' },
  ship: { label: 'SHIP', cls: 'bg-cyan-500/15 text-cyan-400' },
  paid: { label: 'PAID', cls: 'bg-green-500/15 text-green-400' },
}

function DocDot({ present, icon: Icon, label }: { present: boolean; icon: typeof FileText; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[10px] ${present ? 'text-emerald-400' : 'text-muted-foreground/30'}`}
      title={`${label}: ${present ? 'uploaded' : 'missing'}`}
    >
      <Icon className="size-2.5" />
    </span>
  )
}

export function OrderCard({ order, overlay }: OrderCardProps) {
  const { selectOrder } = useOrderStore()

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: order.id,
    data: { type: 'card', order },
    disabled: overlay,
  })

  const style = overlay ? undefined : {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const badge = STAGE_BADGE[order.stage]

  return (
    <div
      ref={overlay ? undefined : setNodeRef}
      style={style}
      onClick={() => !overlay && selectOrder(order.id)}
      className={`group rounded-lg border border-border bg-card shadow-sm p-3 cursor-pointer hover:ring-1 hover:ring-foreground/10 transition-all ${
        isDragging ? 'opacity-30' : ''
      } ${overlay ? 'shadow-lg ring-1 ring-foreground/10 rotate-[2deg]' : ''}`}
    >
      <div className="flex items-start gap-2">
        {/* Drag handle */}
        <button
          {...(overlay ? {} : { ...attributes, ...listeners })}
          className="mt-0.5 shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground touch-none hidden sm:block"
          onClick={e => e.stopPropagation()}
        >
          <GripVertical className="size-3.5" />
        </button>

        <div className="flex-1 min-w-0">
          {/* Channel + badge */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-wider text-orange-400 font-medium truncate">
              {order.channel}
            </span>
            {badge && (
              <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${badge.cls}`}>
                {badge.label}
              </span>
            )}
          </div>

          {/* Title + value */}
          <div className="flex items-baseline justify-between gap-2 mt-0.5">
            <span className="text-sm font-medium truncate">{order.title}</span>
            <span className="text-xs font-semibold tabular-nums text-emerald-400 shrink-0">
              {order.value}
            </span>
          </div>

          {/* Flavor case counts */}
          {order.items.length > 0 && (
            <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1.5">
              {order.items.map(item => (
                <span key={item.flavor} className="text-[10px] tabular-nums text-muted-foreground">
                  {item.flavor} <span className="font-medium text-foreground/70">{item.cases}</span>
                </span>
              ))}
            </div>
          )}

          {/* Date + doc indicators */}
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-[10px] text-muted-foreground">
              {order.dateStr}
            </span>
            <div className="flex items-center gap-1.5">
              <DocDot present={!!order.docs.po} icon={FileText} label="PO" />
              <DocDot present={!!order.docs.bol} icon={Truck} label="BOL" />
              <DocDot present={!!order.docs.inv} icon={Receipt} label="Invoice" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
