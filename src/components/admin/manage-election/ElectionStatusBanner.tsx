import { Clock3 } from 'lucide-react'
import type { Election } from '../../../data/elections'

type ElectionStatusBannerProps = {
  election: Election
  paused: boolean
}

export function ElectionStatusBanner({
  election,
  paused,
}: ElectionStatusBannerProps) {
  const live = election.status === 'live' && !paused
  const pausedLive = election.status === 'live' && paused

  const title = pausedLive
    ? 'Voting is paused'
    : election.status === 'live'
      ? 'Election is Live'
      : election.status === 'upcoming'
        ? 'Election has not started'
        : 'Election has ended'

  const message = pausedLive
    ? 'Voters cannot cast votes until voting resumes.'
    : election.status === 'live'
      ? 'Voting is currently open.'
      : election.status === 'upcoming'
        ? 'This election is scheduled and waiting to open.'
        : 'Voting is closed and results can be reviewed.'

  return (
    <section
      className={`card p-5 sm:p-6 ${
        live
          ? 'border-accent/20 bg-accent-soft/60'
          : pausedLive
            ? 'border-amber-200 bg-amber-50'
            : 'bg-white'
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-lg font-bold text-navy">{title}</p>
          <p className="mt-1 text-sm text-navy-muted">{message}</p>
        </div>
        {election.status === 'live' ? (
          <p className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-sm font-semibold text-navy">
            <Clock3 className="size-4 text-accent" aria-hidden="true" />
            {election.timeLabel.toLowerCase().includes('in ')
              ? `${election.timeLabel.replace(/^Ends in /i, '')} remaining`
              : election.timeLabel}
          </p>
        ) : null}
      </div>
      <dl className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-semibold tracking-wide text-navy-muted uppercase">
            Start
          </dt>
          <dd className="mt-1 text-sm font-semibold text-navy">{election.startDate}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold tracking-wide text-navy-muted uppercase">
            End
          </dt>
          <dd className="mt-1 text-sm font-semibold text-navy">{election.endDate}</dd>
        </div>
      </dl>
    </section>
  )
}
