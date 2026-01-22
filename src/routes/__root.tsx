// Layer: Entry. Responsibility: Root route composition. Business logic: NO.
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { NotFound } from '@/components/NotFound'

export const Route = createRootRoute({
  component: () => <Outlet />,
  notFoundComponent: NotFound
})
