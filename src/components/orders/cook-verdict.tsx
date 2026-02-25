'use client'

import { useMemo } from 'react'
import { useCookCalculations } from '@/hooks/use-cook-calculations'
import { FLAVORS } from '@/data/tango-constants'

const GOOD_LINES = [
  "You're good to go big chief",
  "Nothing to cook, nothing to sweat",
  "Sauce math checks out. You're golden",
  "All accounted for. Just pack and stack",
  "Zero bottles short. That's a W",
]

export function CookVerdict() {
  const { gaps, totalGap } = useCookCalculations()

  const verdict = useMemo(() => {
    if (totalGap > 0) {
      const shortFlavors = FLAVORS.filter(f => (gaps[f] || 0) > 0)
      if (shortFlavors.length === 1) {
        return `${totalGap.toLocaleString()} bottles short on ${shortFlavors[0]}. Fire up the olla`
      }
      return `${totalGap.toLocaleString()} bottles short across ${shortFlavors.join(', ')}. Time to cook`
    }
    return GOOD_LINES[Math.floor(Math.random() * GOOD_LINES.length)]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalGap])

  return (
    <div className="text-sm text-muted-foreground italic text-center py-2">
      {verdict}
    </div>
  )
}
