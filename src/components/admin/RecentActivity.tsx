import { BadgeCheck, History, Plus, Radio, TrendingUp } from 'lucide-react'
import type { AdminActivityItem } from '../../data/admin'

const activityIcons = {
  created: Plus,
  live: Radio,
  finalized: BadgeCheck,
  milestone: TrendingUp,
} as const

function ActivityIcon({ type }: { type: AdminActivityItem['type'] }) {
  const Icon = activityIcons[type]
  return <Icon className="size-4" aria-hidden="true" />
}

interface RecentActivityProps {
  items?: AdminActivityItem[]
}

export function RecentActivity({ items = [] }: RecentActivityProps) {
  return (
    <section className="card p-5 sm:p-6">
      <h2 className="text-lg font-bold text-navy">Recent Activity</h2>
      {items.length === 0 ? (
        <div className="mt-4 py-8 text-center">
          <History className="mx-auto size-7 text-slate-300" aria-hidden="true" />
          <p className="mt-2 text-sm font-medium text-navy">No recent activity</p>
          <p className="mt-1 text-xs text-navy-muted">
            Administrative events will appear here when elections are created or modified.
          </p>
        </div>
      ) : (
        <ol className="mt-4 divide-y divide-border">
          {items.map((item) => (
            <li key={item.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
                <ActivityIcon type={item.type} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-navy">{item.title}</p>
                <p className="text-sm text-navy-muted">{item.detail}</p>
                <p className="mt-1 text-xs text-navy-muted">{item.time}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
