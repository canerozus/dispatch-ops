import { cn } from "@/lib/utils"
import type { OrderStatus } from "../types"

const statusStyles: Record<OrderStatus, string> = {
  created: "bg-blue-100 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800",
  assigned: "bg-yellow-100 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-800",
  picked_up: "bg-purple-100 border-purple-200 dark:bg-purple-900/30 dark:border-purple-800",
  delivered: "bg-green-100 border-green-200 dark:bg-green-900/30 dark:border-green-800",
  cancelled: "bg-red-100 border-red-200 dark:bg-red-900/30 dark:border-red-800",
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
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        statusStyles[status],
        className
      )}
    >
      {statusLabels[status]}
    </span>
  )
}
