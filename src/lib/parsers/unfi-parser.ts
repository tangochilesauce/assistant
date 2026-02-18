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

// Flavor mapping: UNFI description → display flavor
const FLAVOR_MAP: Record<string, string> = {
  'MILD': 'Mild',
  'HOT': 'Hot',
  'MANGO': 'Mango',
  'TRUFFLE': 'Truffle',
  'SRIRACHA': 'Sriracha',
  'THAI': 'Thai',
}

function detectFlavor(description: string): string {
  const upper = description.toUpperCase()
  for (const [key, flavor] of Object.entries(FLAVOR_MAP)) {
    if (upper.includes(key)) return flavor
  }
  return description.trim()
}

function detectWarehouse(text: string): string | null {
  const upper = text.toUpperCase()
  if (upper.includes('HUDSON VALLEY') || upper.includes('CHESTERFIELD')) return 'UNFI Hudson Valley'
  if (upper.includes('MORENO VALLEY') || upper.includes('RIVERSIDE')) return 'UNFI Moreno Valley'
  if (upper.includes('PROVIDENCE') || upper.includes('RHODE ISLAND')) return 'UNFI Providence'
  return null
}

function parseDate(text: string): string | null {
  // Match patterns like "DD-MMM-YY", "DD-MMM-YYYY", "MM/DD/YYYY", "MM/DD/YY"
  const monthMap: Record<string, string> = {
    JAN: '01', FEB: '02', MAR: '03', APR: '04', MAY: '05', JUN: '06',
    JUL: '07', AUG: '08', SEP: '09', OCT: '10', NOV: '11', DEC: '12',
  }

  // DD-MMM-YY or DD-MMM-YYYY
  const dmy = text.match(/(\d{1,2})-([A-Z]{3})-(\d{2,4})/i)
  if (dmy) {
    const day = dmy[1].padStart(2, '0')
    const mon = monthMap[dmy[2].toUpperCase()] || '01'
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

  // PO Number
  const poMatch = text.match(/Purchase\s+Order\s+(?:Number|#|No\.?)[\s:]*(\d+)/i)
    || text.match(/PO\s*#?\s*:?\s*(\d{5,})/i)
    || text.match(/Order\s*(?:Number|#|No\.?)[\s:]*(\d+)/i)
  if (poMatch) result.poNumber = poMatch[1]

  // Pickup date
  const dateMatch = text.match(/Requested\s+Pickup\s+Date[\s:]*([^\n]+)/i)
    || text.match(/Pickup\s+Date[\s:]*([^\n]+)/i)
    || text.match(/Ship\s+Date[\s:]*([^\n]+)/i)
    || text.match(/Delivery\s+Date[\s:]*([^\n]+)/i)
  if (dateMatch) {
    const parsed = parseDate(dateMatch[1].trim())
    if (parsed) result.pickupDate = parsed
  }

  // If no explicit date found, try to find any date in the text
  if (!result.pickupDate) {
    const anyDate = text.match(/(\d{1,2}-[A-Z]{3}-\d{2,4})/i)
      || text.match(/(\d{1,2}\/\d{1,2}\/\d{2,4})/)
    if (anyDate) {
      const parsed = parseDate(anyDate[1])
      if (parsed) result.pickupDate = parsed
    }
  }

  // Warehouse detection
  result.warehouse = detectWarehouse(text)

  // Ship-to: grab the address block after "Ship To" if present
  const shipToMatch = text.match(/Ship\s+To[\s:]*\n?([^\n]+(?:\n[^\n]+){0,3})/i)
  if (shipToMatch) {
    result.shipTo = shipToMatch[1].replace(/\n/g, ', ').trim()
  }

  // Line items: look for rows with chile sauce/hot sauce patterns + quantities
  // UNFI format: description, then case quantity, then price columns
  const lines = text.split('\n')
  for (const line of lines) {
    // Match lines containing sauce flavors with numbers
    const sauceMatch = line.match(/(?:CHILE\s+SAUCE|HOT\s+SAUCE|TANGO)[,\s]+(\w+)/i)
    if (sauceMatch) {
      const flavor = detectFlavor(sauceMatch[1])
      // Extract numbers from the line — look for case count and price
      const numbers = line.match(/\d+(?:\.\d+)?/g)?.map(Number) || []

      if (numbers.length >= 2) {
        // Heuristic: the case count is typically a whole number, price has decimals or is a known value
        const cases = numbers.find(n => n > 0 && n <= 500 && Number.isInteger(n)) || numbers[0]
        const price = numbers.find(n => n > 0 && n !== cases) || 25

        result.items.push({
          sku: `TH-${flavor.toUpperCase().slice(0, 3)}`,
          flavor,
          cases,
          price,
          packed: 0,
        })
      }
    }
  }

  // Total value
  const totalMatch = text.match(/Total\s+(?:Order\s+)?Net\s*\$?\$?\s*([\d,]+\.?\d*)/i)
    || text.match(/(?:Grand\s+)?Total[\s:]*\$?\s*([\d,]+\.\d{2})/i)
    || text.match(/Total[\s:]*\$\s*([\d,]+\.?\d*)/i)
  if (totalMatch) {
    result.totalValue = parseFloat(totalMatch[1].replace(/,/g, ''))
  }

  // If no total from text, compute from items
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
