// Layer: Entry. Responsibility: Orders route entry and delegation. Business logic: NO.
/* eslint-disable react-refresh/only-export-components */
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { ordersQueries } from '../../features/orders/queries'
import { OrdersTable } from '../../features/orders/components/OrdersTable'
import { OrdersFiltersBar } from '../../features/orders/components/OrdersFilters'
import type { OrdersFilters } from '../../features/orders/types'
import { Button } from '@/components/ui/button'
//url parametreleri zod ile validate edildi.
const ordersSearchSchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  pageSize: z.number().int().min(1).optional().default(2),
  q: z.string().optional(),
  status: z.enum(['created', 'assigned', 'picked_up', 'delivered', 'cancelled', 'all']).optional().default('all'),
  sort: z.enum(['eta', 'createdAt']).optional().default('eta'), //burada enum olarak belirtildi fakat union type olarak tanımladık (syntax uzuyor zod'da)
})

export const DEFAULT_SEARCH: OrdersFilters = {
  page: 1,
  pageSize: 2,
  q: '',
  status: 'all',
  sort: 'eta',
}

export const Route = createFileRoute('/orders/')({
  validateSearch: (search) => ordersSearchSchema.parse(search),
  loaderDeps: ({ search }) => ({ search }),
  loader: ({ context: { queryClient }, deps: { search } }) => // Sayfa açılmadan önce veriyi çek veya cache'ten bul 
    queryClient.ensureQueryData(ordersQueries.list(search as OrdersFilters)),
  component: OrdersIndex,
})

function OrdersIndex() {
  const search = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })

  //özellikleri burada vermek yerine queries.ts içerisinde verdik (placeholderdata queryfn vs)
  const { data } = useSuspenseQuery(ordersQueries.list(search as OrdersFilters))

  const setFilters = (newFilters: Partial<OrdersFilters>) => {
    navigate({
      search: (prev) => ({ ...prev, ...newFilters, page: 1 }), // Reset page on filter change
    })
  }

  const handlePageChange = (newPage: number) => {
    navigate({ search: (prev) => ({ ...prev, page: newPage }) })
  }

  return (
    <div className="container mx-auto py-8 px-4">

      <h1 className="text-3xl font-bold mb-6">Orders</h1>

      <OrdersFiltersBar filters={search as OrdersFilters} setFilters={setFilters} />

      <OrdersTable orders={data.items} />

      <div className="flex items-center justify-between py-4">
        <div className="text-sm">
          Page {data.page} of {Math.ceil(data.total / data.pageSize)}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={() => handlePageChange(search.page - 1)}
            disabled={search.page <= 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() => handlePageChange(search.page + 1)}
            disabled={search.page >= Math.ceil(data.total / data.pageSize)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
export default OrdersIndex
