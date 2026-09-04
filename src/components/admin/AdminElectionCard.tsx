import { Link } from 'react-router-dom'
import type { ManagedElection } from '../../data/admin'
import { formatNumber, type Election } from '../../data/elections'
import { buttonClassName } from '../buttonStyles'
import { StatusBadge } from '../elections/StatusBadge'

type AdminElectionCardProps = {
  election: Election
  management: ManagedElection
}

export function AdminElectionCard({
  election,
  management,
}: AdminElectionCardProps) {
  return (
    <article className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <StatusBadge status={management.status} />
        <h3 className="mt-2 font-semibold text-navy">{election.title}</h3>
        <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-navy-muted">
          <div>
            <dt className="sr-only">Votes</dt>
            <dd>{formatNumber(management.votes)} votes</dd>
          </div>
          <div>
            <dt className="sr-only">Registered voters</dt>
            <dd>{formatNumber(management.registeredVoters)} registered voters</dd>
          </div>
          <div>
            <dt className="sr-only">Turnout</dt>
            <dd>{management.turnoutPercent}% turnout</dd>
          </div>
          <div>
            <dt className="sr-only">End date</dt>
            <dd>{management.endsLabel}</dd>
          </div>
        </dl>
      </div>
      <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row">
        <Link
          to={`/admin/elections/${election.id}`}
          className={buttonClassName({ className: 'w-full sm:w-auto' })}
        >
          Manage
        </Link>
        <Link
          to={`/elections/${election.id}/results`}
          className={buttonClassName({
            variant: 'secondary',
            className: 'w-full sm:w-auto',
          })}
        >
          View Results
        </Link>
      </div>
    </article>
  )
}
