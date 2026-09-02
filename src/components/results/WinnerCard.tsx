import { ShieldCheck, Trophy } from 'lucide-react'
import {
  formatPercent,
  formatVoteCount,
  type Candidate,
} from '../../data/elections'
import { CandidateAvatar } from '../elections/CandidateAvatar'

type WinnerCardProps = {
  candidate: Candidate
  votes: number
  percentage: number
}

export function WinnerCard({ candidate, votes, percentage }: WinnerCardProps) {
  return (
    <section className="card overflow-hidden p-5 sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <CandidateAvatar name={candidate.name} size="lg" />
          <div>
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-accent uppercase">
              <Trophy className="size-3.5" aria-hidden="true" />
              Winner
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-navy">
              {candidate.name}
            </h2>
            <p className="text-sm text-navy-muted">{candidate.department}</p>
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent">
              <ShieldCheck className="size-3.5" aria-hidden="true" />
              Election Winner
            </p>
          </div>
        </div>

        <div className="sm:text-right">
          <p className="text-3xl font-extrabold tracking-tight text-navy">
            {formatPercent(percentage)}
          </p>
          <p className="mt-1 text-sm font-medium text-navy-muted">
            {formatVoteCount(votes)}
          </p>
        </div>
      </div>
    </section>
  )
}
