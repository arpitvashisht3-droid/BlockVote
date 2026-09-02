import { Link } from 'react-router-dom'
import type { Election } from '../../../data/elections'
import { Button } from '../../Button'
import { buttonClassName } from '../../buttonStyles'
import type { ControlAction } from '../../../data/manageElection'

type ElectionControlsProps = {
  election: Election
  paused: boolean
  archived: boolean
  onAction: (action: ControlAction) => void
}

export function ElectionControls({
  election,
  paused,
  archived,
  onAction,
}: ElectionControlsProps) {
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
              disabled={archived}
              onClick={() => onAction('pause')}
            >
              Pause Voting
            </Button>
            <Button
              variant="danger"
              className="w-full"
              disabled={archived}
              onClick={() => onAction('end')}
            >
              End Election
            </Button>
          </>
        ) : null}

        {election.status === 'live' && paused ? (
          <>
            <Button
              className="w-full"
              disabled={archived}
              onClick={() => onAction('resume')}
            >
              Resume Voting
            </Button>
            <Button
              variant="danger"
              className="w-full"
              disabled={archived}
              onClick={() => onAction('end')}
            >
              End Election
            </Button>
          </>
        ) : null}

        {election.status === 'upcoming' ? (
          <>
            <Button
              className="w-full"
              disabled={archived}
              onClick={() => onAction('publish')}
            >
              Publish Election
            </Button>
            <Button
              variant="secondary"
              className="w-full"
              disabled={archived}
              onClick={() => onAction('start')}
            >
              Start Election
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
              disabled={archived}
              onClick={() => onAction('archive')}
            >
              Archive Election
            </Button>
          </>
        ) : null}
      </div>
    </section>
  )
}
