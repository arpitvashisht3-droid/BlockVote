import { useEffect, useRef, useState } from 'react'
import { Check } from 'lucide-react'
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
  duplicateElection,
  getElectionManagement,
  hourlyForStatus,
  saveElectionManagement,
  type ControlAction,
  type ElectionManagement,
  type ManageActivityItem,
} from '../data/manageElection'
import type { Candidate } from '../data/elections'
import type { VotingSettings } from '../data/votingSettings'

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
  const [state, setState] = useState(() => getElectionManagement(electionId))
  const [editOpen, setEditOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<ControlAction | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<number | undefined>(undefined)

  useEffect(() => {
    return () => window.clearTimeout(toastTimer.current)
  }, [])

  function showToast(message: string) {
    setToast(message)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 3500)
  }

  function persist(mutator: (current: ElectionManagement) => ElectionManagement) {
    setState((current) => {
      if (!current) {
        return current
      }
      const next = mutator(current)
      saveElectionManagement(next)
      return next
    })
  }

  if (!state) {
    return (
      <div className="mx-auto max-w-xl py-10 text-center">
        <h1 className="text-2xl font-bold text-navy">Election not found</h1>
        <p className="mt-2 text-sm text-navy-muted">
          This election ID is not in the BlockVote catalog or the current
          session.
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

  function handleCandidates(candidates: Candidate[]) {
    persist((current) => ({
      ...current,
      election: { ...current.election, candidates },
    }))
  }

  function handleControl(action: ControlAction) {
    persist((current) => {
      if (action === 'pause') {
        showToast('Voting paused.')
        return {
          ...current,
          paused: true,
          activityLog: prependActivity(current.activityLog, 'Voting paused', 'paused'),
        }
      }

      if (action === 'resume') {
        showToast('Voting resumed.')
        return {
          ...current,
          paused: false,
          activityLog: prependActivity(current.activityLog, 'Voting resumed', 'opened'),
        }
      }

      if (action === 'end') {
        showToast('Election ended.')
        return {
          ...current,
          paused: false,
          election: applyElectionStatus(current.election, 'ended'),
          activityLog: prependActivity(current.activityLog, 'Election ended', 'ended'),
        }
      }

      if (action === 'publish') {
        showToast(
          current.election.published
            ? 'Election is already published.'
            : 'Election published.',
        )
        return {
          ...current,
          election: { ...current.election, published: true },
          activityLog: prependActivity(
            current.activityLog,
            'Election published',
            'updated',
          ),
        }
      }

      if (action === 'start') {
        showToast('Election started.')
        return {
          ...current,
          paused: false,
          hourlyActivity: hourlyForStatus('live'),
          election: applyElectionStatus(current.election, 'live'),
          activityLog: prependActivity(current.activityLog, 'Voting opened', 'opened'),
        }
      }

      showToast('Election archived.')
      return {
        ...current,
        archived: true,
        activityLog: prependActivity(current.activityLog, 'Election archived', 'ended'),
      }
    })
    setPendingAction(null)
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
          duplicateElection(state)
          showToast('Election duplicated in this session.')
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
          persist((current) => ({
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
              'Election details updated',
              'updated',
            ),
          }))
          setEditOpen(false)
          showToast('Election updated successfully.')
        }}
      />

      <EditSettingsModal
        open={settingsOpen}
        settings={state.settings}
        onClose={() => setSettingsOpen(false)}
        onSave={(settings: VotingSettings) => {
          persist((current) => ({
            ...current,
            settings,
            activityLog: prependActivity(
              current.activityLog,
              'Election settings updated',
              'updated',
            ),
          }))
          setSettingsOpen(false)
          showToast('Settings updated.')
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
          className="fixed right-4 bottom-4 z-40 flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-3 text-sm font-medium text-navy shadow-lg"
        >
          <Check className="size-4 text-accent" aria-hidden="true" />
          {toast}
        </div>
      ) : null}
    </div>
  )
}

export function ManageElectionPage() {
  const { id } = useParams()
  return <ManageElectionScreen key={id ?? 'unknown'} electionId={id} />
}
