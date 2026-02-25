'use client'

import { SauceInventory } from './sauce-inventory'
import { IngredientInventory } from './ingredient-inventory'
import { PackagingInventory } from './packaging-inventory'

export function InventoryDashboard() {
  return (
    <div className="space-y-6">
      <SauceInventory />
      <IngredientInventory />
      <PackagingInventory />
    </div>
  )
}
