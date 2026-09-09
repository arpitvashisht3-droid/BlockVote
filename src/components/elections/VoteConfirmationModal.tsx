import { AlertTriangle, Loader2, X } from 'lucide-react'
import type { Candidate } from '../../data/elections'
import { Button } from '../Button'
import { Modal } from '../Modal'
import { CandidateAvatar } from './CandidateAvatar'

type VoteConfirmationModalProps = {
  candidate: Candidate | null
  confirming: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function VoteConfirmationModal({
  candidate,
  confirming,
  onCancel,
  onConfirm,
}: VoteConfirmationModalProps) {
  return (
    <Modal
      open={candidate != null}
      title="Confirm Your Vote"
      onClose={onCancel}
      disableClose={confirming}
    >
      {candidate ? (
        <div>
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-lg font-bold text-navy">Confirm Your Vote</h2>
            <button
              type="button"
              className="rounded-lg p-1 text-navy-muted transition-colors hover:bg-slate-100 hover:text-navy disabled:opacity-50"
              aria-label="Close confirmation"
              disabled={confirming}
              onClick={onCancel}
            >
              <X className="size-5" />
            </button>
          </div>

          <p className="mt-4 text-sm text-navy-muted">You are about to vote for:</p>

          <div className="mt-3 flex items-center gap-3 rounded-xl border border-border bg-surface p-3">
            <CandidateAvatar name={candidate.name} />
            <div>
              <p className="font-semibold text-navy">{candidate.name}</p>
              <p className="text-sm text-navy-muted">{candidate.department}</p>
            </div>
          </div>

          <div className="mt-4 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
            <AlertTriangle
              className="mt-0.5 size-5 shrink-0 text-amber-600"
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-semibold text-amber-900">Important</p>
              <p className="mt-1 text-sm text-amber-800">
                Once you cast your vote, it cannot be changed.
              </p>
            </div>
          </div>

          <Button
            className="mt-6 w-full"
            size="lg"
            disabled={confirming}
            onClick={onConfirm}
          >
            {confirming ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Confirming...
              </>
            ) : (
              'Confirm Vote'
            )}
          </Button>
          <Button
            variant="ghost"
            className="mt-2 w-full"
            disabled={confirming}
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      ) : null}
    </Modal>
  )
}
