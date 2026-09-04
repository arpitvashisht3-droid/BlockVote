import {
  formatNumber,
  formatPercent,
  getCandidateById,
  type Election,
} from '../../../data/elections'
import type { VotingSettings } from '../../../data/votingSettings'
import { CandidateAvatar } from '../../elections/CandidateAvatar'

type ResultsPreviewProps = {
  election: Election
  settings: VotingSettings
}

export function ResultsPreview({ election, settings }: ResultsPreviewProps) {
  const rows = election.results?.candidateResults ?? []
  const upcoming = election.status === 'upcoming'
  const live = election.status === 'live'

  return (
    <section className="card p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-navy">
          {live ? 'Live Results' : 'Current Results'}
        </h2>
        {live && !settings.showLiveResults ? (
          <p className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">
            Live results are hidden from voters.
          </p>
        ) : null}
      </div>

      {upcoming ? (
        <p className="mt-6 text-sm text-navy-muted">
          Results will appear once voting begins.
        </p>
      ) : rows.length === 0 ? (
        <p className="mt-6 text-sm text-navy-muted">
          No tally is available yet. An internal preview will appear as votes
          are recorded.
        </p>
      ) : (
        <ul className="mt-5 space-y-4">
          {rows.map((row, index) => {
            const candidate = getCandidateById(election, row.candidateId)
            if (!candidate) {
              return null
            }

            return (
              <li key={row.candidateId}>
                <div className="flex items-center gap-3">
                  <CandidateAvatar name={candidate.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-semibold text-navy">{candidate.name}</p>
                      <p className="text-sm font-semibold text-navy">
                        {formatPercent(row.percentage)}
                      </p>
                    </div>
                    <p className="text-xs text-navy-muted">
                      {formatNumber(row.votes)} votes
                    </p>
                    <div
                      className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={row.percentage}
                      aria-label={`${candidate.name} ${formatPercent(row.percentage)}`}
                    >
                      <div
                        className={`h-full rounded-full ${
                          index === 0 ? 'bg-accent' : 'bg-accent/35'
                        }`}
                        style={{ width: `${Math.min(row.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
