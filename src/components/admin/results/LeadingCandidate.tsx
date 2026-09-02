import { Trophy } from 'lucide-react'
import {
  formatPercent,
  formatVoteCount,
} from '../../../data/elections'
import type { CandidateResultRow } from '../../../data/adminResults'
import { CandidateAvatar } from '../../elections/CandidateAvatar'

type LeadingCandidateProps = {
  row: CandidateResultRow
  ended: boolean
}

export function LeadingCandidate({ row, ended }: LeadingCandidateProps) {
  const label = ended ? 'Winner' : 'Currently Leading'

  return (
    <section className="card overflow-hidden p-5 sm:p-6">
      <p className="text-sm font-semibold text-navy">Leading Candidate</p>
      <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <CandidateAvatar name={row.candidate.name} size="lg" />
          <div>
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-accent uppercase">
              <Trophy className="size-3.5" aria-hidden="true" />
              {label}
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-navy">
              {row.candidate.name}
            </h2>
            <p className="text-sm text-navy-muted">{row.candidate.department}</p>
          </div>
        </div>
        <div className="sm:text-right">
          <p className="text-3xl font-extrabold tracking-tight text-navy">
            {formatPercent(row.percentage)}
          </p>
          <p className="mt-1 text-sm font-medium text-navy-muted">
            {formatVoteCount(row.votes)}
          </p>
        </div>
      </div>
    </section>
  )
}
