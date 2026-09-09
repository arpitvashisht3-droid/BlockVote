import { X } from 'lucide-react'
import { controlCopy, type ControlAction } from '../../../data/manageElection'
import { Button } from '../../Button'
import { Modal } from '../../Modal'

type ElectionControlModalProps = {
  action: ControlAction | null
  onClose: () => void
  onConfirm: () => void
}

export function ElectionControlModal({
  action,
  onClose,
  onConfirm,
}: ElectionControlModalProps) {
  const copy = action ? controlCopy[action] : null

  return (
    <Modal
      open={action != null}
      title={copy?.title ?? 'Confirm'}
      onClose={onClose}
    >
      {copy ? (
        <div>
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-lg font-bold text-navy">{copy.title}</h2>
            <button
              type="button"
              className="rounded-lg p-1 text-navy-muted hover:bg-slate-100"
              aria-label="Close confirmation"
              onClick={onClose}
            >
              <X className="size-5" />
            </button>
          </div>
          <p className="mt-3 text-sm text-navy-muted">{copy.message}</p>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" className="w-full sm:w-auto" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant={copy.danger ? 'danger' : 'primary'}
              className="w-full sm:w-auto"
              onClick={onConfirm}
            >
              {copy.confirm}
            </Button>
          </div>
        </div>
      ) : null}
    </Modal>
  )
}
