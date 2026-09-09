import { X } from 'lucide-react'
import type { Candidate } from '../../../data/elections'
import { Button } from '../../Button'
import { Modal } from '../../Modal'

type RemoveCandidateModalProps = {
  candidate: Candidate | null
  onClose: () => void
  onConfirm: () => void
}

export function RemoveCandidateModal({
  candidate,
  onClose,
  onConfirm,
}: RemoveCandidateModalProps) {
  return (
    <Modal
      open={candidate != null}
      title="Remove Candidate?"
      onClose={onClose}
    >
      {candidate ? (
        <div>
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-lg font-bold text-navy">Remove Candidate?</h2>
            <button
              type="button"
              className="rounded-lg p-1 text-navy-muted hover:bg-slate-100"
              aria-label="Close confirmation"
              onClick={onClose}
            >
              <X className="size-5" />
            </button>
          </div>
          <p className="mt-3 text-sm text-navy-muted">
            Are you sure you want to remove {candidate.name} from this election?
          </p>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              className="w-full sm:w-auto"
              onClick={onConfirm}
            >
              Remove Candidate
            </Button>
          </div>
        </div>
      ) : null}
    </Modal>
  )
}
