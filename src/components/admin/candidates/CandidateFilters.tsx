import { SearchBar } from '../../elections/SearchBar'
import type { CandidateStatusFilter } from '../../../data/candidateManagement'

type CandidateFiltersProps = {
  query: string
  position: string
  department: string
  status: CandidateStatusFilter
  positions: string[]
  departments: string[]
  onQueryChange: (value: string) => void
  onPositionChange: (value: string) => void
  onDepartmentChange: (value: string) => void
  onStatusChange: (value: CandidateStatusFilter) => void
}

const statuses: { id: CandidateStatusFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'removed', label: 'Removed' },
]

export function CandidateFilters({
  query,
  position,
  department,
  status,
  positions,
  departments,
  onQueryChange,
  onPositionChange,
  onDepartmentChange,
  onStatusChange,
}: CandidateFiltersProps) {
  return (
    <section className="flex flex-col gap-3" aria-label="Search and filters">
      <SearchBar
        id="candidate-search"
        value={query}
        onChange={onQueryChange}
        placeholder="Search candidates..."
        label="Search candidates"
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor="candidate-position-filter" className="field-label">
            Position
          </label>
          <select
            id="candidate-position-filter"
            className="field-input"
            value={position}
            onChange={(event) => onPositionChange(event.target.value)}
          >
            <option value="all">All</option>
            {positions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="candidate-department-filter" className="field-label">
            Department
          </label>
          <select
            id="candidate-department-filter"
            className="field-input"
            value={department}
            onChange={(event) => onDepartmentChange(event.target.value)}
          >
            <option value="all">All</option>
            {departments.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="candidate-status-filter" className="field-label">
            Status
          </label>
          <select
            id="candidate-status-filter"
            className="field-input"
            value={status}
            onChange={(event) =>
              onStatusChange(event.target.value as CandidateStatusFilter)
            }
          >
            {statuses.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  )
}
