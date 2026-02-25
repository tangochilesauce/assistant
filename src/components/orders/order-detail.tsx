'use client'

import { useState, useRef } from 'react'
import { Plus, FileText, Truck, Receipt, Upload, Trash2 } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ORDER_STAGES, type OrderDocs } from '@/lib/types/order'
import { useOrderStore } from '@/store/order-store'
import { supabase } from '@/lib/supabase'

const DOC_TYPES: { key: keyof OrderDocs; label: string; icon: typeof FileText }[] = [
  { key: 'po', label: 'Purchase Order', icon: FileText },
  { key: 'bol', label: 'Bill of Lading', icon: Truck },
  { key: 'inv', label: 'Invoice', icon: Receipt },
]

export function OrderDetail() {
  const {
    orders,
    selectedOrderId,
    selectOrder,
    updateItems,
    toggleChecklistItem,
    addChecklistItem,
    uploadDoc,
    updateNotes,
    moveOrder,
    deleteOrder,
  } = useOrderStore()

  const order = orders.find(o => o.id === selectedOrderId)
  const [newCheckText, setNewCheckText] = useState('')
  const [editingNotes, setEditingNotes] = useState(false)
  const [notesValue, setNotesValue] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadingDocType, setUploadingDocType] = useState<keyof OrderDocs | null>(null)

  if (!order) {
    return (
      <Sheet open={!!selectedOrderId} onOpenChange={open => !open && selectOrder(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Order not found</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    )
  }

  const handleNotesBlur = () => {
    if (notesValue !== (order.notes || '')) {
      updateNotes(order.id, notesValue)
    }
    setEditingNotes(false)
  }

  const handleAddCheckItem = () => {
    const trimmed = newCheckText.trim()
    if (trimmed) {
      addChecklistItem(order.id, trimmed)
      setNewCheckText('')
    }
  }

  const handlePackedChange = (index: number, packed: number) => {
    const items = [...order.items]
    items[index] = { ...items[index], packed: Math.max(0, Math.min(packed, items[index].cases)) }
    updateItems(order.id, items)
  }

  const handleFileUpload = async (docType: keyof OrderDocs) => {
    setUploadingDocType(docType)
    fileInputRef.current?.click()
  }

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !uploadingDocType) return

    if (supabase) {
      const path = `orders/${order.id}/${uploadingDocType}-${file.name}`
      const { error } = await supabase.storage
        .from('tango-docs')
        .upload(path, file, { upsert: true })

      if (!error) {
        uploadDoc(order.id, uploadingDocType, path)
      }
    } else {
      // Fallback: just store the filename
      uploadDoc(order.id, uploadingDocType, file.name)
    }

    setUploadingDocType(null)
    e.target.value = ''
  }

  const completedChecks = order.checklist.filter(c => c.done).length
  const totalChecks = order.checklist.length

  return (
    <Sheet open={!!selectedOrderId} onOpenChange={open => !open && selectOrder(null)}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <div className="text-[10px] uppercase tracking-wider text-orange-400 font-medium">
            {order.channel}
          </div>
          <SheetTitle className="flex items-baseline gap-3">
            <span>{order.title}</span>
            <span className="text-emerald-400 text-base">{order.value}</span>
          </SheetTitle>
          <SheetDescription>
            {order.dateStr}
            {order.shipTo && <span className="ml-2 text-[11px]">→ {order.shipTo}</span>}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-6 px-4 pb-4">
          {/* Stage selector */}
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Stage</label>
            <div className="flex gap-1 mt-1.5">
              {ORDER_STAGES.map(stage => (
                <button
                  key={stage.id}
                  onClick={() => moveOrder(order.id, stage.id)}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    order.stage === stage.id
                      ? 'bg-foreground text-background border-foreground'
                      : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/50'
                  }`}
                >
                  {stage.label}
                </button>
              ))}
            </div>
          </div>

          {/* Items table */}
          {order.items.length > 0 && (
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Items
              </label>
              <div className="mt-1.5 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                      <th className="pb-1.5">Flavor</th>
                      <th className="pb-1.5 text-right">Cases</th>
                      <th className="pb-1.5 text-right">$/case</th>
                      <th className="pb-1.5 text-right">Packed</th>
                      <th className="pb-1.5 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, i) => (
                      <tr key={item.sku} className="border-t border-border/50">
                        <td className="py-1.5 font-medium">{item.flavor}</td>
                        <td className="py-1.5 text-right tabular-nums">{item.cases}</td>
                        <td className="py-1.5 text-right tabular-nums text-muted-foreground">${item.price}</td>
                        <td className="py-1.5 text-right">
                          <input
                            type="number"
                            min={0}
                            max={item.cases}
                            value={item.packed}
                            onChange={e => handlePackedChange(i, parseInt(e.target.value) || 0)}
                            className="w-12 text-right text-sm bg-transparent border-b border-border/50 outline-none tabular-nums"
                          />
                        </td>
                        <td className="py-1.5 text-right tabular-nums font-medium">
                          ${(item.cases * item.price).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Checklist */}
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Checklist {totalChecks > 0 && `(${completedChecks}/${totalChecks})`}
            </label>
            <div className="mt-1.5 space-y-1.5">
              {order.checklist.map(item => (
                <div key={item.id} className="flex items-start gap-2 group">
                  <Checkbox
                    checked={item.done}
                    onCheckedChange={() => toggleChecklistItem(order.id, item.id)}
                    className="mt-0.5"
                  />
                  <span className={`text-sm flex-1 ${item.done ? 'line-through text-muted-foreground/50' : ''}`}>
                    {item.text}
                  </span>
                </div>
              ))}
              <div className="flex items-center gap-2 mt-2">
                <Plus className="size-3 text-muted-foreground/40 shrink-0" />
                <input
                  value={newCheckText}
                  onChange={e => setNewCheckText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAddCheckItem() }}
                  placeholder="Add checklist item..."
                  className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground/40"
                />
              </div>
            </div>
          </div>

          {/* Documents */}
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Documents
            </label>
            <div className="mt-1.5 space-y-2">
              {DOC_TYPES.map(({ key, label, icon: Icon }) => (
                <div key={key} className="flex items-center gap-2 text-sm">
                  <Icon className={`size-4 ${order.docs[key] ? 'text-emerald-400' : 'text-muted-foreground/30'}`} />
                  <span className="flex-1">{label}</span>
                  {order.docs[key] ? (
                    <button
                      onClick={async () => {
                        const path = order.docs[key]
                        if (!path) return
                        if (supabase) {
                          const { data } = await supabase.storage
                            .from('tango-docs')
                            .createSignedUrl(path, 3600)
                          if (data?.signedUrl) {
                            window.open(data.signedUrl, '_blank')
                          }
                        }
                      }}
                      className="text-xs text-emerald-400 hover:text-emerald-300 truncate max-w-[150px] underline underline-offset-2"
                    >
                      {typeof order.docs[key] === 'string' ? order.docs[key]!.split('/').pop() : 'Download'}
                    </button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => handleFileUpload(key)}
                    >
                      <Upload className="size-3 mr-1" />
                      Upload
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.html,.md"
              className="hidden"
              onChange={handleFileSelected}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Notes
            </label>
            {editingNotes ? (
              <textarea
                value={notesValue}
                onChange={e => setNotesValue(e.target.value)}
                onBlur={handleNotesBlur}
                className="mt-1.5 w-full h-24 text-sm bg-transparent border border-border rounded-md p-2 outline-none resize-none"
                autoFocus
              />
            ) : (
              <div
                onClick={() => { setNotesValue(order.notes || ''); setEditingNotes(true) }}
                className="mt-1.5 text-sm text-muted-foreground cursor-text min-h-[40px] rounded-md border border-transparent hover:border-border p-2"
              >
                {order.notes || 'Click to add notes...'}
              </div>
            )}
          </div>

          {/* Delete */}
          <Button
            variant="ghost"
            size="sm"
            className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
            onClick={() => {
              deleteOrder(order.id)
              selectOrder(null)
            }}
          >
            <Trash2 className="size-3 mr-1.5" />
            Delete Order
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
