import { useState } from 'react'
import { X } from 'lucide-react'
import { VotingSettingsForm } from '../create-election/VotingSettingsForm'
import type { VotingSettings } from '../../../data/votingSettings'
import { Button } from '../../Button'
import { Modal } from '../../Modal'

type EditSettingsModalProps = {
  open: boolean
  settings: VotingSettings
  onClose: () => void
  onSave: (settings: VotingSettings) => void
}

export function EditSettingsModal({
  open,
  settings,
  onClose,
  onSave,
}: EditSettingsModalProps) {
  return (
    <Modal
      open={open}
      title="Edit Settings"
      onClose={onClose}
      className="max-h-[90vh] max-w-lg overflow-y-auto"
    >
      {open ? (
        <EditSettingsFields
          key={JSON.stringify(settings)}
          settings={settings}
          onClose={onClose}
          onSave={onSave}
        />
      ) : null}
    </Modal>
  )
}

function EditSettingsFields({
  settings,
  onClose,
  onSave,
}: Omit<EditSettingsModalProps, 'open'>) {
  const [value, setValue] = useState(settings)

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        onSave(value)
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-bold text-navy">Edit Settings</h2>
        <button
          type="button"
          className="rounded-lg p-1 text-navy-muted hover:bg-slate-100"
          aria-label="Close settings"
          onClick={onClose}
        >
          <X className="size-5" />
        </button>
      </div>
      <div className="mt-5">
        <VotingSettingsForm
          value={value}
          onChange={(patch) => setValue((current) => ({ ...current, ...patch }))}
        />
      </div>
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" className="w-full sm:w-auto" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" className="w-full sm:w-auto">
          Save Settings
        </Button>
      </div>
    </form>
  )
}
