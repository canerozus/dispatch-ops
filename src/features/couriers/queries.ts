// Layer: Application/Feature. Responsibility: Courier query keys and query options. Business logic: YES.
import { queryOptions } from '@tanstack/react-query'
import { couriersApi } from '@/api/legacy/couriers'
import type { CourierId, CouriersListFilters } from './types'

export const couriersKeys = {
  all: ['couriers'] as const,
  // [MP-BG-1]
  list: (filters: CouriersListFilters) => [...couriersKeys.all, 'list', filters] as const,
  // [MP-BG-1]
  detail: (id: CourierId) => [...couriersKeys.all, 'detail', id] as const,
}

export const couriersQueries = {
  // [MP-BG-1]
  list: (filters: CouriersListFilters) => queryOptions({
    queryKey: couriersKeys.list(filters),
    queryFn: () => couriersApi.list(filters),
    placeholderData: (prev) => prev,
    staleTime: 1000 * 30,
  }),
  // [MP-BG-1]
  detail: (id: CourierId) => queryOptions({
    queryKey: couriersKeys.detail(id),
    queryFn: () => couriersApi.detail(id),
    staleTime: 1000 * 30,
  }),
}
