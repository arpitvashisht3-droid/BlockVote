import { Link } from 'react-router-dom'
import type { Election } from '../../../data/elections'
import { Button } from '../../Button'
import { buttonClassName } from '../../buttonStyles'
import type { ControlAction } from '../../../data/manageElection'

type ElectionControlsProps = {
  election: Election
  paused: boolean
  archived: boolean
  loadingAction?: ControlAction | null
  onAction: (action: ControlAction) => void
}

export function ElectionControls({
  election,
  paused,
  archived,
  loadingAction = null,
  onAction,
}: ElectionControlsProps) {
  const isLoading = loadingAction !== null
  return (
    <section className="card p-5 sm:p-6">
      <h2 className="text-lg font-bold text-navy">Election Controls</h2>
      <p className="mt-1 text-sm text-navy-muted">
        Confirm every control before it changes the election state.
      </p>

      {archived ? (
        <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-navy-muted">
          This election is archived for this admin session.
        </p>
      ) : null}

      <div className="mt-5 flex flex-col gap-3">
        {election.status === 'live' && !paused ? (
          <>
            <Button
              variant="secondary"
              className="w-full"
              disabled={archived || isLoading}
              onClick={() => onAction('pause')}
            >
              {loadingAction === 'pause' ? 'Pausing Voting...' : 'Pause Voting'}
            </Button>
            <Button
              variant="danger"
              className="w-full"
              disabled={archived || isLoading}
              onClick={() => onAction('end')}
            >
              {loadingAction === 'end' ? 'Ending Election...' : 'End Election'}
            </Button>
          </>
        ) : null}

        {election.status === 'live' && paused ? (
          <>
            <Button
              className="w-full"
              disabled={archived || isLoading}
              onClick={() => onAction('resume')}
            >
              {loadingAction === 'resume' ? 'Resuming Voting...' : 'Resume Voting'}
            </Button>
            <Button
              variant="danger"
              className="w-full"
              disabled={archived || isLoading}
              onClick={() => onAction('end')}
            >
              {loadingAction === 'end' ? 'Ending Election...' : 'End Election'}
            </Button>
          </>
        ) : null}

        {election.status === 'upcoming' ? (
          <>
            <Button
              className="w-full"
              disabled={archived || isLoading}
              onClick={() => onAction('publish')}
            >
              {loadingAction === 'publish' ? 'Publishing...' : 'Publish Election'}
            </Button>
            <Button
              variant="secondary"
              className="w-full"
              disabled={archived || isLoading}
              onClick={() => onAction('start')}
            >
              {loadingAction === 'start' ? 'Starting...' : 'Start Election'}
            </Button>
          </>
        ) : null}

        {election.status === 'ended' ? (
          <>
            <Link
              to={`/elections/${election.id}/results`}
              className={buttonClassName({ className: 'w-full' })}
            >
              View Final Results
            </Link>
            <Button
              variant="danger"
              className="w-full"
              disabled={archived || isLoading}
              onClick={() => onAction('archive')}
            >
              {loadingAction === 'archive' ? 'Archiving...' : 'Archive Election'}
            </Button>
          </>
        ) : null}
      </div>
    </section>
  )
}
