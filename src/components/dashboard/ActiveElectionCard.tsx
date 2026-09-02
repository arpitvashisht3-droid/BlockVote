import { CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  formatVoteCount,
  getElectionPath,
  type Election,
} from '../../data/elections'
import { buttonClassName } from '../buttonStyles'
import { StatusBadge } from '../elections/StatusBadge'

type ActiveElectionCardProps = {
  election: Election
  voted?: boolean
}

export function ActiveElectionCard({
  election,
  voted = false,
}: ActiveElectionCardProps) {
  const ctaLabel =
    election.status === 'live'
      ? 'Vote Now'
      : election.status === 'ended'
        ? 'View Results'
        : 'View Details'

  return (
    <article className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div className="min-w-0">
        <StatusBadge status={election.status} />
        <h3 className="mt-2 font-semibold text-navy">{election.title}</h3>
        <p className="mt-1 text-sm text-navy-muted">{election.timeLabel}</p>
        {election.voteCount != null ? (
          <p className="mt-1 text-sm text-navy-muted">
            {formatVoteCount(election.voteCount)}
            {election.turnoutPercent != null
              ? ` · ${election.turnoutPercent}% turnout`
              : ''}
          </p>
        ) : (
          <p className="mt-1 text-sm text-navy-muted">
            {election.candidates.length} candidates
          </p>
        )}
      </div>

      {voted && election.status !== 'live' ? (
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-accent">
          <CheckCircle2 className="size-4" aria-hidden="true" />
          You already voted
        </p>
      ) : (
        <Link
          to={getElectionPath(election)}
          className={buttonClassName({
            variant: election.status === 'live' ? 'primary' : 'secondary',
            className: 'w-full shrink-0 sm:w-auto',
          })}
        >
          {ctaLabel}
        </Link>
      )}
    </article>
  )
}
