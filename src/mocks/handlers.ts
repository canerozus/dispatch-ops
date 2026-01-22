// Layer: Infrastructure. Responsibility: MSW handler registration. Business logic: NO.
import { http, HttpResponse, delay } from 'msw'
import type { Order } from '../features/orders/types'
import { courierHandlers } from './handlers/couriers'


const MOCK_ORDERS: Order[] = [
  {
    id: '1',
    trackingId: 'TRK-98765',
    customerName: 'Ahmet Yılmaz',
    address: 'Atatürk Cad. No:12, İstanbul',
    etaMinutes: 15,
    status: 'created',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    events: [
        { at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), status: 'created', note: 'Order received' }
    ]
  },
  {
    id: '2',
    trackingId: 'TRK-12345',
    customerName: 'Zeynep Kaya',
    address: 'Cumhuriyet Mah. 5. Sokak, Ankara',
    etaMinutes: 45,
    status: 'assigned',
    courierId: 'c1',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    events: [
        { at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), status: 'created' },
        { at: new Date(Date.now() - 1000 * 60 * 90).toISOString(), status: 'assigned', note: 'Courier assigned' }
    ]
  },
  {
    id: '3',
    trackingId: 'TRK-55555',
    customerName: 'Fatma Şahin',
    address: 'Lale Apt. Daire 5, İzmir',
    etaMinutes: 5,
    status: 'picked_up',
    courierId: 'c2',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    events: [
        { at: new Date(Date.now() - 1000 * 60 * 45).toISOString(), status: 'created' },
        { at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), status: 'assigned' },
        { at: new Date(Date.now() - 1000 * 60 * 15).toISOString(), status: 'picked_up' }
    ]
  },
  {
    id: '4',
    trackingId: 'TRK-60175',
    customerName: 'Mustafa Kılıç',
    address: 'Kızılcahamam Mah. 10. Sokak, Ankara',
    etaMinutes: 0, // 0 minutes
    status: 'delivered',
    courierId: 'c3',
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    events: [
        { at: new Date(Date.now() - 1000 * 60 * 10).toISOString(), status: 'created' },
        { at: new Date(Date.now() - 1000 * 60 * 5).toISOString(), status: 'assigned' },
        { at: new Date(Date.now()).toISOString(), status: 'delivered' }
    ]
  }
]

export const handlers = [
  http.get('/api/health', () => {
    return HttpResponse.json({ status: 'ok' })
  }),

  http.get('/api/orders', async ({ request }) => {
    await delay(300) // Simulate network latency

    const url = new URL(request.url)
    const q = url.searchParams.get('q')?.toLowerCase()
    const status = url.searchParams.get('status')
    const sort = url.searchParams.get('sort') || 'eta'
    const page = Number(url.searchParams.get('page') || '1')
    const pageSize = Number(url.searchParams.get('pageSize') || '2')

    let filtered = [...MOCK_ORDERS]

    // Filter
    if (status && status !== 'all') {
      filtered = filtered.filter(o => o.status === status)
    }
    if (q) {
      filtered = filtered.filter(o => 
        o.trackingId.toLowerCase().includes(q) || 
        o.customerName.toLowerCase().includes(q)
      )
    }

    // Sort
    filtered.sort((a, b) => {
      if (sort === 'createdAt') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
      return a.etaMinutes - b.etaMinutes // Default 'eta'
    })

    // Pagination
    const total = filtered.length
    const start = (page - 1) * pageSize
    const paginatedItems = filtered.slice(start, start + pageSize)

    return HttpResponse.json({
      items: paginatedItems,
      page,
      pageSize,
      total
    })
  }),

  http.get('/api/orders/:id', async ({ params }) => {
    await delay(200)
    const { id } = params
    const order = MOCK_ORDERS.find(o => o.id === id)

    if (!order) {
      return new HttpResponse(null, { status: 404 })
    }

    return HttpResponse.json(order)
  }),

  http.post('/api/orders/:id/assign', async ({ params, request }) => {
    await delay(500)
    const { id } = params
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body = await request.json() as any
    const { courierId } = body

    const orderIndex = MOCK_ORDERS.findIndex(o => o.id === id)
    if (orderIndex === -1) {
      return new HttpResponse(null, { status: 404 })
    }

    const order = MOCK_ORDERS[orderIndex]
    const updatedOrder: Order = {
      ...order,
      courierId,
      status: 'assigned',
      events: [
        ...order.events,
        {
          at: new Date().toISOString(),
          status: 'assigned',
          note: 'Assigned to courier'
        }
      ]
    }

    MOCK_ORDERS[orderIndex] = updatedOrder
    return HttpResponse.json(updatedOrder)
  }),
  ...courierHandlers,
]
