import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, Download, RefreshCw } from 'lucide-react'
import { CandidateResultsTable } from '../components/admin/results/CandidateResultsTable'
import { FinalizeResultsModal } from '../components/admin/results/FinalizeResultsModal'
import { LeadingCandidate } from '../components/admin/results/LeadingCandidate'
import { PublishResultsModal } from '../components/admin/results/PublishResultsModal'
import { ResultActivity } from '../components/admin/results/ResultActivity'
import { ResultsControls } from '../components/admin/results/ResultsControls'
import { ResultsElectionSelector } from '../components/admin/results/ResultsElectionSelector'
import { ResultsStatusCard } from '../components/admin/results/ResultsStatusCard'
import { ResultsSummary } from '../components/admin/results/ResultsSummary'
import { ResultVerification } from '../components/admin/results/ResultVerification'
import { TurnoutBreakdown } from '../components/admin/results/TurnoutBreakdown'
import { VotingActivityChart } from '../components/admin/results/VotingActivityChart'
import { Button } from '../components/Button'
import {
  DEFAULT_RESULTS_ELECTION_ID,
  downloadResultsCsv,
  finalizeElectionResults,
  getCandidateResultRows,
  getLeadingRow,
  getResultActivity,
  getResultsSummary,
  isResultsFinalized,
  isResultsPublished,
} from '../data/adminResults'
import {
  listAdminElections,
  saveElectionManagement,
  type ElectionManagement,
  type ManageActivityItem,
} from '../data/manageElection'

function prependActivity(
  items: ManageActivityItem[],
  title: string,
  type: ManageActivityItem['type'] = 'updated',
): ManageActivityItem[] {
  return [
    {
      id: `results-${Date.now()}`,
      title,
      time: 'Just now',
      type,
    },
    ...items,
  ]
}

export function AdminResultsPage() {
  const [items, setItems] = useState(() => listAdminElections())
  const [selectedId, setSelectedId] = useState(DEFAULT_RESULTS_ELECTION_ID)
  const [finalizeOpen, setFinalizeOpen] = useState(false)
  const [publishOpen, setPublishOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<number | undefined>(undefined)

  useEffect(() => {
    return () => window.clearTimeout(toastTimer.current)
  }, [])

  const selected =
    items.find((item) => item.election.id === selectedId) ??
    items.find((item) => item.election.id === DEFAULT_RESULTS_ELECTION_ID) ??
    items[0]

  const rows = useMemo(
    () =>
      selected
        ? getCandidateResultRows(selected.election, selected.paused)
        : [],
    [selected],
  )
  const summary = selected
    ? getResultsSummary(selected.election)
    : {
        registeredVoters: 0,
        votesCast: 0,
        turnoutPercent: 0,
        candidateCount: 0,
        remaining: 0,
      }
  const leader = getLeadingRow(rows)
  const upcoming = selected?.election.status === 'upcoming'
  const ended = selected?.election.status === 'ended'
  const finalized = selected ? isResultsFinalized(selected) : false
  const published = selected ? isResultsPublished(selected.election) : false
  const activity = selected ? getResultActivity(selected) : []

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

  function handleExport() {
    if (!selected) {
      return
    }

    downloadResultsCsv(selected.election, rows)
    showToast('Results exported.')
  }

  function handleRefresh() {
    refresh()
    showToast('Results refreshed.')
  }

  function handleFinalize() {
    persist((current) => ({
      ...current,
      resultsFinalized: true,
      election: finalizeElectionResults(current.election),
      activityLog: prependActivity(
        current.activityLog,
        'Results finalized',
        'ended',
      ),
    }))
    setFinalizeOpen(false)
    showToast('Results finalized.')
  }

  function handlePublish() {
    persist((current) => ({
      ...current,
      election: { ...current.election, published: true },
      activityLog: prependActivity(
        current.activityLog,
        'Results published',
        'updated',
      ),
    }))
    setPublishOpen(false)
    showToast('Results published.')
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 overflow-x-hidden">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-navy sm:text-3xl">
              Election Results
            </h1>
            <span className="rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-semibold tracking-wide text-accent uppercase">
              Results Center
            </span>
          </div>
          <p className="mt-1 text-sm text-navy-muted sm:text-base">
            Monitor election performance and review voting results.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Button
            variant="secondary"
            className="w-full sm:w-auto"
            disabled={!selected}
            onClick={handleExport}
          >
            <Download className="size-4" aria-hidden="true" />
            Export Results
          </Button>
          <Button
            className="w-full sm:w-auto"
            disabled={!selected}
            onClick={handleRefresh}
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            Refresh
          </Button>
        </div>
      </header>

      <ResultsElectionSelector
        items={items}
        selectedId={selected?.election.id ?? ''}
        onChange={(id) => {
          setSelectedId(id)
          setFinalizeOpen(false)
          setPublishOpen(false)
        }}
      />

      {selected ? (
        <>
          <ResultsStatusCard
            status={selected.election.status}
            paused={selected.paused}
          />
          <ResultsSummary stats={summary} />

          {!upcoming && leader ? (
            <LeadingCandidate row={leader} ended={ended} />
          ) : null}

          <CandidateResultsTable
            rows={rows}
            status={selected.election.status}
          />

          <div className="grid items-start gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <VotingActivityChart
                points={selected.hourlyActivity}
                status={selected.election.status}
              />
            </div>
            <TurnoutBreakdown stats={summary} ended={ended} />
          </div>

          <div className="grid items-start gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <ResultsControls
                election={selected.election}
                paused={selected.paused}
                finalized={finalized}
                published={published}
                liveResultsVisible={selected.settings.showLiveResults}
                onFinalize={() => setFinalizeOpen(true)}
                onPublish={() => setPublishOpen(true)}
              />
              <ResultVerification
                election={selected.election}
                finalized={finalized}
              />
            </div>
            <ResultActivity items={activity} />
          </div>

          <FinalizeResultsModal
            open={finalizeOpen}
            onClose={() => setFinalizeOpen(false)}
            onConfirm={handleFinalize}
          />
          <PublishResultsModal
            open={publishOpen}
            onClose={() => setPublishOpen(false)}
            onConfirm={handlePublish}
          />
        </>
      ) : (
        <div className="card px-6 py-14 text-center">
          <h2 className="text-lg font-semibold text-navy">Election not found</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-navy-muted">
            This election is not in the current BlockVote catalog or session.
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
