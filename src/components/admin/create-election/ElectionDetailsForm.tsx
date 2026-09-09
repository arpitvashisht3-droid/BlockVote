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

      {/* Type-Specific Eligibility Configuration Fields */}
      {value.type === 'Society Election' && (
        <div>
          <label htmlFor="society-name" className="field-label">
            Society Name <span className="text-rose-600">*</span>
          </label>
          <input
            id="society-name"
            className={`field-input ${errors.societyName ? 'field-input-error' : ''}`}
            value={value.societyName}
            placeholder="e.g. Computer Science Society"
            aria-invalid={Boolean(errors.societyName)}
            onChange={(e) => onChange({ societyName: e.target.value })}
          />
          <FieldError id="society-name-error" message={errors.societyName} />
        </div>
      )}

      {value.type === 'College Election' && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="college-name" className="field-label">
              College Name <span className="text-rose-600">*</span>
            </label>
            <input
              id="college-name"
              className={`field-input ${errors.collegeName ? 'field-input-error' : ''}`}
              value={value.collegeName}
              placeholder="e.g. St. Xavier's College"
              aria-invalid={Boolean(errors.collegeName)}
              onChange={(e) => onChange({ collegeName: e.target.value })}
            />
            <FieldError id="college-name-error" message={errors.collegeName} />
          </div>
          <div>
            <label htmlFor="college-id-field" className="field-label">
              College ID / Code <span className="text-rose-600">*</span>
            </label>
            <input
              id="college-id-field"
              className={`field-input ${errors.collegeId ? 'field-input-error' : ''}`}
              value={value.collegeId}
              placeholder="e.g. SXC-2026"
              aria-invalid={Boolean(errors.collegeId)}
              onChange={(e) => onChange({ collegeId: e.target.value })}
            />
            <FieldError id="college-id-error" message={errors.collegeId} />
          </div>
        </div>
      )}

      {value.type === 'University Election' && (
        <div>
          <label htmlFor="university-name" className="field-label">
            University Name <span className="text-rose-600">*</span>
          </label>
          <input
            id="university-name"
            className={`field-input ${errors.universityName ? 'field-input-error' : ''}`}
            value={value.universityName}
            placeholder="e.g. Delhi University"
            aria-invalid={Boolean(errors.universityName)}
            onChange={(e) => onChange({ universityName: e.target.value })}
          />
          <FieldError id="university-name-error" message={errors.universityName} />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="secret-code" className="field-label">
            Secret Access Code <span className="text-rose-600">*</span>
          </label>
          <input
            id="secret-code"
            type="password"
            className={`field-input ${errors.secretCode ? 'field-input-error' : ''}`}
            value={value.secretCode}
            placeholder="Set a secret passcode for voters"
            aria-invalid={Boolean(errors.secretCode)}
            onChange={(e) => onChange({ secretCode: e.target.value })}
          />
          <p className="field-help">Voters must enter this code to access the ballot.</p>
          <FieldError id="secret-code-error" message={errors.secretCode} />
        </div>

        <div>
          <label htmlFor="max-voters" className="field-label">
            Maximum Voter Capacity (Cap)
          </label>
          <input
            id="max-voters"
            type="number"
            min="1"
            className={`field-input ${errors.maxVoters ? 'field-input-error' : ''}`}
            value={value.maxVoters}
            placeholder="e.g. 500 (Leave blank for unlimited)"
            aria-invalid={Boolean(errors.maxVoters)}
            onChange={(e) => onChange({ maxVoters: e.target.value })}
          />
          <p className="field-help">Maximum number of voters allowed to cast votes.</p>
          <FieldError id="max-voters-error" message={errors.maxVoters} />
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
