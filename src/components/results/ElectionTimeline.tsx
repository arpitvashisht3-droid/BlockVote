import { CheckCircle2 } from 'lucide-react'

type TimelineItem = {
  label: string
  date: string
}

type ElectionTimelineProps = {
  items: TimelineItem[]
}

export function ElectionTimeline({ items }: ElectionTimelineProps) {
  return (
    <section className="card p-5 sm:p-6">
      <h2 className="text-lg font-bold text-navy">Results timeline</h2>
      <ol className="mt-4">
        {items.map((item, index) => (
          <li key={item.label} className="relative flex gap-3 pb-5 last:pb-0">
            {index < items.length - 1 ? (
              <span className="absolute top-6 bottom-0 left-[9px] w-px bg-border" />
            ) : null}
            <CheckCircle2
              className="relative z-10 size-5 shrink-0 bg-white text-accent"
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-semibold text-navy">{item.label}</p>
              <p className="mt-0.5 text-sm text-navy-muted">{item.date}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
