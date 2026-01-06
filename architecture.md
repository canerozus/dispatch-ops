# Dispatch Ops Mini Dashboard (Frontend Case)

## Goal
Build a small but product-like “delivery dispatch operations” dashboard for a business (e.g., pizza shop, grocery, e-commerce). The app lets an operator:
- View orders, filter/search/sort, and paginate
- Open an order detail page with a status timeline
- Assign a courier to an order via a dialog form

**No real backend**. Use **MSW** to mock API responses with a small in-memory dataset (3–5 orders, 3 couriers).

---

## Tech Stack (Required)
- TypeScript
- React
- TanStack Router
- TanStack Query
- Tailwind CSS
- Radix UI + shadcn/ui
- MSW (Mock Service Worker)
- react-hook-form
- zod (validation)

---

## Pages / Routes
### Routes
- `/orders` — Orders list (filters + table + pagination)
- `/orders/:orderId` — Order detail (timeline + assign courier dialog)

### Router Requirements
- Orders list state must be stored in **URL search params** and validated with **zod** via `validateSearch`.
- Provide route-level error handling (error state + retry).
- Use `notFound` handling for unknown `orderId` (basic not-found view is enough).

---

## URL Search Params (Orders List)
On `/orders`, manage these search params:
- `q?: string` — search query (debounced input, 300ms)
- `status?: 'all' | 'created' | 'assigned' | 'picked_up' | 'delivered' | 'cancelled'` (default: `all`)
- `sort?: 'eta' | 'createdAt'` (default: `eta`)
- `page?: number` (default: `1`)
- `pageSize?: number` (default: `10`)

### Validation
Use zod schema in route `validateSearch`:
- `page` and `pageSize`: coerce to number, int, min(1)
- Provide default values inside schema parsing

---

## Data Models (TypeScript)
### OrderStatus
`'created' | 'assigned' | 'picked_up' | 'delivered' | 'cancelled'`

### Order
- `id: string`
- `trackingId: string`
- `customerName: string`
- `address: string`
- `etaMinutes: number`
- `status: OrderStatus`
- `courierId?: string`
- `createdAt: string` (ISO)
- `events: Array<{ at: string; status: OrderStatus; note?: string }>` (timeline)

### Courier (for assignment)
- `id: string`
- `name: string`

### Paginated<T>
- `items: T[]`
- `page: number`
- `pageSize: number`
- `total: number`

---

## API (Mocked via MSW)
All fetch calls go to `/api/...` and are handled by MSW.

### Endpoints
1) `GET /api/orders?q=&status=&sort=&page=&pageSize=`
- Filter:
  - `status=all` => no status filter
  - `q` matches `trackingId` or `customerName` (case-insensitive, contains)
- Sort:
  - `eta` => `etaMinutes` ascending
  - `createdAt` => newest-first or oldest-first (choose one; be consistent)
- Pagination:
  - use `page`, `pageSize`
- Response: `Paginated<Order>`

2) `GET /api/orders/:id`
- Response: `Order`
- If not found: return 404

3) `POST /api/orders/:id/assign`
- Body: `{ courierId: string }`
- Behavior:
  - set `courierId`
  - if current status is `created`, set status to `assigned`
  - append event: `{ at: nowIso, status: 'assigned', note: 'Assigned courier' }`
- Response: updated `Order`
- If order not found: 404

### Mock Data
- Orders: 3–5 items with varied statuses and ETAs
- Couriers: 3 items

### Latency
- Simulate simple latency (e.g., random 250–400ms) to make loading states meaningful.

---

## TanStack Query Requirements
### Query Keys
- Orders list: `['orders', params]`
- Order detail: `['order', orderId]`

### Orders List Query
- Use `placeholderData: (prev) => prev` to prevent UI flicker during pagination/filter changes
- `staleTime` around 10s is fine

### Order Detail Query
- Standard query with `staleTime` ~10s

### Mutation: Assign Courier (Must be optimistic)
Implement optimistic update + rollback using:
- `onMutate`: cancel relevant queries, snapshot previous detail cache, update detail cache optimistically:
  - set `courierId`
  - status `created -> assigned`
  - append event to `events`
- `onError`: rollback to snapshot
- `onSuccess`: set detail cache to server response, and `invalidateQueries({ queryKey: ['orders'] })`

---

## UI/UX Requirements (shadcn/ui + Radix)
### Global Layout
- App shell with top navigation (Orders link is enough)
- Toast notifications (shadcn toast or Sonner)

### `/orders` UI
- Filters bar:
  - Search input (`q`) with debounce
  - Status select
  - Sort select
- Table columns (example):
  - Tracking ID
  - Customer
  - Status (badge)
  - ETA (minutes)
  - Created At
  - Action: “Assign” button (opens dialog)
- Row click navigates to `/orders/:orderId`
- States:
  - Loading: skeleton table
  - Empty: “No orders found” view
  - Error: error message + Retry button

### `/orders/:orderId` UI
- Header: trackingId, status badge, ETA, courier info (if assigned)
- Timeline: render `events` list
- Button: “Assign courier” opens dialog

### AssignCourierDialog (react-hook-form + zod)
- Use `react-hook-form` with `zodResolver`
- Schema:
  - `courierId`: required string
- UI:
  - Dialog with courier selection:
    - Either shadcn combobox/command pattern OR a simple Select
  - Submit button shows loading state while mutation runs
  - On success: toast success + close dialog
  - On error: toast error (do not close)

---

## Suggested Folder Structure
```txt
src/
  app/
    router.tsx
    queryClient.ts
    providers.tsx
    layout/AppShell.tsx
  api/
    http.ts
    orders.ts
  features/
    orders/
      types.ts
      queries.ts
      components/
        OrdersFilters.tsx
        OrdersTable.tsx
        AssignCourierDialog.tsx
        StatusBadge.tsx
        OrderTimeline.tsx
  routes/
    __root.tsx
    index.tsx
    orders/
      index.tsx
      $orderId.tsx
  mocks/
    db.ts
    handlers.ts
    browser.ts
  components/
    ui/   (shadcn)
  lib/
    utils.ts

Implementation Notes

Keep API access in src/api/* (single http<T>() wrapper with proper error throwing).

Keep domain types in features/orders/types.ts.

Keep query hooks and keys in features/orders/queries.ts.

Prefer feature-level components (features/orders/components/*) over a global components dump.

Ensure keyboard accessibility for Dialog (Radix defaults help; don’t break focus).

Done Criteria

/orders supports URL-driven filters/search/sort/pagination with zod validation

Loading/empty/error UI states exist and behave correctly (Retry works)

/orders/:orderId displays order detail + timeline

Assign courier works via dialog, uses react-hook-form + zod, and includes optimistic update + rollback

MSW mocks all endpoints with a small in-memory dataset

README (this file) included