'use client'

import { useEffect } from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { OrderPipeline } from '@/components/orders/order-pipeline'
import { OrderDropZone } from '@/components/orders/order-drop-zone'
import { OrderDetail } from '@/components/orders/order-detail'
import { OrderForm } from '@/components/orders/order-form'
import { ProductionDemand } from '@/components/orders/production-demand'
import { useOrderStore } from '@/store/order-store'

export default function OrdersPage() {
  const { initialized, fetchOrders, orders } = useOrderStore()

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  return (
    <>
      <PageHeader title="Orders" count={orders.length}>
        <OrderForm />
      </PageHeader>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        {!initialized ? (
          <div className="text-sm text-muted-foreground text-center py-8">Loading...</div>
        ) : (
          <div className="space-y-6">
            {/* Drop zone */}
            <OrderDropZone />

            {/* Production demand */}
            <ProductionDemand />

            {/* Pipeline kanban */}
            <OrderPipeline />
          </div>
        )}
      </div>

      {/* Detail sheet */}
      <OrderDetail />
    </>
  )
}
