'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { OrderPipeline } from '@/components/orders/order-pipeline'
import { OrderDropZone } from '@/components/orders/order-drop-zone'
import { OrderDetail } from '@/components/orders/order-detail'
import { OrderForm } from '@/components/orders/order-form'
import { InventoryDashboard } from '@/components/orders/inventory-dashboard'
import { DemandSummary } from '@/components/orders/demand-summary'
import { GapAnalysis } from '@/components/orders/gap-analysis'
import { OllaPlanner } from '@/components/orders/olla-planner'
import { DeepOrderGenerator } from '@/components/orders/deep-order-generator'
import { PackReadiness } from '@/components/orders/pack-readiness'
import { PackPlan } from '@/components/orders/pack-plan'
import { ShipTracker } from '@/components/orders/ship-tracker'
import { PaymentTracker } from '@/components/orders/payment-tracker'
import { useOrderStore } from '@/store/order-store'
import { useInventoryStore } from '@/store/inventory-store'
import { useCookPlanStore } from '@/store/cook-plan-store'

export default function OrdersPage() {
  const { initialized, fetchOrders, orders } = useOrderStore()
  const fetchInventory = useInventoryStore(s => s.fetchInventory)
  const fetchCookPlan = useCookPlanStore(s => s.fetchCookPlan)
  const [tab, setTab] = useState('orders')

  useEffect(() => {
    fetchOrders()
    fetchInventory()
    fetchCookPlan()
  }, [fetchOrders, fetchInventory, fetchCookPlan])

  return (
    <>
      <PageHeader title="Ops" count={orders.length}>
        <OrderForm />
      </PageHeader>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
        {!initialized ? (
          <div className="text-sm text-muted-foreground text-center py-8">Loading...</div>
        ) : (
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="w-full">
              <TabsTrigger value="orders" className="flex-1">Orders</TabsTrigger>
              <TabsTrigger value="inventory" className="flex-1">Inventory</TabsTrigger>
              <TabsTrigger value="cook" className="flex-1">Cook</TabsTrigger>
              <TabsTrigger value="pack" className="flex-1">Pack</TabsTrigger>
              <TabsTrigger value="ship" className="flex-1">Ship & Pay</TabsTrigger>
            </TabsList>

            {/* ── Orders Tab ── */}
            <TabsContent value="orders">
              <div className="space-y-4 pt-4">
                <OrderDropZone />
                <OrderPipeline />
              </div>
            </TabsContent>

            {/* ── Inventory Tab ── */}
            <TabsContent value="inventory">
              <div className="space-y-6 pt-4">
                <InventoryDashboard />
              </div>
            </TabsContent>

            {/* ── Cook Tab ── */}
            <TabsContent value="cook">
              <div className="space-y-6 pt-4">
                <DemandSummary />
                <GapAnalysis />
                <OllaPlanner />
                <DeepOrderGenerator />
              </div>
            </TabsContent>

            {/* ── Pack Tab ── */}
            <TabsContent value="pack">
              <div className="space-y-6 pt-4">
                <PackReadiness />
                <PackPlan />
              </div>
            </TabsContent>

            {/* ── Ship & Pay Tab ── */}
            <TabsContent value="ship">
              <div className="space-y-6 pt-4">
                <ShipTracker />
                <PaymentTracker />
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Detail sheet (works across all tabs) */}
      <OrderDetail />
    </>
  )
}
