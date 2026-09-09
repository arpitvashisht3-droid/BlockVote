import { SearchX } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { ElectionCard } from '../components/elections/ElectionCard'
import { ElectionTabs, type ElectionTab } from '../components/elections/ElectionTabs'
import { FilterMenu } from '../components/elections/FilterMenu'
import { SearchBar } from '../components/elections/SearchBar'
import { Button } from '../components/Button'
import {
  fetchBackendElections,
  filterElections,
  getAllElections,
  type Election,
  type ElectionSort,
} from '../data/elections'
import {
  chainElectionToElection,
  fetchElectionsFromChain,
} from '../services/blockchain'

export function ElectionsPage() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<ElectionTab>('all')
  const [sort, setSort] = useState<ElectionSort>('default')
  const [elections, setElections] = useState<Election[]>(() => getAllElections())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const backendData = await fetchBackendElections()
        const chainData = await fetchElectionsFromChain()
        const mapped = chainData.map(chainElectionToElection)
        const combined = [...backendData]
        for (const c of mapped) {
          if (!combined.some((e) => e.onchainId === c.onchainId || e.id === c.id)) {
            combined.push(c)
          }
        }
        if (mounted) setElections(combined)
      } catch (err) {
        console.error('Failed to load elections:', err)
        if (mounted) setElections(getAllElections())
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  const visibleElections = useMemo(
    () => filterElections(elections, { query, status, sort }),
    [elections, query, status, sort],
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

      {loading ? (
        <div className="card mt-6 px-6 py-14 text-center">
          <p className="text-sm text-navy-muted">Loading elections from blockchain...</p>
        </div>
      ) : visibleElections.length > 0 ? (
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
            {hasActiveFilters
              ? 'Nothing matches your current search or filters. Try another keyword or reset to see every election.'
              : 'No elections have been created yet on the network.'}
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
