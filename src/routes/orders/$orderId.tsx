// Layer: Entry. Responsibility: Order detail route entry and delegation. Business logic: NO.
import { createFileRoute, Link } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { ordersQueries } from '../../features/orders/queries'
import { OrderTimeline } from '../../features/orders/components/OrderTimeline'
import { StatusBadge } from '../../features/orders/components/StatusBadge'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { AssignCourierDialog } from '../../features/orders/components/AssignCourierDialog'

export const Route = createFileRoute('/orders/$orderId')({
  loader: ({ context: { queryClient }, params: { orderId } }) =>
    queryClient.ensureQueryData(ordersQueries.detail(orderId)),
  component: OrderDetail,
})

function OrderDetail() {
  const { orderId } = Route.useParams()
  const { data: order } = useSuspenseQuery(ordersQueries.detail(orderId))

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button asChild className="pl-0 hover:bg-transparent hover:underline">
          <Link to="/orders" search={{ page: 1, pageSize: 2, status: 'all', sort: 'eta' }}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-6">

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Order {order.trackingId}</h1>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span>{order.customerName}</span>
                <span>•</span>
                <span>{new Date(order.createdAt).toLocaleString()}</span>
              </div>
              <div>
                <AssignCourierDialog
                  orderId={order.id}
                  currentCourierId={order.courierId}
                />
              </div>
            </div>
          </div>

          <div className="p-6 border rounded-lg">
            <h3 className="font-semibold mb-4">Delivery Details</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-1 text-sm">
                <span>Status:</span>
                <div><StatusBadge status={order.status} /></div>
              </div>
              <div className="grid grid-cols-2 gap-1 text-sm">
                <span>ETA:</span>
                <span>{order.etaMinutes} minutes</span>
              </div>
              <div className="grid grid-cols-2 gap-1 text-sm">
                <span>Address:</span>
                <span>{order.address}</span>
              </div>
              <div className="grid grid-cols-2 gap-1 text-sm">
                <span>Courier:</span>
                {order.courierId ? (
                  <span className="font-medium">{order.courierId}</span>
                ) : (
                  <span className="italic text-muted-foreground">Not assigned</span>
                )}
              </div>
            </div>
          </div>

        </div>

        <div className="p-6 border rounded-lg">
          <h3 className="font-semibold mb-6">Timeline</h3>
          <OrderTimeline events={order.events} />
        </div>
      </div>
    </div>
  )
}
