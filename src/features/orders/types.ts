export type OrderStatus = 'created' | 'assigned' | 'picked_up' | 'delivered' | 'cancelled'

export interface OrderEvent {
  at: string // ISO date string
  status: OrderStatus
  note?: string
}

export interface Order {
  id: string
  trackingId: string
  customerName: string
  address: string
  etaMinutes: number
  status: OrderStatus
  courierId?: string
  createdAt: string // ISO date string
  events: OrderEvent[]
}

export interface Courier {
  id: string
  name: string
}

export interface Paginated<T> {
  items: T[]
  page: number
  pageSize: number
  total: number
}

export interface OrdersFilters {
  q?: string
  status?: OrderStatus | 'all'
  sort?: 'eta' | 'createdAt'
  page: number
  pageSize: number
}
