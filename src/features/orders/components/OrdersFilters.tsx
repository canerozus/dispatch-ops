// Layer: Application/Feature. Responsibility: Orders filters UI behavior. Business logic: YES.
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { OrdersFilters } from "../types"


interface OrdersFiltersProps {
  filters: OrdersFilters
  setFilters: (filters: Partial<OrdersFilters>) => void
}

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'created', label: 'Created' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'picked_up', label: 'Picked Up' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
] as const

const sortOptions = [
  { value: 'eta', label: 'ETA (Soonest)' },
  { value: 'createdAt', label: 'Created Date' },
] as const

type StatusValue = typeof statusOptions[number]['value']
type SortValue = typeof sortOptions[number]['value']

const isStatusValue = (value: string): value is StatusValue =>
  statusOptions.some((option) => option.value === value)

const isSortValue = (value: string): value is SortValue =>
  sortOptions.some((option) => option.value === value)

export function OrdersFiltersBar({ filters, setFilters }: OrdersFiltersProps) {
  const [query, setQuery] = useState(filters.q || '')
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
          onValueChange={(value) => {
            if (isStatusValue(value)) {
              setFilters({ status: value })
            }
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.sort || 'eta'}
          onValueChange={(value) => {
            if (isSortValue(value)) {
              setFilters({ sort: value })
            }
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((item) => (
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
