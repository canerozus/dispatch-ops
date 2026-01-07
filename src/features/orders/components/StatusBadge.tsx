import { cn } from "@/lib/utils"
import type { OrderStatus } from "../types"

const statusStyles: Record<OrderStatus, string> = {
  created: "bg-blue-100 border-blue-200",
  assigned: "bg-yellow-100 border-yellow-200",
  picked_up: "bg-purple-100 border-purple-200",
  delivered: "bg-green-100 border-green-200",
  cancelled: "bg-red-100 border-red-200",
}

const statusLabels: Record<OrderStatus, string> = {
  created: "Created",
  assigned: "Assigned",
  picked_up: "Picked Up",
  delivered: "Delivered",
  cancelled: "Cancelled",
}

interface StatusBadgeProps {
  status: OrderStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        statusStyles[status],
        className
      )}
    >
      {statusLabels[status]}
    </span>
  )
}
