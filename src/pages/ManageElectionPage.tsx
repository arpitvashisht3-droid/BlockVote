import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, Check, X } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { BlockchainStatus } from '../components/admin/manage-election/BlockchainStatus'
import { CandidateManagement } from '../components/admin/manage-election/CandidateManagement'
import { EditElectionModal } from '../components/admin/manage-election/EditElectionModal'
import { EditSettingsModal } from '../components/admin/manage-election/EditSettingsModal'
import { ElectionActivity } from '../components/admin/manage-election/ElectionActivity'
import { ElectionControlModal } from '../components/admin/manage-election/ElectionControlModal'
import { ElectionControls } from '../components/admin/manage-election/ElectionControls'
import { ElectionSettings } from '../components/admin/manage-election/ElectionSettings'
import { ElectionStats } from '../components/admin/manage-election/ElectionStats'
import { ElectionStatusBanner } from '../components/admin/manage-election/ElectionStatusBanner'
import { ManageElectionHeader } from '../components/admin/manage-election/ManageElectionHeader'
import { ResultsPreview } from '../components/admin/manage-election/ResultsPreview'
import { VotingActivity } from '../components/admin/manage-election/VotingActivity'
import { buttonClassName } from '../components/buttonStyles'
import {
  applyElectionStatus,
  hourlyForStatus,
  type ControlAction,
  type ElectionManagement,
  type ManageActivityItem,
} from '../data/manageElection'
import {
  mapApiCandidateToCandidate,
  mapApiElectionToElection,
  type Candidate,
} from '../data/elections'
import { defaultSettings, type VotingSettings } from '../data/votingSettings'
import {
  createApiCandidate,
  DEFAULT_ADMIN_TOKEN,
  fetchApiCandidates,
  fetchApiElectionById,
  updateApiElectionStatus,
} from '../services/api'

function prependActivity(
  items: ManageActivityItem[],
  title: string,
  type: ManageActivityItem['type'],
): ManageActivityItem[] {
  return [
    {
      id: `${type}-${Date.now()}`,
      title,
      time: 'Just now',
      type,
    },
    ...items,
  ]
}

function ManageElectionScreen({ electionId }: { electionId: string | undefined }) {
  const [state, setState] = useState<ElectionManagement | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<ControlAction | null>(null)
  // Lifecycle state: null = idle, string = which action is in-flight
  const [lifecycleLoading, setLifecycleLoading] = useState<ControlAction | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'partial' } | null>(null)
  const toastTimer = useRef<number | undefined>(undefined)

  useEffect(() => {
    let isMounted = true
    if (!electionId) {
      setLoading(false)
      setError('No election ID provided.')
      return
    }

    Promise.all([
      fetchApiElectionById(electionId, DEFAULT_ADMIN_TOKEN),
      fetchApiCandidates(electionId, DEFAULT_ADMIN_TOKEN),
    ])
      .then(([apiElection, apiCandidates]) => {
        if (isMounted) {
          if (!apiElection) {
            setError('Election not found in database catalog.')
            setLoading(false)
            return
          }

          const election = mapApiElectionToElection(apiElection)
          if (apiCandidates && apiCandidates.length > 0) {
            election.candidates = apiCandidates.map(mapApiCandidateToCandidate)
          }

          const managementState: ElectionManagement = {
            election,
            organization: election.organization || 'BlockVote Platform',
            // ← Use the real paused flag from the backend (not a hardcoded false)
            paused: apiElection.paused ?? false,
            archived: false,
            settings: defaultSettings,
            activityLog: [
              {
                id: `loaded-${Date.now()}`,
                title: 'Loaded from Supabase Database',
                time: 'Just now',
                type: 'updated',
              },
            ],
            hourlyActivity: hourlyForStatus(election.status),
          }

          setState(managementState)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to load election from backend API.')
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
      window.clearTimeout(toastTimer.current)
    }
  }, [electionId])

  function showToast(message: string, type: 'success' | 'error' | 'partial' = 'success') {
    setToast({ message, type })
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 5000)
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-xl py-12 text-center text-navy-muted">
        Loading election details from backend API...
      </div>
    )
  }

  if (error || !state) {
    return (
      <div className="mx-auto max-w-xl py-10 text-center">
        <h1 className="text-2xl font-bold text-navy">Election not found</h1>
        <p className="mt-2 text-sm text-navy-muted">
          {error || 'This election ID is not in the BlockVote database catalog.'}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/admin" className={buttonClassName({ className: 'w-full sm:w-auto' })}>
            Back to Admin Dashboard
          </Link>
          <Link
            to="/elections"
            className={buttonClassName({
              variant: 'secondary',
              className: 'w-full sm:w-auto',
            })}
          >
            View Elections
          </Link>
        </div>
      </div>
    )
  }

  async function handleCandidates(newCandidates: Candidate[]) {
    if (!state) return

    const existingIds = new Set(state.election.candidates.map((c) => c.id))
    const addedCandidate = newCandidates.find((c) => !existingIds.has(c.id))

    if (addedCandidate) {
      try {
        const created = await createApiCandidate(
          state.election.id,
          {
            name: addedCandidate.name,
            department: addedCandidate.department,
            position: addedCandidate.position,
            about: addedCandidate.about,
            achievements: addedCandidate.achievements,
          },
          DEFAULT_ADMIN_TOKEN,
        )

        const mapped = mapApiCandidateToCandidate(created)
        setState((current) =>
          current
            ? {
                ...current,
                election: {
                  ...current.election,
                  candidates: [
                    ...current.election.candidates.filter((c) => c.id !== addedCandidate.id),
                    mapped,
                  ],
                },
                activityLog: prependActivity(
                  current.activityLog,
                  `Candidate ${mapped.name} added to database`,
                  'updated',
                ),
              }
            : current,
        )
        showToast(`Candidate ${mapped.name} added to Supabase.`)
      } catch (err) {
        showToast(`Failed to add candidate to backend: ${(err as Error).message}`)
      }
    } else {
      setState((current) =>
        current
          ? {
              ...current,
              election: { ...current.election, candidates: newCandidates },
            }
          : current,
      )
    }
  }

  async function handleControl(action: ControlAction) {
    if (!state || lifecycleLoading) return
    setPendingAction(null)

    if (action === 'pause' || action === 'resume' || action === 'end') {
      const targetStatus = action === 'pause' ? 'paused' : action === 'resume' ? 'live' : 'ended'
      setLifecycleLoading(action)

      try {
        const res = await updateApiElectionStatus(state.election.id, targetStatus, DEFAULT_ADMIN_TOKEN)

        if (res.httpStatus === 207) {
          // HTTP 207 Partial Failure
          const shortTx = res.transactionHash
            ? `${res.transactionHash.slice(0, 6)}...${res.transactionHash.slice(-4)}`
            : null
          showToast(
            `Blockchain transaction succeeded${shortTx ? ` (tx: ${shortTx})` : ''}, but database update failed. Please refresh or reconcile data.`,
            'partial',
          )
        } else if (res.success) {
          // HTTP 200 Success
          const shortTx = res.transactionHash
            ? `${res.transactionHash.slice(0, 6)}...${res.transactionHash.slice(-4)}`
            : null
          const actionLabel = action === 'pause' ? 'paused' : action === 'resume' ? 'resumed' : 'ended'
          showToast(
            `Election successfully ${actionLabel}!${shortTx ? ` (tx: ${shortTx})` : ''}`,
            'success',
          )
        }

        // Re-fetch election from backend to ensure UI syncs with single source of truth
        const [freshApiElection, freshApiCandidates] = await Promise.all([
          fetchApiElectionById(state.election.id, DEFAULT_ADMIN_TOKEN),
          fetchApiCandidates(state.election.id, DEFAULT_ADMIN_TOKEN),
        ])

        if (freshApiElection) {
          const freshElection = mapApiElectionToElection(freshApiElection)
          if (freshApiCandidates && freshApiCandidates.length > 0) {
            freshElection.candidates = freshApiCandidates.map(mapApiCandidateToCandidate)
          }

          setState((current) =>
            current
              ? {
                  ...current,
                  election: freshElection,
                  paused: freshApiElection.paused ?? false,
                  activityLog: prependActivity(
                    current.activityLog,
                    `Election ${action === 'pause' ? 'paused' : action === 'resume' ? 'resumed' : 'ended'} on-chain`,
                    action === 'pause' ? 'paused' : action === 'resume' ? 'opened' : 'ended',
                  ),
                }
              : null,
          )
        }
      } catch (err) {
        showToast(`Lifecycle action failed: ${(err as Error).message}`, 'error')
      } finally {
        setLifecycleLoading(null)
      }
    } else if (action === 'publish') {
      showToast('Election publish status updated.', 'success')
      setState((current) =>
        current
          ? {
              ...current,
              election: { ...current.election, published: true },
              activityLog: prependActivity(current.activityLog, 'Election published', 'updated'),
            }
          : current,
      )
    } else if (action === 'start') {
      showToast('Election status set to live.', 'success')
      setState((current) =>
        current
          ? {
              ...current,
              paused: false,
              hourlyActivity: hourlyForStatus('live'),
              election: applyElectionStatus(current.election, 'live'),
              activityLog: prependActivity(current.activityLog, 'Voting opened', 'opened'),
            }
          : current,
      )
    } else {
      showToast('Status control (archive) API is not yet implemented.', 'success')
      setState((current) =>
        current
          ? {
              ...current,
              archived: true,
              activityLog: prependActivity(current.activityLog, 'Election archived', 'ended'),
            }
          : current,
      )
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 overflow-x-hidden">
      <ManageElectionHeader
        election={state.election}
        organization={state.organization}
        paused={state.paused}
        archived={state.archived}
        onEdit={() => setEditOpen(true)}
        onCopyId={() => {
          void navigator.clipboard
            ?.writeText(state.election.electionCode)
            .then(() => showToast('Election ID copied.'))
            .catch(() => showToast('Could not copy the election ID.'))
        }}
        onDuplicate={() => {
          showToast('Duplication API is not implemented on backend.')
        }}
        onArchive={() => setPendingAction('archive')}
      />

      <ElectionStatusBanner election={state.election} paused={state.paused} />
      <ElectionStats election={state.election} />

      <div className="grid items-start gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <VotingActivity
            points={state.hourlyActivity}
            status={state.election.status}
          />
        </div>
        <ElectionControls
          election={state.election}
          paused={state.paused}
          archived={state.archived}
          loadingAction={lifecycleLoading}
          onAction={setPendingAction}
        />
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CandidateManagement
            election={state.election}
            onChange={handleCandidates}
          />
        </div>
        <ElectionSettings
          settings={state.settings}
          onEdit={() => setSettingsOpen(true)}
        />
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ResultsPreview
            election={state.election}
            settings={state.settings}
          />
        </div>
        <BlockchainStatus election={state.election} />
      </div>

      <ElectionActivity items={state.activityLog} />

      <EditElectionModal
        open={editOpen}
        election={state.election}
        organization={state.organization}
        visibility={state.settings.visibility}
        onClose={() => setEditOpen(false)}
        onSave={(next) => {
          setState((current) =>
            current
              ? {
                  ...current,
                  organization: next.organization,
                  settings: { ...current.settings, visibility: next.visibility },
                  election: {
                    ...current.election,
                    title: next.title,
                    description: next.description,
                    detailsDescription: next.description,
                    startDate: next.startDate,
                    endDate: next.endDate,
                    organization: next.organization,
                  },
                  activityLog: prependActivity(
                    current.activityLog,
                    'Election details updated locally',
                    'updated',
                  ),
                }
              : current,
          )
          setEditOpen(false)
          showToast('Election updated locally.')
        }}
      />

      <EditSettingsModal
        open={settingsOpen}
        settings={state.settings}
        onClose={() => setSettingsOpen(false)}
        onSave={(settings: VotingSettings) => {
          setState((current) =>
            current
              ? {
                  ...current,
                  settings,
                  activityLog: prependActivity(
                    current.activityLog,
                    'Election settings updated locally',
                    'updated',
                  ),
                }
              : current,
          )
          setSettingsOpen(false)
          showToast('Settings updated locally.')
        }}
      />

      <ElectionControlModal
        action={pendingAction}
        onClose={() => setPendingAction(null)}
        onConfirm={() => pendingAction && handleControl(pendingAction)}
      />

      {toast ? (
        <div
          role="status"
          className={`fixed right-4 bottom-4 z-40 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium shadow-lg max-w-md ${
            toast.type === 'error'
              ? 'border-red-200 bg-red-50 text-red-800'
              : toast.type === 'partial'
                ? 'border-amber-200 bg-amber-50 text-amber-900'
                : 'border-border bg-white text-navy'
          }`}
        >
          {toast.type === 'error' || toast.type === 'partial' ? (
            <AlertTriangle
              className={`size-4 shrink-0 ${toast.type === 'error' ? 'text-red-600' : 'text-amber-600'}`}
              aria-hidden="true"
            />
          ) : (
            <Check className="size-4 shrink-0 text-accent" aria-hidden="true" />
          )}
          <span className="flex-1">{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-1 rounded-md p-1 hover:bg-black/5"
            aria-label="Dismiss toast"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ) : null}
    </div>
  )
}

export function ManageElectionPage() {
  const { id } = useParams()
  return <ManageElectionScreen key={id ?? 'unknown'} electionId={id} />
}
