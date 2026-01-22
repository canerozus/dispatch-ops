// Layer: Infrastructure. Responsibility: Couriers validation and error helpers. Business logic: YES.
import { z } from 'zod'
import type {
  CourierId,
  CouriersListFilters,
  CreateCourierInput,
  CourierSortField,
  SortDirection,
} from '@/features/couriers/types'

export type CouriersErrorCode =
  | 'COURIER_ID_INVALID'
  | 'QUERY_DUPLICATE_KEY'
  | 'QUERY_UNKNOWN_FIELD'
  | 'QUERY_MISSING_FIELD'
  | 'QUERY_PAGINATION_OUT_OF_RANGE'
  | 'QUERY_INVALID_SORT'
  | 'PAYLOAD_MISSING_FIELD'
  | 'PAYLOAD_INVALID_FIELD'
  | 'PAYLOAD_UNKNOWN_FIELD'
  | 'COURIER_NOT_FOUND'
  | 'COURIER_DELETE_BLOCKED_ASSIGNED'
  | 'COURIER_DATA_INTEGRITY'
  | 'COURIER_ID_CONFLICT'
  | 'COURIER_CAPACITY_EXCEEDED'
  | 'MSW_INTERNAL_ERROR'

const courierIdPattern = /^[A-Za-z0-9_-]+$/

const errorStatusMap: Record<CouriersErrorCode, number> = {
  COURIER_ID_INVALID: 400,
  QUERY_DUPLICATE_KEY: 400,
  QUERY_UNKNOWN_FIELD: 400,
  QUERY_MISSING_FIELD: 400,
  QUERY_PAGINATION_OUT_OF_RANGE: 400,
  QUERY_INVALID_SORT: 400,
  PAYLOAD_MISSING_FIELD: 400,
  PAYLOAD_INVALID_FIELD: 400,
  PAYLOAD_UNKNOWN_FIELD: 400,
  COURIER_NOT_FOUND: 404,
  COURIER_DELETE_BLOCKED_ASSIGNED: 409,
  COURIER_DATA_INTEGRITY: 500,
  COURIER_ID_CONFLICT: 409,
  COURIER_CAPACITY_EXCEEDED: 409,
  MSW_INTERNAL_ERROR: 500,
}

const errorMessageMap: Record<CouriersErrorCode, string> = {
  COURIER_ID_INVALID: 'Courier id is invalid.',
  QUERY_DUPLICATE_KEY: 'Duplicate query key detected.',
  QUERY_UNKNOWN_FIELD: 'Unknown query field.',
  QUERY_MISSING_FIELD: 'Required query field is missing.',
  QUERY_PAGINATION_OUT_OF_RANGE: 'Query pagination is out of range.',
  QUERY_INVALID_SORT: 'Query sort field or direction is invalid.',
  PAYLOAD_MISSING_FIELD: 'Required payload field is missing.',
  PAYLOAD_INVALID_FIELD: 'Payload field is invalid.',
  PAYLOAD_UNKNOWN_FIELD: 'Payload contains unknown fields.',
  COURIER_NOT_FOUND: 'Courier not found.',
  COURIER_DELETE_BLOCKED_ASSIGNED: 'Courier has assigned orders.',
  COURIER_DATA_INTEGRITY: 'Courier data integrity failure.',
  COURIER_ID_CONFLICT: 'Courier id conflict.',
  COURIER_CAPACITY_EXCEEDED: 'Courier capacity exceeded.',
  MSW_INTERNAL_ERROR: 'MSW handler error.',
}

export class CouriersError extends Error {
  readonly code: CouriersErrorCode
  readonly status: number

  constructor(code: CouriersErrorCode, message?: string) {
    super(message ?? errorMessageMap[code])
    this.code = code
    this.status = errorStatusMap[code]
  }
}

// [MP-RISK-2]
export const isCouriersError = (error: unknown): error is CouriersError =>
  error instanceof CouriersError

// [MP-RISK-2]
const createError = (code: CouriersErrorCode, message?: string): never => {
  throw new CouriersError(code, message)
}

// [MP-TC-3]
const getDuplicateKeys = (params: URLSearchParams) => {
  const counts = new Map<string, number>()
  for (const [key] of params) {
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return Array.from(counts.entries())
    .filter(([, count]) => count > 1)
    .map(([key]) => key)
}

// [MP-RISK-2]
const normalizeOptionalParam = (value: string | null, maxLength: number) => {
  if (value === null) return ''
  const trimmed = value.trim()
  if (trimmed.length > maxLength) {
    createError('QUERY_UNKNOWN_FIELD')
  }
  return trimmed
}

// [MP-RISK-2]
const parsePositiveInt = (value: string, min: number, max: number) => {
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    createError('QUERY_PAGINATION_OUT_OF_RANGE')
  }
  return parsed
}

// [MP-RISK-2]
export const parseCouriersListFilters = (params: URLSearchParams): CouriersListFilters => {
  const duplicates = getDuplicateKeys(params)
  if (duplicates.length > 0) {
    createError('QUERY_DUPLICATE_KEY')
  }

  const allowedKeys = new Set([
    'page',
    'pageSize',
    'searchTerm',
    'region',
    'vehicle',
    'sortField',
    'sortDirection',
  ])

  for (const [key] of params) {
    if (!allowedKeys.has(key)) {
      createError('QUERY_UNKNOWN_FIELD')
    }
  }

  const pageRaw = params.get('page')
  const pageSizeRaw = params.get('pageSize')

  if (pageRaw === null || pageRaw.trim() === '') {
    createError('QUERY_MISSING_FIELD')
  }

  if (pageSizeRaw === null || pageSizeRaw.trim() === '') {
    createError('QUERY_MISSING_FIELD')
  }

  const page = parsePositiveInt(pageRaw!, 1, 1000)
  const pageSize = parsePositiveInt(pageSizeRaw!, 1, 100)

  const searchTerm = normalizeOptionalParam(params.get('searchTerm'), 128)
  const region = normalizeOptionalParam(params.get('region'), 64)
  const vehicle = normalizeOptionalParam(params.get('vehicle'), 64)

  const sortFieldRaw = params.get('sortField')
  const sortDirectionRaw = params.get('sortDirection')

  const sortField = (sortFieldRaw ? sortFieldRaw.trim() : 'name') as CourierSortField
  const sortDirection = (sortDirectionRaw ? sortDirectionRaw.trim() : 'asc') as SortDirection

  const allowedSortFields: CourierSortField[] = ['name', 'region', 'vehicle', 'assignedOrderCount']
  const allowedDirections: SortDirection[] = ['asc', 'desc']

  if (!allowedSortFields.includes(sortField) || !allowedDirections.includes(sortDirection)) {
    createError('QUERY_INVALID_SORT')
  }

  return {
    page,
    pageSize,
    searchTerm,
    region,
    vehicle,
    sortField,
    sortDirection,
  }
}

const createCourierInputSchema = z.object({
  name: z.string().trim().min(1).max(128),
  phone: z.string().trim().min(1).max(32),
  vehicle: z.string().trim().min(1).max(64),
  region: z.string().trim().min(1).max(64),
}).strict()

// [MP-RISK-2]
export const parseCreateCourierInput = (input: unknown): CreateCourierInput => {
  const result = createCourierInputSchema.safeParse(input)
  if (result.success) {
    return result.data
  }

  const issue = result.error.issues[0]
  if (!issue) {
    return createError('PAYLOAD_INVALID_FIELD')
  }

  if (issue.code === 'unrecognized_keys') {
    return createError('PAYLOAD_UNKNOWN_FIELD')
  }

  if (issue.code === 'invalid_type') {
    const received = (issue as { received?: string }).received
    if (received === 'undefined' || received === 'null' || received === undefined) {
      return createError('PAYLOAD_MISSING_FIELD')
    }
  }

  return createError('PAYLOAD_INVALID_FIELD')
}

// [MP-RISK-2]
export const parseCourierId = (value: unknown): CourierId => {
  if (typeof value !== 'string') {
    return createError('COURIER_ID_INVALID')
  }
  const trimmed = value.trim()
  if (trimmed.length < 1 || trimmed.length > 64) {
    return createError('COURIER_ID_INVALID')
  }
  if (!courierIdPattern.test(trimmed)) {
    return createError('COURIER_ID_INVALID')
  }
  return trimmed as CourierId
}

const listFiltersSchema = z.object({
  page: z.number().int().min(1).max(1000),
  pageSize: z.number().int().min(1).max(100),
  searchTerm: z.string().max(128),
  region: z.string().max(64),
  vehicle: z.string().max(64),
  sortField: z.enum(['name', 'region', 'vehicle', 'assignedOrderCount']),
  sortDirection: z.enum(['asc', 'desc']),
}).strict()

// [MP-RISK-2]
export const normalizeCouriersListFilters = (filters: CouriersListFilters): CouriersListFilters => {
  const normalized = {
    ...filters,
    searchTerm: filters.searchTerm.trim(),
    region: filters.region.trim(),
    vehicle: filters.vehicle.trim(),
  }
  const result = listFiltersSchema.safeParse(normalized)
  if (!result.success) {
    const issue = result.error.issues[0]
    if (issue?.path[0] === 'page' || issue?.path[0] === 'pageSize') {
      return createError('QUERY_PAGINATION_OUT_OF_RANGE')
    }
    if (issue?.path[0] === 'sortField' || issue?.path[0] === 'sortDirection') {
      return createError('QUERY_INVALID_SORT')
    }
    return createError('QUERY_UNKNOWN_FIELD')
  }
  return result.data as CouriersListFilters
}
