import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import {
  createCandidateId,
  type DraftCandidate,
} from '../../../data/createElection'
import { CandidateAvatar } from '../../elections/CandidateAvatar'
import { CandidateForm } from './CandidateForm'

type CandidateListProps = {
  candidates: DraftCandidate[]
  onChange: (candidates: DraftCandidate[]) => void
}

export function CandidateList({
  candidates,
  onChange,
}: CandidateListProps) {
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<DraftCandidate | null>(null)
  const tooFew = candidates.length < 2

  function closeForm() {
    setFormOpen(false)
    setEditing(null)
  }

  function handleSave(
    candidate: Omit<DraftCandidate, 'id'> & { id?: string },
  ) {
    if (candidate.id) {
      onChange(
        candidates.map((item) =>
          item.id === candidate.id ? { ...item, ...candidate, id: item.id } : item,
        ),
      )
    } else {
      onChange([
        ...candidates,
        {
          ...candidate,
          id: createCandidateId(candidate.name),
        },
      ])
    }

    closeForm()
  }

  return (
    <section>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-navy">Add Candidates</h2>
          <p className="mt-1 text-sm text-navy-muted">
            Add the candidates who will appear on the ballot.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-dashed border-accent/40 bg-accent-soft px-3 py-2 text-sm font-semibold text-accent transition-colors hover:border-accent hover:bg-accent-soft/80"
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
          Add at least two candidates before continuing.
        </p>
      ) : null}

      {candidates.length > 0 ? (
        <ul className="mt-4 grid gap-3">
          {candidates.map((candidate) => (
            <li key={candidate.id}>
              <article className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <CandidateAvatar name={candidate.name} />
                  <div className="min-w-0">
                    <h3 className="font-semibold text-navy">{candidate.name}</h3>
                    <p className="text-sm text-navy-muted">
                      {candidate.department}
                      {candidate.position ? ` · ${candidate.position}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="inline-flex size-10 items-center justify-center rounded-lg text-navy-muted transition-colors hover:bg-slate-100 hover:text-navy"
                    aria-label={`Edit ${candidate.name}`}
                    onClick={() => {
                      setEditing(candidate)
                      setFormOpen(true)
                    }}
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    type="button"
                    className="inline-flex size-10 items-center justify-center rounded-lg text-navy-muted transition-colors hover:bg-rose-50 hover:text-rose-600"
                    aria-label={`Delete ${candidate.name}`}
                    onClick={() =>
                      onChange(candidates.filter((item) => item.id !== candidate.id))
                    }
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </article>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-border px-4 py-10 text-center">
          <p className="text-sm text-navy-muted">
            No candidates yet. Add at least two people to the ballot.
          </p>
        </div>
      )}

      <CandidateForm
        open={formOpen}
        candidate={editing}
        onClose={closeForm}
        onSave={handleSave}
      />
    </section>
  )
}
