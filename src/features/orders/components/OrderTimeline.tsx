import type { OrderEvent } from "../types"
import { StatusBadge } from "./StatusBadge"

interface OrderTimelineProps {
  events: OrderEvent[]
}

export function OrderTimeline({ events }: OrderTimelineProps) {
  // Sort events by date descending
  const sortedEvents = [...events].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())

  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {sortedEvents.map((event, eventIdx) => (
          <li key={eventIdx}>
            <div className="relative pb-8">
              {eventIdx !== sortedEvents.length - 1 ? (
                <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-border" aria-hidden="true" />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <span className="h-8 w-8 rounded-full bg-muted flex items-center justify-center ring-8 ring-background">
                     <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground" />
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <div className="flex items-center gap-2">
                         <p className="font-medium text-foreground">
                            Status changed to <StatusBadge status={event.status} />
                         </p>
                    </div>
                    {event.note && (
                        <p className="mt-1 text-sm text-muted-foreground">{event.note}</p>
                    )}
                  </div>
                  <div className="whitespace-nowrap text-right text-sm text-muted-foreground">
                    {new Date(event.at).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
