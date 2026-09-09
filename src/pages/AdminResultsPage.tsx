import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useDemoAuth } from '../context/DemoAuthContext'
import { AlertTriangle, Check, Download, RefreshCw, Trash2, Users } from 'lucide-react'
import { CandidateResultsTable } from '../components/admin/results/CandidateResultsTable'
import { DiscardVoteModal } from '../components/admin/results/DiscardVoteModal'
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
import { ElectionCountdown } from '../components/elections/ElectionCountdown'
import { fetchBackendElections } from '../data/elections'
import { getApiBaseUrl } from '../data/apiConfig'
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

function ParticipationsSection({ electionId }: { electionId: string }) {
  const [participations, setParticipations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchParticipations = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('blockvote_auth_token')
      const res = await fetch(`${getApiBaseUrl()}/elections/${electionId}/participations`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      const data = await res.json()
      if (data.success && Array.isArray(data.data)) {
        setParticipations(data.data)
      }
    } catch {
      setParticipations([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchParticipations()
  }, [electionId])

  return (
    <section className="card p-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h2 className="text-base font-bold text-navy flex items-center gap-2">
            <Users className="size-4 text-accent" /> Voters Who Participated ({participations.length})
          </h2>
          <p className="text-xs text-navy-muted mt-0.5">
            Audit-compliant log of verified voter participation. Preserves ballot choice privacy.
          </p>
        </div>
        <Button variant="ghost" className="px-2 py-1 text-xs" onClick={fetchParticipations}>
          <RefreshCw className="size-3.5" />
        </Button>
      </div>

      {loading ? (
        <p className="py-6 text-center text-xs text-navy-muted">Loading participation records...</p>
      ) : participations.length > 0 ? (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-slate-50 text-navy-muted font-semibold">
                <th className="py-2.5 px-3">Voter Name</th>
                <th className="py-2.5 px-3">Voter ID / Email</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {participations.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-medium text-navy">{p.voterName || 'Verified Voter'}</td>
                  <td className="py-2.5 px-3 font-mono text-navy-muted">{p.voterEmail || p.voterId}</td>
                  <td className="py-2.5 px-3 text-navy-muted">
                    {new Date(p.timestamp).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 border border-emerald-200">
                      Participated
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="py-8 text-center text-xs text-navy-muted">
          No participation records logged yet for this election.
        </p>
      )}
    </section>
  )
}

function DiscardedVotesSection({ electionId }: { electionId: string }) {
  const [discarded, setDiscarded] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  const fetchDiscarded = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('blockvote_auth_token')
      const res = await fetch(`/api/elections/${electionId}/discarded-votes`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      const data = await res.json()
      if (data.success && Array.isArray(data.data)) {
        setDiscarded(data.data)
      }
    } catch {
      setDiscarded([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDiscarded()
  }, [electionId])

  return (
    <section className="card p-6 border-l-4 border-l-amber-500">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h2 className="text-base font-bold text-navy flex items-center gap-2">
            <AlertTriangle className="size-4 text-amber-600" /> Discarded Votes Audit Log ({discarded.length})
          </h2>
          <p className="text-xs text-navy-muted mt-0.5">
            Backend JSON DB log of invalid votes discarded by election conductors.
          </p>
        </div>
        <Button variant="danger" className="px-3 py-1 text-xs" onClick={() => setModalOpen(true)}>
          <Trash2 className="size-3.5" /> Discard Vote
        </Button>
      </div>

      {loading ? (
        <p className="py-6 text-center text-xs text-navy-muted">Loading discarded vote audit records...</p>
      ) : discarded.length > 0 ? (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-amber-50/50 text-navy-muted font-semibold">
                <th className="py-2.5 px-3">Discarded By</th>
                <th className="py-2.5 px-3">Audit Reason</th>
                <th className="py-2.5 px-3">Date & Time</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {discarded.map((d) => (
                <tr key={d.id} className="hover:bg-amber-50/30">
                  <td className="py-2.5 px-3 font-medium text-navy">{d.discardedByName || 'Conductor'}</td>
                  <td className="py-2.5 px-3 text-navy max-w-xs truncate">{d.reason}</td>
                  <td className="py-2.5 px-3 text-navy-muted">
                    {new Date(d.discardedAt).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="inline-flex items-center rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-700 border border-rose-200">
                      Discarded
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="py-8 text-center text-xs text-navy-muted">
          No discarded votes logged. All submitted votes are valid.
        </p>
      )}

      <DiscardVoteModal
        open={modalOpen}
        electionId={electionId}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchDiscarded}
      />
    </section>
  )
}

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
  const { id: paramId } = useParams<{ id?: string }>()
  const { user } = useDemoAuth()
  const [items, setItems] = useState(() => listAdminElections(user?.id))
  const [selectedId, setSelectedId] = useState<string>(paramId || DEFAULT_RESULTS_ELECTION_ID)
  const [finalizeOpen, setFinalizeOpen] = useState(false)
  const [publishOpen, setPublishOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<number | undefined>(undefined)

  useEffect(() => {
    fetchBackendElections(true).then(() => {
      setItems(listAdminElections(user?.id))
    })
  }, [user?.id])

  useEffect(() => {
    if (paramId) {
      setSelectedId(paramId)
    }
  }, [paramId])

  useEffect(() => {
    return () => window.clearTimeout(toastTimer.current)
  }, [])

  const selected =
    items.find((item) => item.election.id === selectedId) ??
    items.find((item) => item.election.electionCode === selectedId) ??
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
    setItems(listAdminElections(user?.id))
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
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <ResultsStatusCard
              status={selected.election.status}
              paused={selected.paused}
            />
            <ElectionCountdown
              startDate={selected.election.startDateRaw}
              endDate={selected.election.endDateRaw}
              status={selected.election.status}
            />
          </div>

          {!ended ? (
            <div role="status" className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-900 dark:text-amber-200 flex items-center gap-3">
              <AlertTriangle className="size-5 text-amber-600 shrink-0" />
              <div>
                <h4 className="font-bold text-sm">Results are not available yet</h4>
                <p className="text-xs opacity-90 mt-0.5">
                  Final election outcome and winner will be declared after voting closes on {selected.election.endDate}. Real-time participation and voter audit records can be audited below.
                </p>
              </div>
            </div>
          ) : null}

          <ResultsSummary stats={summary} />

          {!upcoming && leader ? (
            <LeadingCandidate row={leader} ended={ended} />
          ) : null}

          <CandidateResultsTable
            rows={rows}
            status={selected.election.status}
          />

          {/* Voters Who Participated (Backend DB Source of Truth) */}
          <ParticipationsSection electionId={selected.election.id} />

          {/* Discarded Votes Audit System */}
          <DiscardedVotesSection electionId={selected.election.id} />

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
