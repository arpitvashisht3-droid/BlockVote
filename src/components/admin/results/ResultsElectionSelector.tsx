import type { ElectionManagement } from '../../../data/manageElection'
import { StatusBadge } from '../../elections/StatusBadge'

type ResultsElectionSelectorProps = {
  items: ElectionManagement[]
  selectedId: string
  onChange: (id: string) => void
}

export function ResultsElectionSelector({
  items,
  selectedId,
  onChange,
}: ResultsElectionSelectorProps) {
  const selected =
    items.find((item) => item.election.id === selectedId) ?? items[0]

  if (!selected) {
    return (
      <section className="card p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-navy">Select Election</h2>
        <p className="mt-2 text-sm text-navy-muted">
          No elections are available in this session.
        </p>
      </section>
    )
  }

  const { election, organization, paused } = selected

  return (
    <section className="card p-5 sm:p-6">
      <label htmlFor="results-election" className="field-label">
        Select Election
      </label>
      <select
        id="results-election"
        className="field-input"
        value={selected.election.id}
        onChange={(event) => onChange(event.target.value)}
      >
        {items.map((item) => (
          <option key={item.election.id} value={item.election.id}>
            {item.election.title}
          </option>
        ))}
      </select>

      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-xs font-semibold tracking-wide text-navy-muted uppercase">
            Election ID
          </dt>
          <dd className="mt-1 font-mono text-navy">{election.electionCode}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold tracking-wide text-navy-muted uppercase">
            Organization
          </dt>
          <dd className="mt-1 text-navy">{organization}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold tracking-wide text-navy-muted uppercase">
            Status
          </dt>
          <dd className="mt-1">
            <StatusBadge status={election.status} paused={paused} />
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold tracking-wide text-navy-muted uppercase">
            Schedule
          </dt>
          <dd className="mt-1 text-navy">
            {election.startDate}
            <span className="mt-0.5 block text-navy-muted">
              to {election.endDate}
            </span>
          </dd>
        </div>
      </dl>
    </section>
  )
}
