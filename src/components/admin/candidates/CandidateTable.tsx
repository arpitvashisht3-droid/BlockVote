import type { Candidate, Election } from '../../../data/elections'
import {
  canRemoveCandidate,
  formatCandidateVoteDisplay,
} from '../../../data/candidateManagement'
import { getCandidatePosition } from '../../../data/manageElection'
import { CandidateAvatar } from '../../elections/CandidateAvatar'
import { CandidateActions } from './CandidateActions'
import { CandidateCard, CandidateStatusBadge } from './CandidateCard'

type CandidateTableProps = {
  election: Election
  candidates: Candidate[]
  visible: Candidate[]
  onView: (candidate: Candidate) => void
  onEdit: (candidate: Candidate) => void
  onRemove: (candidate: Candidate) => void
}

export function CandidateTable({
  election,
  candidates,
  visible,
  onView,
  onEdit,
  onRemove,
}: CandidateTableProps) {
  return (
    <>
      <div className="card hidden overflow-hidden lg:block">
        <table className="w-full min-w-0 text-sm">
          <caption className="sr-only">
            Candidates for {election.title}
          </caption>
          <thead className="bg-slate-50 text-left text-xs font-semibold tracking-wide text-navy-muted uppercase">
            <tr>
              <th scope="col" className="px-4 py-3">
                Candidate
              </th>
              <th scope="col" className="px-4 py-3">
                Position
              </th>
              <th scope="col" className="px-4 py-3">
                Department
              </th>
              <th scope="col" className="px-4 py-3">
                Votes
              </th>
              <th scope="col" className="px-4 py-3">
                Status
              </th>
              <th scope="col" className="px-4 py-3">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.map((candidate) => {
              const removed = Boolean(candidate.removed)
              return (
                <tr
                  key={candidate.id}
                  className={`border-t border-border ${removed ? 'bg-slate-50/70' : ''}`}
                >
                  <th scope="row" className="px-4 py-4 text-left font-normal">
                    <div className="flex min-w-0 items-start gap-3">
                      <CandidateAvatar name={candidate.name} size="sm" />
                      <div className="min-w-0">
                        <p className="font-semibold text-navy">{candidate.name}</p>
                        <p className="mt-1 line-clamp-1 text-xs text-navy-muted">
                          {candidate.about}
                        </p>
                      </div>
                    </div>
                  </th>
                  <td className="px-4 py-4 text-navy-muted">
                    {getCandidatePosition(candidate)}
                  </td>
                  <td className="px-4 py-4 text-navy-muted">
                    {candidate.department}
                  </td>
                  <td className="px-4 py-4 text-navy">
                    {formatCandidateVoteDisplay(election, candidate.id)}
                  </td>
                  <td className="px-4 py-4">
                    <CandidateStatusBadge removed={removed} />
                  </td>
                  <td className="px-4 py-4">
                    <CandidateActions
                      candidate={candidate}
                      canRemove={canRemoveCandidate(candidates, candidate.id)}
                      onView={() => onView(candidate)}
                      onEdit={() => onEdit(candidate)}
                      onRemove={() => onRemove(candidate)}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <ul className="grid gap-3 md:grid-cols-2 lg:hidden">
        {visible.map((candidate) => (
          <li key={candidate.id}>
            <CandidateCard
              candidate={candidate}
              election={election}
              candidates={candidates}
              onView={() => onView(candidate)}
              onEdit={() => onEdit(candidate)}
              onRemove={() => onRemove(candidate)}
            />
          </li>
        ))}
      </ul>
    </>
  )
}
