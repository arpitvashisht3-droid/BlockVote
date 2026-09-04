import { Loader2, X } from 'lucide-react'
import { Button } from '../../Button'
import { Modal } from '../../Modal'

type PublishElectionModalProps = {
  open: boolean
  publishing: boolean
  onClose: () => void
  onConfirm: () => void
}

export function PublishElectionModal({
  open,
  publishing,
  onClose,
  onConfirm,
}: PublishElectionModalProps) {
  return (
    <Modal
      open={open}
      title="Publish Election?"
      onClose={onClose}
      disableClose={publishing}
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-bold text-navy">Publish Election?</h2>
          <button
            type="button"
            className="rounded-lg p-1 text-navy-muted transition-colors hover:bg-slate-100 hover:text-navy disabled:opacity-50"
            aria-label="Close publish confirmation"
            disabled={publishing}
            onClick={onClose}
          >
            <X className="size-5" />
          </button>
        </div>
        <p className="mt-3 text-sm text-navy-muted">
          Are you sure you want to publish this election?
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="secondary"
            className="w-full sm:w-auto"
            disabled={publishing}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="w-full sm:w-auto"
            disabled={publishing}
            onClick={onConfirm}
          >
            {publishing ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Publishing...
              </>
            ) : (
              'Publish'
            )}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
