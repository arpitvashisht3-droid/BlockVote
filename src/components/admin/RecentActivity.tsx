import { BadgeCheck, Plus, Radio, TrendingUp } from 'lucide-react'
import { recentAdminActivity, type AdminActivityItem } from '../../data/admin'

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

export function RecentActivity() {
  return (
    <section className="card p-5 sm:p-6">
      <h2 className="text-lg font-bold text-navy">Recent Activity</h2>
      <ol className="mt-4 divide-y divide-border">
        {recentAdminActivity.map((item) => (
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
    </section>
  )
}
