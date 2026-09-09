import { Link } from 'react-router-dom'
import type { Election } from '../../../data/elections'
import { getResultsPath } from '../../../data/verification'
import { Button } from '../../Button'
import { buttonClassName } from '../../buttonStyles'

type ResultsControlsProps = {
  election: Election
  paused: boolean
  finalized: boolean
  published: boolean
  liveResultsVisible: boolean
  onFinalize: () => void
  onPublish: () => void
}

export function ResultsControls({
  election,
  paused,
  finalized,
  published,
  liveResultsVisible,
  onFinalize,
  onPublish,
}: ResultsControlsProps) {
  const upcoming = election.status === 'upcoming'
  const ended = election.status === 'ended'
  const resultsPath = getResultsPath(election)

  return (
    <section className="card p-5 sm:p-6">
      <h2 className="text-lg font-bold text-navy">Results Controls</h2>
      <p className="mt-1 text-sm text-navy-muted">
        Admin-only actions for this election’s result state.
      </p>

      {upcoming ? (
        <p className="mt-5 rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium text-navy-muted">
          Results unavailable
        </p>
      ) : ended ? (
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Button
            className="w-full sm:w-auto"
            disabled={finalized}
            onClick={onFinalize}
          >
            {finalized ? 'Results Finalized' : 'Finalize Results'}
          </Button>
          <Button
            variant="secondary"
            className="w-full sm:w-auto"
            disabled={!finalized || published}
            onClick={onPublish}
          >
            {published ? 'Results Published' : 'Publish Results'}
          </Button>
          <Link
            to={resultsPath}
            className={buttonClassName({
              variant: 'ghost',
              className: 'w-full sm:w-auto',
            })}
          >
            View Public Results
          </Link>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          <Link
            to={resultsPath}
            className={buttonClassName({ className: 'w-full sm:w-auto' })}
          >
            View Live Results
          </Link>
          {!liveResultsVisible ? (
            <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
              {paused
                ? 'Voting is paused. Keep results hidden from voters until counting resumes.'
                : 'Keep results hidden from voters'}
            </p>
          ) : (
            <p className="text-sm text-navy-muted">
              Live results are currently visible to voters.
            </p>
          )}
        </div>
      )}
    </section>
  )
}
