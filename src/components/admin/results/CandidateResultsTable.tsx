import {
  formatNumber,
  formatPercent,
  type ElectionStatus,
} from '../../../data/elections'
import type { CandidateResultRow } from '../../../data/adminResults'
import { CandidateAvatar } from '../../elections/CandidateAvatar'

type CandidateResultsTableProps = {
  rows: CandidateResultRow[]
  status: ElectionStatus
}

function ResultStatusBadge({
  value,
}: {
  value: CandidateResultRow['status']
}) {
  const leading = value === 'Leading' || value === 'Winner'
  const muted = value === 'No votes yet' || value === 'Final' || value === 'Paused'

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase ${
        leading
          ? 'bg-accent-soft text-accent'
          : muted
            ? 'bg-slate-100 text-navy-muted'
            : 'bg-upcoming-soft text-upcoming'
      }`}
    >
      {value}
    </span>
  )
}

export function CandidateResultsTable({
  rows,
  status,
}: CandidateResultsTableProps) {
  const tallyLabel =
    status === 'ended' ? 'Final' : status === 'live' ? 'Live' : 'Upcoming'

  if (rows.length === 0) {
    return (
      <section className="card px-6 py-12 text-center">
        <h2 className="text-lg font-semibold text-navy">Candidate Results</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-navy-muted">
          No candidate results available.
        </p>
      </section>
    )
  }

  return (
    <section>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-navy">Candidate Results</h2>
        <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent">
          {tallyLabel}
        </span>
      </div>

      <div className="card hidden overflow-hidden lg:block">
        <table className="w-full min-w-0 text-sm">
          <caption className="sr-only">Candidate results</caption>
          <thead className="bg-slate-50 text-left text-xs font-semibold tracking-wide text-navy-muted uppercase">
            <tr>
              <th scope="col" className="px-4 py-3">
                Candidate
              </th>
              <th scope="col" className="px-4 py-3">
                Position
              </th>
              <th scope="col" className="px-4 py-3">
                Department
              </th>
              <th scope="col" className="px-4 py-3">
                Votes
              </th>
              <th scope="col" className="px-4 py-3">
                Percentage
              </th>
              <th scope="col" className="px-4 py-3">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.candidate.id}
                className={`border-t border-border ${
                  row.isLeader ? 'bg-accent-soft/40' : ''
                }`}
              >
                <th scope="row" className="px-4 py-4 text-left font-normal">
                  <div className="flex min-w-0 items-center gap-3">
                    <CandidateAvatar name={row.candidate.name} size="sm" />
                    <div className="min-w-0">
                      <p className="font-semibold text-navy">
                        {row.candidate.name}
                      </p>
                      <div
                        className="mt-2 h-2 w-40 max-w-full overflow-hidden rounded-full bg-slate-100"
                        role="progressbar"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={row.percentage}
                        aria-label={`${row.candidate.name} ${formatPercent(row.percentage)}`}
                      >
                        <div
                          className={`h-full rounded-full ${
                            row.isLeader ? 'bg-accent' : 'bg-accent/35'
                          }`}
                          style={{ width: `${Math.min(row.percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </th>
                <td className="px-4 py-4 text-navy-muted">{row.position}</td>
                <td className="px-4 py-4 text-navy-muted">
                  {row.candidate.department}
                </td>
                <td className="px-4 py-4 font-medium text-navy">
                  {formatNumber(row.votes)}
                </td>
                <td className="px-4 py-4 font-medium text-navy">
                  {formatPercent(row.percentage)}
                </td>
                <td className="px-4 py-4">
                  <ResultStatusBadge value={row.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="grid gap-3 md:grid-cols-2 lg:hidden">
        {rows.map((row) => (
          <li key={row.candidate.id}>
            <article
              className={`card flex h-full flex-col gap-3 p-4 ${
                row.isLeader ? 'border-accent' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <CandidateAvatar name={row.candidate.name} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-navy">
                        {row.candidate.name}
                      </h3>
                      <p className="text-sm text-navy-muted">
                        {row.position} · {row.candidate.department}
                      </p>
                    </div>
                    <ResultStatusBadge value={row.status} />
                  </div>
                  <p className="mt-2 text-sm font-semibold text-navy">
                    {formatNumber(row.votes)} votes ·{' '}
                    {formatPercent(row.percentage)}
                  </p>
                  <div
                    className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={row.percentage}
                    aria-label={`${row.candidate.name} ${formatPercent(row.percentage)}`}
                  >
                    <div
                      className={`h-full rounded-full ${
                        row.isLeader ? 'bg-accent' : 'bg-accent/35'
                      }`}
                      style={{ width: `${Math.min(row.percentage, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  )
}
