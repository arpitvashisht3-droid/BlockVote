import type { ElectionStatus } from '../../data/elections'

const styles: Record<ElectionStatus, string> = {
  live: 'bg-accent-soft text-accent',
  upcoming: 'bg-upcoming-soft text-upcoming',
  ended: 'bg-slate-100 text-navy-muted',
}

const labels: Record<ElectionStatus, string> = {
  live: 'Live',
  upcoming: 'Upcoming',
  ended: 'Ended',
}

type StatusBadgeProps = {
  status: ElectionStatus
  paused?: boolean
}

export function StatusBadge({ status, paused = false }: StatusBadgeProps) {
  if (paused) {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-amber-700 uppercase">
        Paused
      </span>
    )
  }
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase ${styles[status]}`}
    >
      {status === 'live' ? (
        <span className="mr-1.5 size-1.5 rounded-full bg-accent" aria-hidden="true" />
      ) : null}
      {labels[status]}
    </span>
  )
}
