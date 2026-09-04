import { Eye, Pencil, Trash2 } from 'lucide-react'
import type { Candidate } from '../../../data/elections'

type CandidateActionsProps = {
  candidate: Candidate
  canRemove: boolean
  onView: () => void
  onEdit: () => void
  onRemove: () => void
}

const iconButtonClass =
  'inline-flex size-9 items-center justify-center rounded-lg border border-border text-navy-muted transition-colors hover:bg-slate-100 hover:text-navy disabled:pointer-events-none disabled:opacity-40'

export function CandidateActions({
  candidate,
  canRemove,
  onView,
  onEdit,
  onRemove,
}: CandidateActionsProps) {
  const removed = Boolean(candidate.removed)

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={`${candidate.name} actions`}>
      <button
        type="button"
        className={iconButtonClass}
        aria-label={`View profile for ${candidate.name}`}
        onClick={onView}
      >
        <Eye className="size-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        className={iconButtonClass}
        aria-label={`Edit ${candidate.name}`}
        onClick={onEdit}
      >
        <Pencil className="size-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        className={`${iconButtonClass} hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600`}
        aria-label={
          removed
            ? `${candidate.name} is already removed`
            : canRemove
              ? `Remove ${candidate.name}`
              : `Cannot remove ${candidate.name}. At least two active candidates are required.`
        }
        disabled={!canRemove}
        onClick={onRemove}
      >
        <Trash2 className="size-4" aria-hidden="true" />
      </button>
    </div>
  )
}
