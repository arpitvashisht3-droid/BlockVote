import { Link } from 'react-router-dom'
import type { Election } from '../../data/elections'

type UpcomingElectionCardProps = {
  election: Election
  startLabel: string
  candidateCount: number
}

export function UpcomingElectionCard({
  election,
  startLabel,
  candidateCount,
}: UpcomingElectionCardProps) {
  return (
    <article className="flex items-center justify-between gap-3 rounded-xl border border-border bg-white px-4 py-3">
      <div className="min-w-0">
        <h3 className="truncate font-semibold text-navy">{election.title}</h3>
        <p className="mt-1 text-sm text-navy-muted">
          {startLabel} · {candidateCount} Candidates
        </p>
      </div>
      <Link
        to={`/elections/${election.id}`}
        className="shrink-0 text-sm font-semibold text-accent hover:text-accent-hover"
      >
        View
      </Link>
    </article>
  )
}
