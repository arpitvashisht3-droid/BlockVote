import { TrendingDown, TrendingUp } from 'lucide-react'
import type { AdminStat } from '../../data/admin'

type AdminStatCardProps = {
  stat: AdminStat
}

export function AdminStatCard({ stat }: AdminStatCardProps) {
  return (
    <article className="card p-5">
      <p className="text-sm font-medium text-navy-muted">{stat.label}</p>
      <p className="mt-3 text-3xl font-bold tracking-tight text-navy">
        {stat.value}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center gap-1 text-xs font-semibold ${
            stat.trendUp ? 'text-accent' : 'text-rose-600'
          }`}
        >
          {stat.trendUp ? (
            <TrendingUp className="size-3.5" aria-hidden="true" />
          ) : (
            <TrendingDown className="size-3.5" aria-hidden="true" />
          )}
          {stat.trend}
        </span>
        <span className="text-xs text-navy-muted">{stat.detail}</span>
      </div>
    </article>
  )
}
