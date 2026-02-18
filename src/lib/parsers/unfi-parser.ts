import type { OrderItem } from '@/lib/types/order'

export interface ParsedUNFIPO {
  poNumber: string | null
  pickupDate: string | null
  shipTo: string | null
  warehouse: string | null
  items: OrderItem[]
  totalValue: number | null
  rawText: string
}

// UNFI VendID → display flavor
const VEND_ID_MAP: Record<string, string> = {
  'MILD': 'Mild',
  'HOTT': 'Hot',
  'HOT': 'Hot',
  'MANG': 'Mango',
  'MANGO': 'Mango',
  'TRUF': 'Truffle',
  'TRUFFLE': 'Truffle',
  'SRIR': 'Sriracha',
  'SRIRACHA': 'Sriracha',
  'THAI': 'Thai',
}

// Description → display flavor
function detectFlavor(description: string): string {
  const upper = description.toUpperCase()
  for (const [key, flavor] of Object.entries(VEND_ID_MAP)) {
    if (upper.includes(key)) return flavor
  }
  return description.trim()
}

function detectWarehouse(text: string): string | null {
  const upper = text.toUpperCase()
  if (upper.includes('HUDSON VALLEY') || upper.includes('MONTGOMERY')) return 'UNFI Hudson Valley'
  if (upper.includes('MORENO VALLEY') || upper.includes('RIVERSIDE')) return 'UNFI Moreno Valley'
  if (upper.includes('CHESTERFIELD')) return 'UNFI Chesterfield'
  if (upper.includes('PROVIDENCE') || upper.includes('RHODE ISLAND')) return 'UNFI Providence'
  return null
}

const MONTH_MAP: Record<string, string> = {
  JAN: '01', FEB: '02', MAR: '03', APR: '04', MAY: '05', JUN: '06',
  JUL: '07', AUG: '08', SEP: '09', OCT: '10', NOV: '11', DEC: '12',
}

function parseDate(text: string): string | null {
  // DD-MMM-YY or DD-MMM-YYYY
  const dmy = text.match(/(\d{1,2})-([A-Z]{3})-(\d{2,4})/i)
  if (dmy) {
    const day = dmy[1].padStart(2, '0')
    const mon = MONTH_MAP[dmy[2].toUpperCase()] || '01'
    let year = dmy[3]
    if (year.length === 2) year = '20' + year
    return `${year}-${mon}-${day}`
  }

  // MM/DD/YYYY or MM/DD/YY
  const mdy = text.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/)
  if (mdy) {
    const mon = mdy[1].padStart(2, '0')
    const day = mdy[2].padStart(2, '0')
    let year = mdy[3]
    if (year.length === 2) year = '20' + year
    return `${year}-${mon}-${day}`
  }

  return null
}

function formatPickupDate(isoDate: string): string {
  const d = new Date(isoDate + 'T12:00:00')
  const month = d.toLocaleDateString('en-US', { month: 'short' })
  return `Pickup: ${month} ${d.getDate()}`
}

export function parseUNFIPO(text: string): ParsedUNFIPO {
  const result: ParsedUNFIPO = {
    poNumber: null,
    pickupDate: null,
    shipTo: null,
    warehouse: null,
    items: [],
    totalValue: null,
    rawText: text,
  }

  // ── PO Number ──────────────────────────────────────────────
  // Try explicit labels first, then any 6-7 digit standalone number
  const poMatch = text.match(/Purchase\s+Order\s+(?:Number|#|No\.?)[\s:]*(\d{6,})/i)
    || text.match(/PO\s*#?\s*:?\s*(\d{6,})/i)
    || text.match(/Order\s*(?:Number|#|No\.?)[\s:]*(\d{6,})/i)
  if (poMatch) result.poNumber = poMatch[1]

  // ── Pickup Date ────────────────────────────────────────────
  // Look for "Pickup Date" label near a date, or "Requested Pickup"
  const pickupMatch = text.match(/(?:Requested\s+)?Pickup\s+Date\s*:?\s*(\d{1,2}-[A-Z]{3}-\d{2,4})/i)
    || text.match(/(?:Requested\s+)?Pickup\s+Date\s*:?\s*(\d{1,2}\/\d{1,2}\/\d{2,4})/i)
  if (pickupMatch) {
    const parsed = parseDate(pickupMatch[1])
    if (parsed) result.pickupDate = parsed
  }

  // Fallback: look for MM/DD/YY pattern after "Pickup" anywhere in flat text
  if (!result.pickupDate) {
    const flatPickup = text.match(/Pickup[^0-9]{0,20}(\d{1,2}\/\d{1,2}\/\d{2,4})/i)
      || text.match(/Pickup[^0-9]{0,20}(\d{1,2}-[A-Z]{3}-\d{2,4})/i)
    if (flatPickup) {
      const parsed = parseDate(flatPickup[1])
      if (parsed) result.pickupDate = parsed
    }
  }

  // Last resort: first DD-MMM-YY found in the entire text
  if (!result.pickupDate) {
    const anyDate = text.match(/(\d{1,2}-[A-Z]{3}-\d{2,4})/i)
    if (anyDate) {
      const parsed = parseDate(anyDate[1])
      if (parsed) result.pickupDate = parsed
    }
  }

  // ── Warehouse ──────────────────────────────────────────────
  result.warehouse = detectWarehouse(text)

  // ── Ship To ────────────────────────────────────────────────
  const shipToMatch = text.match(/Ship\s+To[:\s]+([^,]+,\s*\w[\w\s]*,\s*[A-Z]{2}\s+\d{5})/i)
  if (shipToMatch) {
    result.shipTo = shipToMatch[1].trim()
  }

  // ── Line Items ─────────────────────────────────────────────
  // Strategy 1: UNFI tabular format — product# + qty + VendID + description + price
  // pdfjs flattens to: "224137 1 84 84 MILD 1 6 8 OZ TANGO CHILE SAUCE,MILD 29.00 29.00 2,436.00"
  // Pattern: 6-digit prod#, then numbers, then VendID, then CHILE SAUCE,FLAVOR, then prices
  const lineItemRegex = /(\d{6})\s+\d+\s+(\d+)\s+\d+\s+(\w+)\s+.*?CHILE\s+SAUCE\s*[,.]?\s*(\w+)\s+([\d.]+)\s+[\d.]+\s+([\d,.]+)/gi
  let match
  while ((match = lineItemRegex.exec(text)) !== null) {
    const qty = parseInt(match[2])
    const vendId = match[3].toUpperCase()
    const descFlavor = match[4]
    const unitCost = parseFloat(match[5])

    // Use VendID first, fall back to description flavor
    const flavor = VEND_ID_MAP[vendId] || detectFlavor(descFlavor)

    result.items.push({
      sku: match[1],
      flavor,
      cases: qty,
      price: unitCost,
      packed: 0,
    })
  }

  // Strategy 2: If no items found with tabular format, try simpler pattern
  // Look for "CHILE SAUCE" + flavor + nearby numbers
  if (result.items.length === 0) {
    const simpleRegex = /CHILE\s+SAUCE\s*[,.]?\s*(\w+)/gi
    const flavorsFound: string[] = []
    let simpleMatch
    while ((simpleMatch = simpleRegex.exec(text)) !== null) {
      flavorsFound.push(simpleMatch[1])
    }

    if (flavorsFound.length > 0) {
      // Extract all numbers from the text to pair with flavors
      // Look for quantity + price patterns near each flavor mention
      for (const rawFlavor of flavorsFound) {
        const flavor = detectFlavor(rawFlavor)

        // Find the context around this flavor mention for numbers
        const flavorIdx = text.toUpperCase().indexOf(`CHILE SAUCE,${rawFlavor.toUpperCase()}`)
          || text.toUpperCase().indexOf(`CHILE SAUCE, ${rawFlavor.toUpperCase()}`)
        if (flavorIdx === -1) continue

        // Look at 200 chars before the flavor for the quantity, and after for price
        const before = text.substring(Math.max(0, flavorIdx - 200), flavorIdx)
        const after = text.substring(flavorIdx, flavorIdx + 200)

        // Quantity: last multi-digit integer before the flavor
        const qtyNums = before.match(/\b(\d{2,3})\b/g)
        const qty = qtyNums ? parseInt(qtyNums[qtyNums.length - 1]) : 0

        // Price: first decimal number after the flavor
        const priceMatch = after.match(/(\d+\.\d{2})/)
        const price = priceMatch ? parseFloat(priceMatch[1]) : 29

        if (qty > 0) {
          result.items.push({
            sku: `TH-${flavor.toUpperCase().slice(0, 3)}`,
            flavor,
            cases: qty,
            price,
            packed: 0,
          })
        }
      }
    }
  }

  // ── Total Value ────────────────────────────────────────────
  // Look for "Total Order Net" or final dollar amount
  const totalMatch = text.match(/Total\s+Order\s+Net\s+\$?\$?\s*([\d,]+\.\d{2})/i)
    || text.match(/Order\s+Total\s*:?\s*\$?\s*([\d,]+\.\d{2})/i)
    || text.match(/Net\s+\$\$\s*([\d,]+\.\d{2})/i)
  if (totalMatch) {
    result.totalValue = parseFloat(totalMatch[1].replace(/,/g, ''))
  }

  // Fallback: find the largest dollar amount in the text (likely the total)
  if (!result.totalValue) {
    const amounts = text.match(/\d{1,3}(?:,\d{3})*\.\d{2}/g)
    if (amounts) {
      const parsed = amounts.map(a => parseFloat(a.replace(/,/g, '')))
      result.totalValue = Math.max(...parsed)
    }
  }

  // Last resort: compute from items
  if (!result.totalValue && result.items.length > 0) {
    result.totalValue = result.items.reduce((sum, item) => sum + item.cases * item.price, 0)
  }

  return result
}

// Format total as display string
export function formatOrderValue(value: number): string {
  return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

// Format pickup date for display
export function formatOrderDateStr(isoDate: string | null): string {
  if (!isoDate) return 'No date'
  return formatPickupDate(isoDate)
}

// Extract text from a PDF file using pdf.js
export async function extractPdfText(file: File): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist')

  // Set worker source
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

  const pages: string[] = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const text = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
    pages.push(text)
  }

  return pages.join('\n')
}
