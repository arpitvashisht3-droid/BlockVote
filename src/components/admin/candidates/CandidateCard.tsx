import type { Candidate, Election } from '../../../data/elections'
import {
  canRemoveCandidate,
  formatCandidateVoteDisplay,
} from '../../../data/candidateManagement'
import { getCandidatePosition } from '../../../data/manageElection'
import { CandidateAvatar } from '../../elections/CandidateAvatar'
import { CandidateActions } from './CandidateActions'

type CandidateCardProps = {
  candidate: Candidate
  election: Election
  candidates: Candidate[]
  onView: () => void
  onEdit: () => void
  onRemove: () => void
}

export function CandidateCard({
  candidate,
  election,
  candidates,
  onView,
  onEdit,
  onRemove,
}: CandidateCardProps) {
  const removed = Boolean(candidate.removed)
  const votes = formatCandidateVoteDisplay(election, candidate.id)

  return (
    <article
      className={`card flex h-full flex-col gap-4 p-4 ${removed ? 'opacity-80' : ''}`}
    >
      <div className="flex min-w-0 items-start gap-3">
        <CandidateAvatar name={candidate.name} />
        <div className="min-w-0">
          <h3 className="font-semibold text-navy">{candidate.name}</h3>
          <p className="text-sm text-navy-muted">
            {getCandidatePosition(candidate)}
            <span className="mx-1">·</span>
            {candidate.department}
          </p>
          <p className="mt-2 line-clamp-2 text-sm text-navy-muted">
            {candidate.about}
          </p>
        </div>
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-navy">{votes}</span>
          <CandidateStatusBadge removed={removed} />
        </div>
        <CandidateActions
          candidate={candidate}
          canRemove={canRemoveCandidate(candidates, candidate.id)}
          onView={onView}
          onEdit={onEdit}
          onRemove={onRemove}
        />
      </div>
    </article>
  )
}

export function CandidateStatusBadge({ removed }: { removed: boolean }) {
  if (removed) {
    return (
      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-navy-muted uppercase">
        Removed
      </span>
    )
  }

  return (
    <span className="inline-flex items-center rounded-full bg-accent-soft px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-accent uppercase">
      Active
    </span>
  )
}
