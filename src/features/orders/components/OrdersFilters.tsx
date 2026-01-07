import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { OrdersFilters } from "../types"

interface OrdersFiltersProps {
  filters: OrdersFilters
  setFilters: (filters: Partial<OrdersFilters>) => void
}

export function OrdersFiltersBar({ filters, setFilters }: OrdersFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1">
        <Input
          placeholder="Search by Tracking ID or Customer..."
          value={filters.q || ''}
          onChange={(e) => setFilters({ q: e.target.value })}
          className="max-w-sm"
        />
      </div>
      <div className="flex gap-2">
        <Select
          value={filters.status || 'all'}
          onValueChange={(val) => setFilters({ status: val as any })}
          className="w-[180px]"
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="created">Created</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="picked_up">Picked Up</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
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
            <SelectItem value="eta">ETA (Soonest)</SelectItem>
            <SelectItem value="createdAt">Created Date</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
