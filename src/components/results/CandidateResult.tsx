import {
  formatNumber,
  formatPercent,
  type Candidate,
} from '../../data/elections'
import { CandidateAvatar } from '../elections/CandidateAvatar'

type CandidateResultProps = {
  candidate: Candidate
  votes: number
  percentage: number
  isWinner: boolean
}

export function CandidateResult({
  candidate,
  votes,
  percentage,
  isWinner,
}: CandidateResultProps) {
  return (
    <article
      className={`rounded-xl border p-4 ${
        isWinner ? 'border-accent bg-accent-soft/50' : 'border-border bg-white'
      }`}
    >
      <div className="flex items-center gap-3">
        <CandidateAvatar name={candidate.name} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-semibold text-navy">{candidate.name}</h3>
              <p className="text-sm text-navy-muted">{candidate.department}</p>
            </div>
            <p className="shrink-0 text-right text-sm font-semibold text-navy">
              {formatPercent(percentage)}
              <span className="mt-0.5 block text-xs font-medium text-navy-muted">
                {formatNumber(votes)} votes
              </span>
            </p>
          </div>
          <div
            className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percentage}
            aria-label={`${candidate.name} received ${formatPercent(percentage)} of votes`}
          >
            <div
              className={`h-full rounded-full ${isWinner ? 'bg-accent' : 'bg-accent/35'}`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </article>
  )
}
