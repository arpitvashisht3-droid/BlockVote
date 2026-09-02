import {
  BadgeCheck,
  Pause,
  Radio,
  Trophy,
  TrendingUp,
} from 'lucide-react'
import type { ResultActivityItem } from '../../../data/adminResults'

const icons = {
  created: Radio,
  opened: Radio,
  milestone: TrendingUp,
  paused: Pause,
  ended: BadgeCheck,
  updated: BadgeCheck,
  lead: Trophy,
  published: BadgeCheck,
} as const

type ResultActivityProps = {
  items: ResultActivityItem[]
}

export function ResultActivity({ items }: ResultActivityProps) {
  return (
    <section className="card p-5 sm:p-6">
      <h2 className="text-lg font-bold text-navy">Result Activity</h2>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-navy-muted">
          No result activity has been recorded yet.
        </p>
      ) : (
        <ol className="mt-4 space-y-4">
          {items.map((item, index) => {
            const Icon = icons[item.type]
            return (
              <li key={item.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-accent-soft text-accent">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  {index < items.length - 1 ? (
                    <span
                      className="mt-1 w-px flex-1 bg-border"
                      aria-hidden="true"
                    />
                  ) : null}
                </div>
                <div className="pb-2">
                  <p className="text-sm font-semibold text-navy">{item.title}</p>
                  <p className="mt-1 text-xs text-navy-muted">{item.time}</p>
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
