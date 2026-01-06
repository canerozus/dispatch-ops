import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
      // Redirect to orders for now as the main page
      throw redirect({
          to: '/orders',
      })
  }
})
