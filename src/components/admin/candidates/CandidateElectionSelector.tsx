import type { ElectionManagement } from '../../../data/manageElection'
import { StatusBadge } from '../../elections/StatusBadge'

type CandidateElectionSelectorProps = {
  items: ElectionManagement[]
  selectedId: string
  onChange: (id: string) => void
}

export function CandidateElectionSelector({
  items,
  selectedId,
  onChange,
}: CandidateElectionSelectorProps) {
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
      <label htmlFor="candidate-election" className="field-label">
        Select Election
      </label>
      <select
        id="candidate-election"
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

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <p className="font-mono text-navy">{election.electionCode}</p>
        <StatusBadge status={election.status} paused={paused} />
        <p className="text-navy-muted">{organization}</p>
      </div>
    </section>
  )
}
