import { Link } from "@tanstack/react-router"
import type { Order } from "../types"
import { StatusBadge } from "./StatusBadge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"

interface OrdersTableProps {
  orders: Order[]
  isLoading?: boolean
}

export function OrdersTable({ orders, isLoading }: OrdersTableProps) {
  if (isLoading) {
    return <div className="p-8 text-center">Loading orders...</div>
  }

  if (orders.length === 0) {
    return <div className="p-8 text-center border rounded-lg bg-muted/10">No orders found matching your criteria.</div>
  }
  const tableHeads = [
    "Tracking ID",
    "Customer",
    "Status",
    "ETA (mins)",
    "Assignee",
    "Action",
  ];

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {tableHeads.map((head) => (
              <TableHead key={head}>{head}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id} className="cursor-pointer hover:bg-muted/50">
                <TableCell className="font-medium">
                  <Link to="/orders/$orderId" params={{ orderId: order.id }} className="hover:underline">
                    {order.trackingId}
                  </Link>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{order.customerName}</span>
                    <span className="text-xs text-muted-foreground">{order.address}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={order.status} />
                </TableCell>
                <TableCell>
                  {order.etaMinutes} min
                </TableCell>
                <TableCell>
                  {order.courierId ? (
                    <span className="text-sm font-medium">{order.courierId}</span>
                  ) : (
                    <span className="text-sm text-muted-foreground italic">Unassigned</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/orders/$orderId" params={{ orderId: order.id }}>
                      View
                    </Link>
                  </Button>
                </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
