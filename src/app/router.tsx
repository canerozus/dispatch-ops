// Layer: App Composition. Responsibility: Router construction. Business logic: NO.
import { createRouter } from '@tanstack/react-router'
import { routeTree } from '../routeTree.gen'

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  scrollRestoration: true,
  context: {
    queryClient: undefined!, // This will be set in the provider
  },
})

// Register things for typesafety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
