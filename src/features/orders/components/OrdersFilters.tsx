import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { OrdersFilters } from "../types"


interface OrdersFiltersProps {
  filters: OrdersFilters
  setFilters: (filters: Partial<OrdersFilters>) => void
}

export function OrdersFiltersBar({ filters, setFilters }: OrdersFiltersProps) {
  const [query, setQuery] = useState(filters.q || '')

  useEffect(() => {
    if (filters.q) {
      setQuery(filters.q)
    } else {
      if (query.length >= 3) {
        setQuery('')
      }
    }
  }, [filters.q])

  useEffect(() => {
    const timeoutFunc = setTimeout(() => {
      if (query.length >= 3) {
        if (filters.q !== query) setFilters({ q: query })
      } else {
        if (filters.q) setFilters({ q: undefined })
      }
    }, 300)

    return () => clearTimeout(timeoutFunc)
  }, [query, filters.q, setFilters])

  const selectItemsForStatus = [
    { value: 'all', label: 'All Statuses' },
    { value: 'created', label: 'Created' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'picked_up', label: 'Picked Up' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ]
  const selectItemsForSort = [
    { value: 'eta', label: 'ETA (Soonest)' },
    { value: 'createdAt', label: 'Created Date' },
  ]

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1">
        <Input
          placeholder="Search by Tracking ID or Customer..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="flex gap-2">
        <Select
          value={filters.status || 'all'}
          onValueChange={(val) => setFilters({ status: val as any })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {selectItemsForStatus.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.sort || 'eta'}
          onValueChange={(val) => setFilters({ sort: val as any })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            {selectItemsForSort.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
