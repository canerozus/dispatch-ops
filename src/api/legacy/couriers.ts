// Layer: Infrastructure. Responsibility: Couriers adapter operations. Business logic: YES.
import { get, post } from '@/api/http'
import {
  normalizeCouriersListFilters,
  parseCourierId,
  parseCreateCourierInput,
} from '@/api/legacy/couriers.validators'
import type {
  Courier,
  CourierId,
  CouriersListFilters,
  CreateCourierInput,
  Paginated,
} from '@/features/couriers/types'

// [MP-RISK-2]
const buildErrorMessage = async (response: Response) => {
  try {
    const body = await response.json() as { code?: string; message?: string }
    if (body?.code && body?.message) {
      return `${body.code}: ${body.message}`
    }
  } catch {
    // ignore JSON parse errors and fall back to status text
  }
  return `API Error: ${response.status} ${response.statusText}`
}

// [MP-RISK-2]
const del = async (url: string): Promise<void> => {
  const response = await fetch(url, { method: 'DELETE' })
  if (!response.ok) {
    const message = await buildErrorMessage(response)
    throw new Error(message)
  }
}

/**
 * [MP-BG-1] List couriers using validated filters.
 * @example
 * await couriersApi.list({ page: 1, pageSize: 10, searchTerm: '', region: '', vehicle: '', sortField: 'name', sortDirection: 'asc' })
 */
const listCouriers = async (filters: CouriersListFilters): Promise<Paginated<Courier>> => {
  const normalized = normalizeCouriersListFilters(filters)
  const params = new URLSearchParams()
  params.set('page', normalized.page.toString())
  params.set('pageSize', normalized.pageSize.toString())
  params.set('sortField', normalized.sortField)
  params.set('sortDirection', normalized.sortDirection)

  if (normalized.searchTerm) params.set('searchTerm', normalized.searchTerm)
  if (normalized.region) params.set('region', normalized.region)
  if (normalized.vehicle) params.set('vehicle', normalized.vehicle)

  return get<Paginated<Courier>>(`/api/couriers?${params.toString()}`)
}

/**
 * [MP-BG-1] Load courier detail by id.
 * @example
 * await couriersApi.detail('c-1' as CourierId)
 */
const detailCourier = async (id: CourierId): Promise<Courier> => {
  const validatedId = parseCourierId(id)
  return get<Courier>(`/api/couriers/${validatedId}`)
}

/**
 * [MP-BG-2] Create a new courier.
 * @example
 * await couriersApi.create({ name: 'A', phone: '1', vehicle: 'v', region: 'r' })
 */
const createCourier = async (input: CreateCourierInput): Promise<Courier> => {
  const validatedInput = parseCreateCourierInput(input)
  return post<Courier>('/api/couriers', validatedInput)
}

/**
 * [MP-BG-2] Remove a courier by id.
 * @example
 * await couriersApi.remove('c-1' as CourierId)
 */
const removeCourier = async (id: CourierId): Promise<void> => {
  const validatedId = parseCourierId(id)
  await del(`/api/couriers/${validatedId}`)
}

export const couriersApi = {
  list: listCouriers,
  detail: detailCourier,
  create: createCourier,
  remove: removeCourier,
}
