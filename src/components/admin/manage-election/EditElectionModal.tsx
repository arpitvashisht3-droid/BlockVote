import { useId, useState } from 'react'
import { X } from 'lucide-react'
import {
  formatDateTimeLabel,
  parseElectionDate,
  type ElectionVisibility,
} from '../../../data/createElection'
import type { Election } from '../../../data/elections'
import { parseDisplayDateTime } from '../../../data/manageElection'
import { visibilityOptions } from '../../../data/votingSettings'
import { Button } from '../../Button'
import { Modal } from '../../Modal'

type EditElectionModalProps = {
  open: boolean
  election: Election
  organization: string
  visibility: ElectionVisibility
  onClose: () => void
  onSave: (next: {
    title: string
    description: string
    organization: string
    startDate: string
    endDate: string
    visibility: ElectionVisibility
  }) => void
}

type FormState = {
  title: string
  description: string
  organization: string
  startDate: string
  startTime: string
  endDate: string
  endTime: string
  visibility: ElectionVisibility
}

function getInitial(election: Election, organization: string, visibility: ElectionVisibility): FormState {
  const start = parseDisplayDateTime(election.startDate)
  const end = parseDisplayDateTime(election.endDate)
  return {
    title: election.title,
    description: election.detailsDescription || election.description,
    organization,
    startDate: start?.date ?? '',
    startTime: start?.time ?? '09:00',
    endDate: end?.date ?? '',
    endTime: end?.time ?? '21:00',
    visibility,
  }
}

export function EditElectionModal({
  open,
  election,
  organization,
  visibility,
  onClose,
  onSave,
}: EditElectionModalProps) {
  return (
    <Modal
      open={open}
      title="Edit Election"
      onClose={onClose}
      className="max-h-[90vh] max-w-lg overflow-y-auto"
    >
      {open ? (
        <EditElectionFields
          key={election.id}
          election={election}
          organization={organization}
          visibility={visibility}
          onClose={onClose}
          onSave={onSave}
        />
      ) : null}
    </Modal>
  )
}

function EditElectionFields({
  election,
  organization,
  visibility,
  onClose,
  onSave,
}: Omit<EditElectionModalProps, 'open'>) {
  const formId = useId()
  const [values, setValues] = useState(() =>
    getInitial(election, organization, visibility),
  )
  const [attempted, setAttempted] = useState(false)
  const start = parseElectionDate(values.startDate, values.startTime)
  const end = parseElectionDate(values.endDate, values.endTime)
  const errors = {
    title: values.title.trim() ? undefined : 'Election name is required.',
    description: values.description.trim()
      ? undefined
      : 'A description is required.',
    startDate: values.startDate ? undefined : 'Start date is required.',
    endDate: values.endDate ? undefined : 'End date is required.',
    range:
      start && end && end <= start
        ? 'End must be after the start date and time.'
        : undefined,
  }
  const invalid = Boolean(
    errors.title ||
      errors.description ||
      errors.startDate ||
      errors.endDate ||
      errors.range,
  )

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setValues((current) => ({ ...current, [key]: value }))
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        setAttempted(true)
        if (invalid) {
          return
        }
        onSave({
          title: values.title.trim(),
          description: values.description.trim(),
          organization: values.organization.trim() || 'Not specified',
          startDate: formatDateTimeLabel(values.startDate, values.startTime),
          endDate: formatDateTimeLabel(values.endDate, values.endTime),
          visibility: values.visibility,
        })
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-bold text-navy">Edit Election</h2>
        <button
          type="button"
          className="rounded-lg p-1 text-navy-muted hover:bg-slate-100"
          aria-label="Close edit election"
          onClick={onClose}
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <label htmlFor={`${formId}-title`} className="field-label">
            Election Name <span className="text-rose-600">*</span>
          </label>
          <input
            id={`${formId}-title`}
            className={`field-input ${attempted && errors.title ? 'field-input-error' : ''}`}
            value={values.title}
            onChange={(event) => update('title', event.target.value)}
          />
          {attempted && errors.title ? (
            <p className="field-error">{errors.title}</p>
          ) : null}
        </div>
        <div>
          <label htmlFor={`${formId}-description`} className="field-label">
            Description <span className="text-rose-600">*</span>
          </label>
          <textarea
            id={`${formId}-description`}
            rows={4}
            className={`field-input resize-y ${attempted && errors.description ? 'field-input-error' : ''}`}
            value={values.description}
            onChange={(event) => update('description', event.target.value)}
          />
          {attempted && errors.description ? (
            <p className="field-error">{errors.description}</p>
          ) : null}
        </div>
        <div>
          <label htmlFor={`${formId}-org`} className="field-label">
            Organization
          </label>
          <input
            id={`${formId}-org`}
            className="field-input"
            value={values.organization}
            onChange={(event) => update('organization', event.target.value)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor={`${formId}-start-date`} className="field-label">
              Start Date
            </label>
            <input
              id={`${formId}-start-date`}
              type="date"
              className="field-input"
              value={values.startDate}
              onChange={(event) => update('startDate', event.target.value)}
            />
          </div>
          <div>
            <label htmlFor={`${formId}-start-time`} className="field-label">
              Start Time
            </label>
            <input
              id={`${formId}-start-time`}
              type="time"
              className="field-input"
              value={values.startTime}
              onChange={(event) => update('startTime', event.target.value)}
            />
          </div>
          <div>
            <label htmlFor={`${formId}-end-date`} className="field-label">
              End Date
            </label>
            <input
              id={`${formId}-end-date`}
              type="date"
              className="field-input"
              value={values.endDate}
              onChange={(event) => update('endDate', event.target.value)}
            />
          </div>
          <div>
            <label htmlFor={`${formId}-end-time`} className="field-label">
              End Time
            </label>
            <input
              id={`${formId}-end-time`}
              type="time"
              className="field-input"
              value={values.endTime}
              onChange={(event) => update('endTime', event.target.value)}
            />
          </div>
        </div>
        {attempted && errors.range ? (
          <p className="field-error">{errors.range}</p>
        ) : null}
        <div>
          <label htmlFor={`${formId}-visibility`} className="field-label">
            Visibility
          </label>
          <select
            id={`${formId}-visibility`}
            className="field-input"
            value={values.visibility}
            onChange={(event) =>
              update('visibility', event.target.value as ElectionVisibility)
            }
          >
            {visibilityOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`${formId}-code`} className="field-label">
            Election ID
          </label>
          <input
            id={`${formId}-code`}
            className="field-input font-mono"
            value={election.electionCode}
            readOnly
          />
        </div>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" className="w-full sm:w-auto" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" className="w-full sm:w-auto">
          Save Changes
        </Button>
      </div>
    </form>
  )
}
