// Layer: Infrastructure. Responsibility: Couriers MSW handlers. Business logic: YES.
import { delay, http, HttpResponse } from 'msw'
import {
  isCouriersError,
  parseCourierId,
  parseCouriersListFilters,
  parseCreateCourierInput,
} from '@/api/legacy/couriers.validators'
import {
  createCourier,
  getCourierById,
  listCouriers,
  removeCourier,
} from '@/mocks/data/couriers'

// [MP-RISK-2]
const toErrorResponse = (error: unknown) => {
  if (isCouriersError(error)) {
    return HttpResponse.json(
      { code: error.code, message: error.message },
      { status: error.status },
    )
  }

  return HttpResponse.json(
    { code: 'MSW_INTERNAL_ERROR', message: 'MSW handler error.' },
    { status: 500 },
  )
}

export const courierHandlers = [
  // [MP-BG-1]
  http.get('/api/couriers', async ({ request }) => {
    await delay(150)
    try {
      const url = new URL(request.url)
      const filters = parseCouriersListFilters(url.searchParams)
      const result = listCouriers(filters)
      return HttpResponse.json(result)
    } catch (error) {
      return toErrorResponse(error)
    }
  }),
  // [MP-BG-1]
  http.get('/api/couriers/:courierId', async ({ params }) => {
    await delay(150)
    try {
      const courierId = parseCourierId(params.courierId)
      const courier = getCourierById(courierId)
      return HttpResponse.json(courier)
    } catch (error) {
      return toErrorResponse(error)
    }
  }),
  // [MP-BG-2]
  http.post('/api/couriers', async ({ request }) => {
    await delay(150)
    try {
      const payload = await request.json()
      const input = parseCreateCourierInput(payload)
      const created = createCourier(input)
      return HttpResponse.json(created, { status: 201 })
    } catch (error) {
      return toErrorResponse(error)
    }
  }),
  // [MP-BG-2]
  http.delete('/api/couriers/:courierId', async ({ params }) => {
    await delay(150)
    try {
      const courierId = parseCourierId(params.courierId)
      removeCourier(courierId)
      return new HttpResponse(null, { status: 204 })
    } catch (error) {
      return toErrorResponse(error)
    }
  }),
]
