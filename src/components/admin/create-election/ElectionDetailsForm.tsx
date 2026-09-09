import { electionTypes, type DetailsErrors, type ElectionDetailsFields } from '../../../data/createElection'

type ElectionDetailsFormProps = {
  value: ElectionDetailsFields
  errors: DetailsErrors
  onChange: (patch: Partial<ElectionDetailsFields>) => void
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) {
    return null
  }

  return (
    <p id={id} className="field-error" role="alert">
      {message}
    </p>
  )
}

export function ElectionDetailsForm({
  value,
  errors,
  onChange,
}: ElectionDetailsFormProps) {
  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="election-name" className="field-label">
          Election Name <span className="text-rose-600">*</span>
        </label>
        <input
          id="election-name"
          className={`field-input ${errors.name ? 'field-input-error' : ''}`}
          value={value.name}
          placeholder="e.g. Student Council Election 2024"
          autoComplete="off"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? 'election-name-error' : undefined}
          onChange={(event) => onChange({ name: event.target.value })}
        />
        <FieldError id="election-name-error" message={errors.name} />
      </div>

      <div>
        <label htmlFor="election-description" className="field-label">
          Description <span className="text-rose-600">*</span>
        </label>
        <textarea
          id="election-description"
          rows={4}
          className={`field-input resize-y ${errors.description ? 'field-input-error' : ''}`}
          value={value.description}
          placeholder="Explain the purpose of this election and who should participate."
          aria-invalid={Boolean(errors.description)}
          aria-describedby={
            errors.description ? 'election-description-error' : undefined
          }
          onChange={(event) => onChange({ description: event.target.value })}
        />
        <FieldError id="election-description-error" message={errors.description} />
      </div>

      <div>
        <label htmlFor="election-type" className="field-label">
          Election Type
        </label>
        <select
          id="election-type"
          className="field-input"
          value={value.type}
          onChange={(event) =>
            onChange({
              type: event.target.value as ElectionDetailsFields['type'],
            })
          }
        >
          {electionTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="election-start-date" className="field-label">
            Start Date <span className="text-rose-600">*</span>
          </label>
          <input
            id="election-start-date"
            type="date"
            className={`field-input ${errors.startDate ? 'field-input-error' : ''}`}
            value={value.startDate}
            aria-invalid={Boolean(errors.startDate)}
            aria-describedby={
              errors.startDate ? 'election-start-date-error' : undefined
            }
            onChange={(event) => onChange({ startDate: event.target.value })}
          />
          <FieldError id="election-start-date-error" message={errors.startDate} />
        </div>
        <div>
          <label htmlFor="election-start-time" className="field-label">
            Start Time <span className="text-rose-600">*</span>
          </label>
          <input
            id="election-start-time"
            type="time"
            className={`field-input ${errors.startTime ? 'field-input-error' : ''}`}
            value={value.startTime}
            aria-invalid={Boolean(errors.startTime)}
            aria-describedby={
              errors.startTime ? 'election-start-time-error' : undefined
            }
            onChange={(event) => onChange({ startTime: event.target.value })}
          />
          <FieldError id="election-start-time-error" message={errors.startTime} />
        </div>
        <div>
          <label htmlFor="election-end-date" className="field-label">
            End Date <span className="text-rose-600">*</span>
          </label>
          <input
            id="election-end-date"
            type="date"
            className={`field-input ${errors.endDate ? 'field-input-error' : ''}`}
            value={value.endDate}
            aria-invalid={Boolean(errors.endDate)}
            aria-describedby={
              errors.endDate ? 'election-end-date-error' : undefined
            }
            onChange={(event) => onChange({ endDate: event.target.value })}
          />
          <FieldError id="election-end-date-error" message={errors.endDate} />
        </div>
        <div>
          <label htmlFor="election-end-time" className="field-label">
            End Time <span className="text-rose-600">*</span>
          </label>
          <input
            id="election-end-time"
            type="time"
            className={`field-input ${errors.endTime ? 'field-input-error' : ''}`}
            value={value.endTime}
            aria-invalid={Boolean(errors.endTime)}
            aria-describedby={
              errors.endTime ? 'election-end-time-error' : undefined
            }
            onChange={(event) => onChange({ endTime: event.target.value })}
          />
          <FieldError id="election-end-time-error" message={errors.endTime} />
        </div>
      </div>

      <div>
        <label htmlFor="election-organization" className="field-label">
          Election Location / Organization
        </label>
        <input
          id="election-organization"
          className="field-input"
          value={value.organization}
          placeholder="e.g. ABC University"
          autoComplete="organization"
          onChange={(event) => onChange({ organization: event.target.value })}
        />
      </div>

      <div>
        <label htmlFor="election-id" className="field-label">
          Election ID
        </label>
        <input
          id="election-id"
          className="field-input font-mono"
          value={value.electionCode}
          readOnly
        />
        <p className="field-help">
          An election ID uniquely identifies this election.
        </p>
      </div>
    </div>
  )
}
