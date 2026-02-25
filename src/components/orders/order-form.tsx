'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useOrderStore } from '@/store/order-store'
import type { CarrierType } from '@/lib/types/order'

const CHANNEL_OPTIONS = [
  'UNFI Hudson Valley',
  'UNFI Moreno Valley',
  'EXP Corp',
  'Amazon',
  'Costco',
  'Faire',
  'Mable',
  'DTC',
  'Other',
]

const CARRIER_OPTIONS: { value: string; label: string }[] = [
  { value: 'none', label: 'Not set' },
  { value: 'unfi', label: 'UNFI (their carrier)' },
  { value: 'daylight', label: 'Daylight Transport' },
  { value: 'pickup', label: 'Customer pickup' },
]

export function OrderForm() {
  const [open, setOpen] = useState(false)
  const { addOrder } = useOrderStore()

  const [channel, setChannel] = useState('UNFI Hudson Valley')
  const [poNumber, setPoNumber] = useState('')
  const [value, setValue] = useState('')
  const [dateStr, setDateStr] = useState('')
  const [shipTo, setShipTo] = useState('')
  const [carrier, setCarrier] = useState('none')

  const reset = () => {
    setChannel('UNFI Hudson Valley')
    setPoNumber('')
    setValue('')
    setDateStr('')
    setShipTo('')
    setCarrier('none')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!poNumber.trim()) return

    const numericValue = parseFloat(value.replace(/[^0-9.]/g, ''))
    const displayValue = numericValue ? `$${numericValue.toLocaleString('en-US', { minimumFractionDigits: 0 })}` : '$0'

    let displayDate = 'No date'
    if (dateStr) {
      const d = new Date(dateStr + 'T12:00:00')
      const month = d.toLocaleDateString('en-US', { month: 'short' })
      displayDate = `Pickup: ${month} ${d.getDate()}`
    }

    await addOrder({
      channel,
      title: `PO #${poNumber.replace(/^#/, '')}`,
      value: displayValue,
      dateStr: displayDate,
      stage: 'order',
      shipTo: shipTo || null,
      notes: null,
      items: [],
      checklist: [],
      docs: { po: null, bol: null, inv: null },
      carrier: (carrier === 'none' ? null : carrier) as CarrierType,
      pickupDate: dateStr || null,
      trackingNumber: null,
      invoiceSentAt: null,
      invoiceNumber: null,
      expectedPayDate: null,
      paidAt: null,
      paidAmount: null,
    })

    reset()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) reset() }}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
          <Plus className="size-3" />
          Add
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>New Order</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <div>
              <label className="text-xs text-muted-foreground">Channel</label>
              <Select value={channel} onValueChange={setChannel}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHANNEL_OPTIONS.map(ch => (
                    <SelectItem key={ch} value={ch}>{ch}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground">PO Number</label>
              <Input
                value={poNumber}
                onChange={e => setPoNumber(e.target.value)}
                placeholder="1102034"
                className="mt-1"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Value ($)</label>
                <Input
                  value={value}
                  onChange={e => setValue(e.target.value)}
                  placeholder="3,480"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Pickup Date</label>
                <Input
                  type="date"
                  value={dateStr}
                  onChange={e => setDateStr(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground">Carrier</label>
              <Select value={carrier} onValueChange={setCarrier}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CARRIER_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground">Ship To</label>
              <Input
                value={shipTo}
                onChange={e => setShipTo(e.target.value)}
                placeholder="Warehouse address (optional)"
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" size="sm">Create Order</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
