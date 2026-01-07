import type { OrderEvent } from "../types"
import { StatusBadge } from "./StatusBadge"

interface OrderTimelineProps {
  events: OrderEvent[]
}

export function OrderTimeline({ events }: OrderTimelineProps) {
  // Sort events by date descending
  const sortedEvents = [...events].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())

  return (
    <div>
      <ul className="-mb-8">
        {sortedEvents.map((event, eventIdx) => (
          <li key={eventIdx}>
            <div className="pb-8">
                <div className="flex flex-1 justify-between pt-2">
                  <div>
                    <div className="flex items-center">
                         <p className="font-medium">
                            Status changed to <StatusBadge status={event.status} />
                         </p>
                    </div>
                    {event.note && (
                        <p className="mt-1 text-sm">{event.note}</p>
                    )}
                  </div>
                  <div className="whitespace-nowrap text-right text-sm">
                    {new Date(event.at).toLocaleString()}
                  </div>
                </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
