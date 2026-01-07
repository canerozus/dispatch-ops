import { AssignCourierDialog } from '../../features/orders/components/AssignCourierDialog'

// ... existing imports

// ... Route definition

function OrderDetail() {
  const { orderId } = Route.useParams()
  const { data: order } = useSuspenseQuery(ordersQueries.detail(orderId))

  return (
    <div className="container mx-auto py-8 px-4">
      {/* ... header ... */}
      <div className="mb-6">
        <Button variant="ghost" asChild className="pl-0 hover:bg-transparent hover:underline">
            <Link to="/orders" search={{ page: 1, pageSize: 10, status: 'all', sort: 'eta' }}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Orders
            </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Order {order.trackingId}</h1>
                <div className="flex items-center gap-2 text-muted-foreground">
                    <span>{order.customerName}</span>
                    <span>•</span>
                    <span>{new Date(order.createdAt).toLocaleString()}</span>
                </div>
            </div>

            <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
                <h3 className="font-semibold mb-4">Delivery Details</h3>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-1 text-sm">
                        <span className="text-muted-foreground">Status:</span>
                        <div><StatusBadge status={order.status} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-sm">
                        <span className="text-muted-foreground">ETA:</span>
                        <span>{order.etaMinutes} minutes</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-sm">
                        <span className="text-muted-foreground">Address:</span>
                        <span>{order.address}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-sm">
                        <span className="text-muted-foreground">Courier:</span>
                         {order.courierId ? (
                            <span className="font-medium text-primary">{order.courierId}</span> 
                          ) : (
                            <span className="italic text-muted-foreground">Not assigned</span>
                          )}
                    </div>
                </div>
            </div>
            
             <div className="flex justify-end">
                <AssignCourierDialog 
                    orderId={order.id} 
                    currentCourierId={order.courierId} 
                    trigger={<Button size="lg">Assign Courier</Button>}
                />
            </div>
        </div>

        <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm"> 
            <h3 className="font-semibold mb-6">Timeline</h3>
            <OrderTimeline events={order.events} />
        </div>
      </div>
    </div>
  )
}
