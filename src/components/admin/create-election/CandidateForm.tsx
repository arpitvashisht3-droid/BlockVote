import { useId, useState } from 'react'
import { X } from 'lucide-react'
import {
  candidateIsValid,
  validateCandidate,
  type CandidateErrors,
  type DraftCandidate,
} from '../../../data/createElection'
import { Button } from '../../Button'
import { Modal } from '../../Modal'

const emptyCandidate = {
  name: '',
  department: '',
  position: '',
  about: '',
}

type CandidateDraftValues = typeof emptyCandidate

type CandidateFormProps = {
  open: boolean
  candidate: DraftCandidate | null
  onClose: () => void
  onSave: (candidate: Omit<DraftCandidate, 'id'> & { id?: string }) => void
  strict?: boolean
}

function getInitialValues(candidate: DraftCandidate | null): CandidateDraftValues {
  if (!candidate) {
    return emptyCandidate
  }

  return {
    name: candidate.name,
    department: candidate.department,
    position: candidate.position,
    about: candidate.about,
  }
}

export function CandidateForm({
  open,
  candidate,
  onClose,
  onSave,
  strict = false,
}: CandidateFormProps) {
  const title = candidate ? 'Edit Candidate' : 'Add Candidate'

  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      className="max-h-[90vh] max-w-lg overflow-y-auto"
    >
      {open ? (
        <CandidateFormFields
          key={candidate?.id ?? 'new'}
          title={title}
          candidate={candidate}
          onClose={onClose}
          onSave={onSave}
          strict={strict}
        />
      ) : null}
    </Modal>
  )
}

type CandidateFormFieldsProps = {
  title: string
  candidate: DraftCandidate | null
  onClose: () => void
  onSave: (candidate: Omit<DraftCandidate, 'id'> & { id?: string }) => void
  strict: boolean
}

function CandidateFormFields({
  title,
  candidate,
  onClose,
  onSave,
  strict,
}: CandidateFormFieldsProps) {
  const formId = useId()
  const [values, setValues] = useState(() => getInitialValues(candidate))
  const [errors, setErrors] = useState<CandidateErrors>({})
  const [attempted, setAttempted] = useState(false)
  const options = { strict }

  function update<K extends keyof CandidateDraftValues>(
    key: K,
    value: CandidateDraftValues[K],
  ) {
    const next = { ...values, [key]: value }
    setValues(next)
    if (attempted) {
      setErrors(validateCandidate(next, options))
    }
  }

  function handleSubmit() {
    setAttempted(true)
    const nextErrors = validateCandidate(values, options)
    setErrors(nextErrors)

    if (!candidateIsValid(values, options)) {
      return
    }

    onSave({
      id: candidate?.id,
      name: values.name.trim(),
      department: values.department.trim(),
      position: values.position.trim(),
      about: values.about.trim(),
    })
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        handleSubmit()
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-bold text-navy">{title}</h2>
        <button
          type="button"
          className="rounded-lg p-1 text-navy-muted transition-colors hover:bg-slate-100 hover:text-navy"
          aria-label="Close candidate form"
          onClick={onClose}
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <label htmlFor={`${formId}-name`} className="field-label">
            Candidate Name <span className="text-rose-600">*</span>
          </label>
          <input
            id={`${formId}-name`}
            className={`field-input ${errors.name ? 'field-input-error' : ''}`}
            value={values.name}
            placeholder="e.g. Rahul Sharma"
            aria-invalid={Boolean(errors.name)}
            onChange={(event) => update('name', event.target.value)}
          />
          {errors.name ? (
            <p className="field-error" role="alert">
              {errors.name}
            </p>
          ) : null}
        </div>
        <div>
          <label htmlFor={`${formId}-department`} className="field-label">
            Department / Organization <span className="text-rose-600">*</span>
          </label>
          <input
            id={`${formId}-department`}
            className={`field-input ${errors.department ? 'field-input-error' : ''}`}
            value={values.department}
            placeholder="e.g. Computer Science"
            aria-invalid={Boolean(errors.department)}
            onChange={(event) => update('department', event.target.value)}
          />
          {errors.department ? (
            <p className="field-error" role="alert">
              {errors.department}
            </p>
          ) : null}
        </div>
        <div>
          <label htmlFor={`${formId}-position`} className="field-label">
            Position
            {strict ? <span className="text-rose-600"> *</span> : null}
          </label>
          <input
            id={`${formId}-position`}
            className={`field-input ${errors.position ? 'field-input-error' : ''}`}
            value={values.position}
            placeholder="e.g. President"
            aria-invalid={Boolean(errors.position)}
            onChange={(event) => update('position', event.target.value)}
          />
          {errors.position ? (
            <p className="field-error" role="alert">
              {errors.position}
            </p>
          ) : null}
        </div>
        <div>
          <label htmlFor={`${formId}-about`} className="field-label">
            Short Biography
            {strict ? <span className="text-rose-600"> *</span> : null}
          </label>
          <textarea
            id={`${formId}-about`}
            rows={4}
            className={`field-input resize-y ${errors.about ? 'field-input-error' : ''}`}
            value={values.about}
            placeholder="A short introduction for the ballot."
            aria-invalid={Boolean(errors.about)}
            onChange={(event) => update('about', event.target.value)}
          />
          {strict ? (
            <p className="field-help">Use at least 40 characters.</p>
          ) : null}
          {errors.about ? (
            <p className="field-error" role="alert">
              {errors.about}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          variant="secondary"
          className="w-full sm:w-auto"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button type="submit" className="w-full sm:w-auto">
          Save Candidate
        </Button>
      </div>
    </form>
  )
}
