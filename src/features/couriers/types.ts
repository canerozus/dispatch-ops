// Layer: Domain. Responsibility: Courier domain types and invariants. Business logic: YES.
export type CourierId = string & { readonly __brand: 'CourierId' }
export type OrderId = string & { readonly __brand: 'OrderId' }

export type CourierSortField = 'name' | 'region' | 'vehicle' | 'assignedOrderCount'
export type SortDirection = 'asc' | 'desc'

export interface Courier {
  id: CourierId
  name: string
  phone: string
  vehicle: string
  region: string
  assignedOrderIds: OrderId[]
  assignedOrderCount: number
}

export interface CreateCourierInput {
  name: string
  phone: string
  vehicle: string
  region: string
}

export interface CouriersListFilters {
  page: number
  pageSize: number
  searchTerm: string
  region: string
  vehicle: string
  sortField: CourierSortField
  sortDirection: SortDirection
}

export interface Paginated<T> {
  items: T[]
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}
