import { SearchBar } from '../../elections/SearchBar'
import { electionTypes, type ElectionType } from '../../../data/elections'
import type {
  AdminListSort,
  AdminListStatus,
} from '../../../data/manageElection'

type AdminElectionFiltersProps = {
  query: string
  status: AdminListStatus
  electionType: 'all' | ElectionType
  sort: AdminListSort
  onQueryChange: (value: string) => void
  onStatusChange: (value: AdminListStatus) => void
  onTypeChange: (value: 'all' | ElectionType) => void
  onSortChange: (value: AdminListSort) => void
}

const statuses: { id: AdminListStatus; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'live', label: 'Live' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'paused', label: 'Paused' },
  { id: 'ended', label: 'Ended' },
]

const sorts: { id: AdminListSort; label: string }[] = [
  { id: 'newest', label: 'Newest' },
  { id: 'oldest', label: 'Oldest' },
  { id: 'votes', label: 'Most Votes' },
  { id: 'ending', label: 'Ending Soon' },
]

export function AdminElectionFilters({
  query,
  status,
  electionType,
  sort,
  onQueryChange,
  onStatusChange,
  onTypeChange,
  onSortChange,
}: AdminElectionFiltersProps) {
  return (
    <div className="flex flex-col gap-3">
      <SearchBar
        id="admin-election-search"
        value={query}
        onChange={onQueryChange}
      />
      <div
        role="group"
        aria-label="Filter by status"
        className="flex flex-wrap gap-2"
      >
        {statuses.map((item) => {
          const selected = item.id === status
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={selected}
              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                selected
                  ? 'bg-accent text-white'
                  : 'border border-border bg-white text-navy-muted hover:text-navy'
              }`}
              onClick={() => onStatusChange(item.id)}
            >
              {item.label}
            </button>
          )
        })}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="admin-election-type" className="sr-only">
            Election type
          </label>
          <select
            id="admin-election-type"
            className="field-input"
            value={electionType}
            onChange={(event) =>
              onTypeChange(event.target.value as 'all' | ElectionType)
            }
          >
            <option value="all">All types</option>
            {electionTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="admin-election-sort" className="sr-only">
            Sort elections
          </label>
          <select
            id="admin-election-sort"
            className="field-input"
            value={sort}
            onChange={(event) => onSortChange(event.target.value as AdminListSort)}
          >
            {sorts.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
