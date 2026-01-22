# PRD - Couriers (Carriers) Feature

## Summary
Add a new Couriers section to the existing TanStack Router app. The feature includes a Couriers list page and a Courier detail page. Data is fully mocked using MSW (`src/mocks`). UI must follow the current design system and patterns used by Orders (tables, filters, dialogs).

## Goals
- Provide a Couriers list page with create and delete actions.
- Provide a Courier detail page reachable by id, showing assigned orders.
- Use mock data only; no real backend.
- Reuse existing UI components and layout patterns from Orders.

## Non-goals
- Maps or live tracking.
- Authentication/authorization.
- Real backend integration.
- New visual design language.

## Users / Personas
- Dispatcher: manages couriers and checks their assigned work.

## User Stories
- As a dispatcher, I can view a list of couriers.
- As a dispatcher, I can create a new courier.
- As a dispatcher, I can delete a courier.
- As a dispatcher, I can click a courier to see their details and assigned orders.

## UX and UI Requirements
- Follow the existing Orders page layout: container, title, filters bar, table, pagination.
- Use existing UI components from `src/components/ui`.
- Use dialogs for create and delete confirmation.
- Do not introduce new fonts, colors, or visual styles.

## Functional Requirements
### Routing
- List page: `/couriers` (or `/carriers` if you want this exact name).
- Detail page: `/couriers/$courierId`.
- Root redirect stays the same (`/orders`).

### Couriers List Page
- Table listing couriers.
- Each row links to courier detail page.
- Create courier action (dialog form).
- Delete courier action (row action + confirmation dialog).
- Show empty state if no couriers.

### Courier Detail Page
- Header with courier name and id.
- Assigned orders list (reuse orders table or a simplified table).
- Empty state if no assigned orders.

## Data Model (Mock)
Minimal fields needed for this feature:
- Courier
  - id: string
  - name: string
  - status?: 'active' | 'inactive'
  - createdAt?: string (ISO)

Notes:
- Assigned orders come from existing orders data where `order.courierId === courier.id`.

## Mock API (MSW)
Add handlers in `src/mocks/handlers.ts`.

- `GET /api/couriers`
  - query params: `q`, `page`, `pageSize`
  - returns: `{ items, page, pageSize, total }`
- `GET /api/couriers/:id`
  - returns courier detail
- `POST /api/couriers`
  - body: `{ name, status? }`
  - returns created courier
- `DELETE /api/couriers/:id`
  - returns success or 404
- Extend existing `GET /api/orders` to support `courierId` filter
  - used by courier detail page to show assigned orders

## Query Layer
- New query keys and queries similar to `ordersQueries` in `src/features/orders/queries.ts`.
- Use `@tanstack/react-query` with `useSuspenseQuery` and `queryClient.ensureQueryData`.

## Error and Edge Cases
- Empty list states for couriers and assigned orders.
- Attempting to delete a courier with assigned orders: decide behavior (block delete or allow and unassign orders).
- Invalid courier id -> NotFound.

## Acceptance Criteria
- Couriers list page loads and matches current design language.
- Create courier adds item to list without full page reload.
- Delete courier removes item from list and handles 404 gracefully.
- Courier detail page loads by id and shows assigned orders.
- All data interactions are mocked in MSW.

## Open Questions
- Confirm route name: `/couriers` vs `/carriers`.
- Required fields for a courier beyond `name` (phone, vehicle, region)?
- Delete behavior if courier has assigned orders.
- Do we need filters/sorting/pagination for couriers, or a simple list is enough?
- Should courier detail show extra stats (completed orders count, active status)?
