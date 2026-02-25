'use client'

import { useState, useCallback } from 'react'
import { FileUp, Loader2 } from 'lucide-react'
import { extractPdfText, parseUNFIPO, formatOrderValue, formatOrderDateStr } from '@/lib/parsers/unfi-parser'
import { useOrderStore } from '@/store/order-store'

export function OrderDropZone() {
  const { addOrder } = useOrderStore()
  const [isDragOver, setIsDragOver] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    setError(null)

    const file = e.dataTransfer.files[0]
    if (!file) return

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please drop a PDF file')
      return
    }

    setParsing(true)
    try {
      const text = await extractPdfText(file)
      const parsed = parseUNFIPO(text)

      if (!parsed.poNumber && parsed.items.length === 0) {
        setError('Could not parse PO from this PDF. Try adding manually.')
        setParsing(false)
        return
      }

      const warehouse = parsed.warehouse || 'UNFI'
      const value = parsed.totalValue ? formatOrderValue(parsed.totalValue) : '$0'
      const dateStr = formatOrderDateStr(parsed.pickupDate)

      await addOrder({
        channel: warehouse,
        title: `PO #${parsed.poNumber || 'Unknown'}`,
        value,
        dateStr,
        stage: 'order',
        shipTo: parsed.shipTo,
        notes: null,
        items: parsed.items,
        checklist: [],
        docs: { po: file.name, bol: null, inv: null },
        carrier: warehouse.startsWith('UNFI') ? 'unfi' : null,
        pickupDate: parsed.pickupDate || null,
        trackingNumber: null,
        invoiceSentAt: null,
        invoiceNumber: null,
        expectedPayDate: null,
        paidAt: null,
        paidAmount: null,
      })

      setParsing(false)
    } catch (err) {
      console.error('PDF parse error:', err)
      const msg = err instanceof Error ? err.message : String(err)
      setError(`Failed to parse PDF: ${msg.slice(0, 120)}`)
      setParsing(false)
    }
  }, [addOrder])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false)
  }, [])

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`relative rounded-lg border-2 border-dashed transition-colors ${
        isDragOver
          ? 'border-orange-400 bg-orange-400/5'
          : 'border-border hover:border-muted-foreground/30'
      } ${parsing ? 'pointer-events-none opacity-60' : ''}`}
    >
      <div className="flex items-center justify-center gap-3 px-4 py-4">
        {parsing ? (
          <>
            <Loader2 className="size-5 text-orange-400 animate-spin" />
            <span className="text-sm text-muted-foreground">Parsing PO...</span>
          </>
        ) : (
          <>
            <FileUp className={`size-5 ${isDragOver ? 'text-orange-400' : 'text-muted-foreground/40'}`} />
            <span className="text-sm text-muted-foreground">
              Drop UNFI PO here
            </span>
          </>
        )}
      </div>
      {error && (
        <div className="px-4 pb-3 text-xs text-red-400 text-center">
          {error}
        </div>
      )}
    </div>
  )
}
