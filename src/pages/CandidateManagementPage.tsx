import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, Plus, SearchX } from 'lucide-react'
import { CandidateElectionSelector } from '../components/admin/candidates/CandidateElectionSelector'
import { CandidateFilters } from '../components/admin/candidates/CandidateFilters'
import { CandidatePositions } from '../components/admin/candidates/CandidatePositions'
import { CandidateProfile } from '../components/admin/candidates/CandidateProfile'
import { CandidateSummary } from '../components/admin/candidates/CandidateSummary'
import { CandidateTable } from '../components/admin/candidates/CandidateTable'
import { RemoveCandidateModal } from '../components/admin/candidates/RemoveCandidateModal'
import { CandidateForm } from '../components/admin/create-election/CandidateForm'
import { Button } from '../components/Button'
import {
  canRemoveCandidate,
  DEFAULT_CANDIDATE_ELECTION_ID,
  filterCandidates,
  getUniqueDepartments,
  getUniquePositions,
  summarizeCandidates,
  type CandidateStatusFilter,
} from '../data/candidateManagement'
import {
  createCandidateId,
  type DraftCandidate,
} from '../data/createElection'
import type { Candidate } from '../data/elections'
import {
  fromDraftCandidate,
  getActiveCandidates,
  listAdminElections,
  saveElectionManagement,
  toDraftCandidate,
  type ElectionManagement,
  type ManageActivityItem,
} from '../data/manageElection'

function prependActivity(
  items: ManageActivityItem[],
  title: string,
): ManageActivityItem[] {
  return [
    {
      id: `candidate-${Date.now()}`,
      title,
      time: 'Just now',
      type: 'updated',
    },
    ...items,
  ]
}

export function CandidateManagementPage() {
  const [items, setItems] = useState(() => listAdminElections())
  const [selectedId, setSelectedId] = useState(DEFAULT_CANDIDATE_ELECTION_ID)
  const [query, setQuery] = useState('')
  const [position, setPosition] = useState('all')
  const [department, setDepartment] = useState('all')
  const [status, setStatus] = useState<CandidateStatusFilter>('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<DraftCandidate | null>(null)
  const [profile, setProfile] = useState<Candidate | null>(null)
  const [removeTarget, setRemoveTarget] = useState<Candidate | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<number | undefined>(undefined)

  useEffect(() => {
    return () => window.clearTimeout(toastTimer.current)
  }, [])

  const selected =
    items.find((item) => item.election.id === selectedId) ??
    items.find((item) => item.election.id === DEFAULT_CANDIDATE_ELECTION_ID) ??
    items[0]

  const candidates = useMemo(
    () => selected?.election.candidates ?? [],
    [selected],
  )
  const positions = useMemo(() => getUniquePositions(candidates), [candidates])
  const departments = useMemo(
    () => getUniqueDepartments(candidates),
    [candidates],
  )
  const visible = useMemo(
    () => filterCandidates(candidates, { query, position, department, status }),
    [candidates, query, position, department, status],
  )
  const summary = selected
    ? summarizeCandidates(selected.election)
    : { total: 0, active: 0, positions: 0, electionTitle: '—' }
  const activeCount = getActiveCandidates(candidates).length
  const hasFilters =
    query.trim().length > 0 ||
    position !== 'all' ||
    department !== 'all' ||
    status !== 'all'

  function refresh() {
    setItems(listAdminElections())
  }

  function showToast(message: string) {
    setToast(message)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 3500)
  }

  function persist(
    mutator: (current: ElectionManagement) => ElectionManagement,
  ) {
    if (!selected) {
      return
    }

    saveElectionManagement(mutator(selected))
    refresh()
  }

  function closeForm() {
    setFormOpen(false)
    setEditing(null)
  }

  function handleSave(draft: Omit<DraftCandidate, 'id'> & { id?: string }) {
    persist((current) => {
      const existing = current.election.candidates
      if (draft.id) {
        return {
          ...current,
          election: {
            ...current.election,
            candidates: existing.map((candidate) =>
              candidate.id === draft.id
                ? fromDraftCandidate(draft, candidate)
                : candidate,
            ),
          },
          activityLog: prependActivity(
            current.activityLog,
            `${draft.name.trim()} updated`,
          ),
        }
      }

      const id = createCandidateId(draft.name)
      return {
        ...current,
        election: {
          ...current.election,
          candidates: [...existing, fromDraftCandidate({ ...draft, id })],
        },
        activityLog: prependActivity(
          current.activityLog,
          `${draft.name.trim()} added`,
        ),
      }
    })
    closeForm()
    showToast(
      draft.id
        ? 'Candidate updated successfully.'
        : 'Candidate added successfully.',
    )
  }

  function handleRemove() {
    if (!removeTarget || !canRemoveCandidate(candidates, removeTarget.id)) {
      setRemoveTarget(null)
      return
    }

    persist((current) => ({
      ...current,
      election: {
        ...current.election,
        candidates: current.election.candidates.map((candidate) =>
          candidate.id === removeTarget.id
            ? { ...candidate, removed: true }
            : candidate,
        ),
      },
      activityLog: prependActivity(
        current.activityLog,
        `${removeTarget.name} removed`,
      ),
    }))
    setRemoveTarget(null)
    showToast('Candidate removed.')
  }

  function clearFilters() {
    setQuery('')
    setPosition('all')
    setDepartment('all')
    setStatus('all')
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 overflow-x-hidden">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy sm:text-3xl">
            Candidate Management
          </h1>
          <p className="mt-1 text-sm text-navy-muted sm:text-base">
            Manage candidates across your elections.
          </p>
        </div>
        <Button
          className="w-full sm:w-auto"
          disabled={!selected}
          onClick={() => {
            setEditing(null)
            setFormOpen(true)
          }}
        >
          <Plus className="size-4" aria-hidden="true" />
          Add Candidate
        </Button>
      </header>

      <CandidateElectionSelector
        items={items}
        selectedId={selected?.election.id ?? ''}
        onChange={(id) => {
          setSelectedId(id)
          setQuery('')
          setPosition('all')
          setDepartment('all')
          setStatus('all')
        }}
      />

      {selected ? (
        <>
          <CandidateFilters
            query={query}
            position={position}
            department={department}
            status={status}
            positions={positions}
            departments={departments}
            onQueryChange={setQuery}
            onPositionChange={setPosition}
            onDepartmentChange={setDepartment}
            onStatusChange={setStatus}
          />

          <CandidatePositions
            positions={positions}
            selected={position}
            onSelect={setPosition}
          />

          <CandidateSummary
            total={summary.total}
            active={summary.active}
            positions={summary.positions}
            electionTitle={summary.electionTitle}
          />

          {activeCount <= 2 ? (
            <p className="text-sm text-navy-muted" role="status">
              At least two active candidates must remain on the ballot. Remove
              is disabled when this election is at that minimum.
            </p>
          ) : null}

          {visible.length > 0 ? (
            <CandidateTable
              election={selected.election}
              candidates={candidates}
              visible={visible}
              onView={setProfile}
              onEdit={(candidate) => {
                setEditing(toDraftCandidate(candidate))
                setFormOpen(true)
              }}
              onRemove={(candidate) => {
                if (canRemoveCandidate(candidates, candidate.id)) {
                  setRemoveTarget(candidate)
                  return
                }
                showToast(
                  'At least two active candidates must remain on the ballot.',
                )
              }}
            />
          ) : (
            <div className="card px-6 py-14 text-center">
              <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-accent-soft text-accent">
                <SearchX className="size-5" aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-lg font-semibold text-navy">
                No candidates found
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-navy-muted">
                Try changing your search or filters, or add a candidate to this
                election.
              </p>
              {hasFilters ? (
                <Button
                  variant="secondary"
                  className="mt-6"
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
              ) : null}
            </div>
          )}

          <CandidateForm
            open={formOpen}
            candidate={editing}
            onClose={closeForm}
            onSave={handleSave}
            strict
          />
          <CandidateProfile
            candidate={profile}
            election={selected.election}
            onClose={() => setProfile(null)}
          />
          <RemoveCandidateModal
            candidate={removeTarget}
            onClose={() => setRemoveTarget(null)}
            onConfirm={handleRemove}
          />
        </>
      ) : (
        <div className="card px-6 py-14 text-center">
          <h2 className="text-lg font-semibold text-navy">No elections yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-navy-muted">
            Create an election first, then come back to manage its candidates.
          </p>
        </div>
      )}

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
