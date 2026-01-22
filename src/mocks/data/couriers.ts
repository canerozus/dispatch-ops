// Layer: Infrastructure. Responsibility: In-memory courier data store and invariants. Business logic: YES.
import type {
  Courier,
  CourierId,
  CouriersListFilters,
  CreateCourierInput,
  OrderId,
  Paginated,
} from '@/features/couriers/types'
import { CouriersError } from '@/api/legacy/couriers.validators'

export const MAX_COURIERS = 1000

const baseCouriers: Courier[] = [
  {
    id: 'c-1' as CourierId,
    name: 'Alex Morgan',
    phone: '555-0101',
    vehicle: 'van',
    region: 'north',
    assignedOrderIds: [],
    assignedOrderCount: 0,
  },
  {
    id: 'c-2' as CourierId,
    name: 'Jordan Lee',
    phone: '555-0102',
    vehicle: 'bike',
    region: 'east',
    assignedOrderIds: ['o-1' as OrderId],
    assignedOrderCount: 1,
  },
  {
    id: 'c-3' as CourierId,
    name: 'Casey Kim',
    phone: '555-0103',
    vehicle: 'car',
    region: 'south',
    assignedOrderIds: [],
    assignedOrderCount: 0,
  },
]

const couriersStore: Courier[] = [...baseCouriers]

// [MP-BG-1]
const ensureListCapacity = (couriers: Courier[]) => {
  if (couriers.length > MAX_COURIERS) {
    throw new CouriersError('COURIER_CAPACITY_EXCEEDED')
  }
}

// [MP-BG-2]
const ensureCreateCapacity = (couriers: Courier[]) => {
  if (couriers.length >= MAX_COURIERS) {
    throw new CouriersError('COURIER_CAPACITY_EXCEEDED')
  }
}

// [MP-BG-2]
export const enforceCourierInvariant = (courier: Courier): Courier => {
  const derivedCount = courier.assignedOrderIds.length
  if (courier.assignedOrderCount !== derivedCount) {
    throw new CouriersError('COURIER_DATA_INTEGRITY')
  }
  return {
    ...courier,
    assignedOrderCount: derivedCount,
  }
}

// [MP-BG-1]
const applyFilters = (couriers: Courier[], filters: CouriersListFilters) => {
  const searchTerm = filters.searchTerm.toLowerCase()
  const region = filters.region.toLowerCase()
  const vehicle = filters.vehicle.toLowerCase()

  return couriers.filter((courier) => {
    const nameMatch = courier.name.toLowerCase().includes(searchTerm)
    const vehicleMatch = courier.vehicle.toLowerCase().includes(searchTerm)
    const regionFilterMatch = region === '' || courier.region.toLowerCase().includes(region)
    const vehicleFilterMatch = vehicle === '' || courier.vehicle.toLowerCase().includes(vehicle)
    const searchMatch = searchTerm === '' || nameMatch || vehicleMatch
    return searchMatch && regionFilterMatch && vehicleFilterMatch
  })
}

// [MP-BG-1]
const sortCouriers = (couriers: Courier[], filters: CouriersListFilters) => {
  const sorted = [...couriers]
  sorted.sort((left, right) => {
    const direction = filters.sortDirection === 'asc' ? 1 : -1
    if (filters.sortField === 'assignedOrderCount') {
      return (left.assignedOrderCount - right.assignedOrderCount) * direction
    }
    const leftValue = left[filters.sortField].toString()
    const rightValue = right[filters.sortField].toString()
    return leftValue.localeCompare(rightValue) * direction
  })
  return sorted
}

// [MP-BG-1]
export const listCouriersFromStore = (
  couriers: Courier[],
  filters: CouriersListFilters,
): Paginated<Courier> => {
  ensureListCapacity(couriers)
  const filtered = applyFilters(couriers, filters)
  const sorted = sortCouriers(filtered, filters)
  const startIndex = (filters.page - 1) * filters.pageSize
  const pageItems = sorted.slice(startIndex, startIndex + filters.pageSize)

  const items = pageItems.map(enforceCourierInvariant)
  const totalItems = filtered.length
  const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / filters.pageSize)

  return {
    items,
    page: filters.page,
    pageSize: filters.pageSize,
    totalItems,
    totalPages,
  }
}

// [MP-BG-1]
export const listCouriers = (filters: CouriersListFilters): Paginated<Courier> =>
  listCouriersFromStore(couriersStore, filters)

// [MP-BG-1]
export const getCourierByIdFromStore = (couriers: Courier[], id: CourierId): Courier => {
  const courier = couriers.find((item) => item.id === id)
  if (!courier) {
    throw new CouriersError('COURIER_NOT_FOUND')
  }
  return enforceCourierInvariant(courier)
}

// [MP-BG-1]
export const getCourierById = (id: CourierId): Courier =>
  getCourierByIdFromStore(couriersStore, id)

type CreateCourierOptions = {
  idGenerator?: () => string
  maxAttempts?: number
}

// [MP-BG-2]
const generateCourierId = (options?: CreateCourierOptions) => {
  const generator = options?.idGenerator ?? (() => {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID()
    }
    return `c-${Math.random().toString(36).slice(2, 10)}`
  })
  return generator()
}

// [MP-BG-2]
export const createCourierInStore = (
  couriers: Courier[],
  input: CreateCourierInput,
  options?: CreateCourierOptions,
): Courier => {
  ensureCreateCapacity(couriers)
  const maxAttempts = options?.maxAttempts ?? 3

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const id = generateCourierId(options) as CourierId
    if (couriers.some((courier) => courier.id === id)) {
      continue
    }

    const created: Courier = {
      id,
      name: input.name,
      phone: input.phone,
      vehicle: input.vehicle,
      region: input.region,
      assignedOrderIds: [],
      assignedOrderCount: 0,
    }

    couriers.push(created)
    return created
  }

  throw new CouriersError('COURIER_ID_CONFLICT')
}

// [MP-BG-2]
export const createCourier = (input: CreateCourierInput): Courier =>
  createCourierInStore(couriersStore, input)

// [MP-BG-2]
export const removeCourierFromStore = (couriers: Courier[], id: CourierId): void => {
  const index = couriers.findIndex((courier) => courier.id === id)
  if (index === -1) {
    throw new CouriersError('COURIER_NOT_FOUND')
  }

  const courier = enforceCourierInvariant(couriers[index])
  if (courier.assignedOrderCount > 0) {
    throw new CouriersError('COURIER_DELETE_BLOCKED_ASSIGNED')
  }

  couriers.splice(index, 1)
}

// [MP-BG-2]
export const removeCourier = (id: CourierId): void =>
  removeCourierFromStore(couriersStore, id)
