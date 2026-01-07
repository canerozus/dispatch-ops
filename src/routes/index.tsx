import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    throw redirect({
      to: '/orders',
      search: {
        page: 1,
        pageSize: 2,
        status: 'all',
        sort: 'eta',
      },
    })
  },
})
