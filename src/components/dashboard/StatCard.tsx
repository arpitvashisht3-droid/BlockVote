import { dashboardStatIcons, type DashboardStat } from '../../data/dashboard'

type StatCardProps = {
  stat: DashboardStat
}

export function StatCard({ stat }: StatCardProps) {
  const Icon = dashboardStatIcons[stat.icon]

  return (
    <article className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-navy-muted">{stat.label}</p>
        <span className="flex size-9 items-center justify-center rounded-lg bg-accent-soft text-accent">
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight text-navy">
        {stat.value}
      </p>
      <p className="mt-1 text-sm text-navy-muted">{stat.detail}</p>
    </article>
  )
}
