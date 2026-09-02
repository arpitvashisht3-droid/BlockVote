import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { CandidateForm } from '../create-election/CandidateForm'
import { CandidateAvatar } from '../../elections/CandidateAvatar'
import { CandidateProfileModal } from '../../elections/CandidateProfileModal'
import {
  createCandidateId,
  type DraftCandidate,
} from '../../../data/createElection'
import {
  formatNumber,
  formatPercent,
  type Candidate,
  type Election,
} from '../../../data/elections'
import {
  fromDraftCandidate,
  getCandidateVotes,
  toDraftCandidate,
} from '../../../data/manageElection'

type CandidateManagementProps = {
  election: Election
  onChange: (candidates: Candidate[]) => void
}

export function CandidateManagement({
  election,
  onChange,
}: CandidateManagementProps) {
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<DraftCandidate | null>(null)
  const [profile, setProfile] = useState<Candidate | null>(null)
  const tooFew = election.candidates.length < 2
  const showVotes =
    election.status === 'live' || election.status === 'ended'

  function closeForm() {
    setFormOpen(false)
    setEditing(null)
  }

  function handleSave(draft: Omit<DraftCandidate, 'id'> & { id?: string }) {
    if (draft.id) {
      onChange(
        election.candidates.map((candidate) =>
          candidate.id === draft.id
            ? fromDraftCandidate(draft, candidate)
            : candidate,
        ),
      )
    } else {
      const id = createCandidateId(draft.name)
      onChange([
        ...election.candidates,
        fromDraftCandidate({ ...draft, id }),
      ])
    }
    closeForm()
  }

  return (
    <section className="card p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-navy">Candidates</h2>
          <p className="mt-1 text-sm text-navy-muted">
            People currently listed on this ballot.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-dashed border-accent/40 bg-accent-soft px-3 py-2 text-sm font-semibold text-accent hover:border-accent"
          onClick={() => {
            setEditing(null)
            setFormOpen(true)
          }}
        >
          <Plus className="size-4" aria-hidden="true" />
          Add Candidate
        </button>
      </div>

      {tooFew ? (
        <p className="field-error" role="alert">
          Keep at least two candidates on the ballot.
        </p>
      ) : null}

      <ul className="mt-4 space-y-3">
        {election.candidates.map((candidate) => {
          const tally = getCandidateVotes(election, candidate.id)
          return (
            <li key={candidate.id}>
              <article className="flex flex-col gap-4 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <CandidateAvatar name={candidate.name} />
                  <div className="min-w-0">
                    <h3 className="font-semibold text-navy">{candidate.name}</h3>
                    <p className="text-sm text-navy-muted">
                      {candidate.department}
                      {candidate.position ? ` · ${candidate.position}` : ''}
                    </p>
                    {showVotes && tally ? (
                      <p className="mt-1 text-xs font-medium text-navy">
                        {formatNumber(tally.votes)} votes ·{' '}
                        {formatPercent(tally.percentage)}
                      </p>
                    ) : null}
                    <p className="mt-1 text-[11px] font-semibold tracking-wide text-accent uppercase">
                      On ballot
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-lg px-3 py-2 text-sm font-semibold text-accent hover:bg-accent-soft"
                    onClick={() => setProfile(candidate)}
                  >
                    View Profile
                  </button>
                  <button
                    type="button"
                    className="inline-flex size-10 items-center justify-center rounded-lg text-navy-muted hover:bg-slate-100 hover:text-navy"
                    aria-label={`Edit ${candidate.name}`}
                    onClick={() => {
                      setEditing(toDraftCandidate(candidate))
                      setFormOpen(true)
                    }}
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    type="button"
                    className="inline-flex size-10 items-center justify-center rounded-lg text-navy-muted hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40"
                    aria-label={`Remove ${candidate.name}`}
                    disabled={election.candidates.length <= 2}
                    onClick={() =>
                      onChange(
                        election.candidates.filter(
                          (item) => item.id !== candidate.id,
                        ),
                      )
                    }
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </article>
            </li>
          )
        })}
      </ul>

      <CandidateForm
        open={formOpen}
        candidate={editing}
        onClose={closeForm}
        onSave={handleSave}
      />
      <CandidateProfileModal
        candidate={profile}
        onClose={() => setProfile(null)}
      />
    </section>
  )
}
