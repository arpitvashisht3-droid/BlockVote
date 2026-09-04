import { formatNumber, formatPercent } from '../../../data/elections'
import type { ResultsSummaryStats } from '../../../data/adminResults'

type TurnoutBreakdownProps = {
  stats: ResultsSummaryStats
  ended: boolean
}

export function TurnoutBreakdown({ stats, ended }: TurnoutBreakdownProps) {
  const percent = Math.min(Math.max(stats.turnoutPercent, 0), 100)
  const radius = 42
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - percent / 100)

  return (
    <section className="card p-5 sm:p-6">
      <h2 className="text-lg font-bold text-navy">Turnout Breakdown</h2>
      <p className="mt-1 text-sm text-navy-muted">
        {ended
          ? 'Final participation for this election.'
          : 'Current participation against the registered voter roll.'}
      </p>

      <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row">
        <div className="relative size-36 shrink-0">
          <svg viewBox="0 0 100 100" className="size-full -rotate-90">
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              className="stroke-slate-100"
              strokeWidth="10"
            />
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              className="stroke-accent"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <p className="text-xl font-bold text-navy">
              {formatPercent(stats.turnoutPercent)}
            </p>
          </div>
        </div>

        <dl className="grid w-full grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-surface px-3 py-3">
            <dt className="text-navy-muted">Registered</dt>
            <dd className="mt-1 font-semibold text-navy">
              {formatNumber(stats.registeredVoters)}
            </dd>
          </div>
          <div className="rounded-xl bg-surface px-3 py-3">
            <dt className="text-navy-muted">Voted</dt>
            <dd className="mt-1 font-semibold text-navy">
              {formatNumber(stats.votesCast)}
            </dd>
          </div>
          <div className="rounded-xl bg-surface px-3 py-3">
            <dt className="text-navy-muted">Remaining</dt>
            <dd className="mt-1 font-semibold text-navy">
              {formatNumber(stats.remaining)}
            </dd>
          </div>
          <div className="rounded-xl bg-surface px-3 py-3">
            <dt className="text-navy-muted">Turnout</dt>
            <dd className="mt-1 font-semibold text-navy">
              {formatPercent(stats.turnoutPercent)}
            </dd>
          </div>
        </dl>
      </div>

      <p className="mt-4 text-sm text-navy-muted">
        {formatNumber(stats.remaining)} voters have not voted yet.
      </p>
    </section>
  )
}
