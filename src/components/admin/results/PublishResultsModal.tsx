import { X } from 'lucide-react'
import { Button } from '../../Button'
import { Modal } from '../../Modal'

type PublishResultsModalProps = {
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

export function PublishResultsModal({
  open,
  onClose,
  onConfirm,
}: PublishResultsModalProps) {
  return (
    <Modal open={open} title="Publish Results?" onClose={onClose}>
      {open ? (
        <div>
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-lg font-bold text-navy">Publish Results?</h2>
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
            Published results will become visible on the public election results
            page.
          </p>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button className="w-full sm:w-auto" onClick={onConfirm}>
              Publish
            </Button>
          </div>
        </div>
      ) : null}
    </Modal>
  )
}
