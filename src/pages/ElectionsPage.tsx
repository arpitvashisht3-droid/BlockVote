import { SearchX } from 'lucide-react'
import { useMemo, useState } from 'react'
import { ElectionCard } from '../components/elections/ElectionCard'
import { ElectionTabs, type ElectionTab } from '../components/elections/ElectionTabs'
import { FilterMenu } from '../components/elections/FilterMenu'
import { SearchBar } from '../components/elections/SearchBar'
import { Button } from '../components/Button'
import {
  filterElections,
  getAllElections,
  type ElectionSort,
} from '../data/elections'

export function ElectionsPage() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<ElectionTab>('all')
  const [sort, setSort] = useState<ElectionSort>('default')

  const visibleElections = useMemo(
    () => filterElections(getAllElections(), { query, status, sort }),
    [query, status, sort],
  )

  const hasActiveFilters =
    query.trim().length > 0 || status !== 'all' || sort !== 'default'

  function resetFilters() {
    setQuery('')
    setStatus('all')
    setSort('default')
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-navy sm:text-4xl">
          All Elections
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-navy-muted sm:text-base">
          Participate in active elections and make your voice count.
        </p>
      </header>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBar value={query} onChange={setQuery} />
        <FilterMenu sort={sort} onSortChange={setSort} />
      </div>

      <ElectionTabs value={status} onChange={setStatus} />

      {visibleElections.length > 0 ? (
        <ul id="elections-list" className="mt-6 flex flex-col gap-4">
          {visibleElections.map((election) => (
            <li key={election.id}>
              <ElectionCard election={election} />
            </li>
          ))}
        </ul>
      ) : (
        <div id="elections-list" className="card mt-6 px-6 py-14 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-accent-soft text-accent">
            <SearchX className="size-5" aria-hidden="true" />
          </span>
          <h2 className="mt-4 text-lg font-semibold text-navy">
            No elections found
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-navy-muted">
            Nothing matches your current search or filters. Try another keyword
            or reset to see every election.
          </p>
          {hasActiveFilters ? (
            <Button className="mt-6" onClick={resetFilters}>
              Reset filters
            </Button>
          ) : null}
        </div>
      )}
    </div>
  )
}
