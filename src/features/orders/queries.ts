import { queryOptions } from '@tanstack/react-query'
import { get } from '../../api/http'
import type { Order, Paginated, OrdersFilters } from './types'

export const ordersKeys = {
  all: ['orders'] as const,
  list: (filters: OrdersFilters) => [...ordersKeys.all, 'list', filters] as const,
  detail: (id: string) => [...ordersKeys.all, 'detail', id] as const,
}

export const ordersQueries = {
  list: (filters: OrdersFilters) => queryOptions({
    queryKey: ordersKeys.list(filters),
    queryFn: () => {
      const params = new URLSearchParams()
      if (filters.q) params.set('q', filters.q)
      if (filters.status && filters.status !== 'all') params.set('status', filters.status)
      if (filters.sort) params.set('sort', filters.sort)
      params.set('page', filters.page.toString())
      params.set('pageSize', filters.pageSize.toString())

      return get<Paginated<Order>>(`/api/orders?${params.toString()}`)
    },
    placeholderData: (prev) => prev,
  }),
  detail: (id: string) => queryOptions({
    queryKey: ordersKeys.detail(id),
    queryFn: () => get<Order>(`/api/orders/${id}`),
  }),
}
