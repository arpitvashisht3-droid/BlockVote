import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, Plus, SearchX } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AdminElectionFilters } from '../components/admin/elections/AdminElectionFilters'
import { AdminElectionSummary } from '../components/admin/elections/AdminElectionSummary'
import { AdminElectionTable } from '../components/admin/elections/AdminElectionTable'
import { ElectionControlModal } from '../components/admin/manage-election/ElectionControlModal'
import { Button } from '../components/Button'
import { buttonClassName } from '../components/buttonStyles'
import { fetchBackendElections, type ElectionType } from '../data/elections'
import {
  archiveElectionById,
  duplicateElection,
  filterAdminElections,
  listAdminElections,
  summarizeAdminElections,
  type AdminListSort,
  type AdminListStatus,
  type ElectionManagement,
} from '../data/manageElection'

import { useDemoAuth } from '../context/DemoAuthContext'

export function AdminElectionsPage() {
  const { user } = useDemoAuth()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<AdminListStatus>('all')
  const [electionType, setElectionType] = useState<'all' | ElectionType>('all')
  const [sort, setSort] = useState<AdminListSort>('newest')
  const [items, setItems] = useState(() => listAdminElections(user?.id))
  const [archiveTarget, setArchiveTarget] = useState<ElectionManagement | null>(
    null,
  )
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<number | undefined>(undefined)

  useEffect(() => {
    fetchBackendElections(true)
      .then(() => setItems(listAdminElections(user?.id)))
      .catch(console.error)
  }, [user?.id])

  useEffect(() => {
    return () => window.clearTimeout(toastTimer.current)
  }, [])

  const visible = useMemo(
    () => filterAdminElections(items, { query, status, electionType, sort }),
    [items, query, status, electionType, sort],
  )
  const summary = summarizeAdminElections(items)
  const hasFilters =
    query.trim().length > 0 ||
    status !== 'all' ||
    electionType !== 'all' ||
    sort !== 'newest'

  function refresh() {
    setItems(listAdminElections(user?.id))
  }

  function showToast(message: string) {
    setToast(message)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 3500)
  }

  function clearFilters() {
    setQuery('')
    setStatus('all')
    setElectionType('all')
    setSort('newest')
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 overflow-x-hidden">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy sm:text-3xl">
            Elections
          </h1>
          <p className="mt-1 text-sm text-navy-muted sm:text-base">
            Create, monitor, and manage all your elections.
          </p>
        </div>
        <Link
          to="/admin/elections/create"
          className={buttonClassName({ className: 'w-full sm:w-auto' })}
        >
          <Plus className="size-4" aria-hidden="true" />
          Create Election
        </Link>
      </header>

      <AdminElectionSummary
        total={summary.total}
        live={summary.live}
        upcoming={summary.upcoming}
        completed={summary.completed}
      />

      <AdminElectionFilters
        query={query}
        status={status}
        electionType={electionType}
        sort={sort}
        onQueryChange={setQuery}
        onStatusChange={setStatus}
        onTypeChange={setElectionType}
        onSortChange={setSort}
      />

      {visible.length > 0 ? (
        <AdminElectionTable
          items={visible}
          onCopyId={(item) => {
            void navigator.clipboard
              ?.writeText(item.election.electionCode)
              .then(() => showToast('Election ID copied.'))
              .catch(() => showToast('Could not copy the election ID.'))
          }}
          onDuplicate={(item) => {
            duplicateElection(item)
            refresh()
            showToast('Election duplicated in this session.')
          }}
          onArchive={setArchiveTarget}
        />
      ) : (
        <div className="card px-6 py-14 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-accent-soft text-accent">
            <SearchX className="size-5" aria-hidden="true" />
          </span>
          <h2 className="mt-4 text-lg font-semibold text-navy">
            No elections found
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-navy-muted">
            Try changing your search or filters.
          </p>
          {hasFilters ? (
            <Button variant="secondary" className="mt-6" onClick={clearFilters}>
              Clear Filters
            </Button>
          ) : null}
        </div>
      )}

      <ElectionControlModal
        action={archiveTarget ? 'archive' : null}
        onClose={() => setArchiveTarget(null)}
        onConfirm={() => {
          if (archiveTarget) {
            archiveElectionById(archiveTarget.election.id)
            refresh()
            showToast('Election archived.')
          }
          setArchiveTarget(null)
        }}
      />

      {toast ? (
        <div
          role="status"
          className="fixed right-4 bottom-4 z-40 flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-3 text-sm font-medium text-navy shadow-lg"
        >
          <Check className="size-4 text-accent" aria-hidden="true" />
          {toast}
        </div>
      ) : null}
    </div>
  )
}
