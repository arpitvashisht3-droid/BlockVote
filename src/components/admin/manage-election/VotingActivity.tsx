import { formatNumber, type ElectionStatus } from '../../../data/elections'
import type { HourlyPoint } from '../../../data/manageElection'

type VotingActivityProps = {
  points: HourlyPoint[]
  status: ElectionStatus
  formatHour?: (hour: string) => string
}

export function VotingActivity({
  points,
  status,
  formatHour = (hour) => hour,
}: VotingActivityProps) {
  const width = 640
  const height = 220
  const pad = { top: 18, right: 12, bottom: 36, left: 44 }
  const maxVotes = Math.max(1, ...points.map((point) => point.votes))
  const plotWidth = width - pad.left - pad.right
  const plotHeight = height - pad.top - pad.bottom
  const total = points.reduce((sum, point) => sum + point.votes, 0)
  const peak = points.reduce((best, point) =>
    point.votes > best.votes ? point : best,
  )
  const average = points.length ? Math.round(total / points.length) : 0

  const coords = points.map((point, index) => {
    const x =
      pad.left +
      (points.length === 1
        ? plotWidth / 2
        : (index / (points.length - 1)) * plotWidth)
    const y = pad.top + (1 - point.votes / maxVotes) * plotHeight
    return { ...point, x, y }
  })

  const linePath = coords
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ')
  const last = coords[coords.length - 1]
  const first = coords[0]
  const areaPath =
    first && last
      ? `${linePath} L ${last.x} ${pad.top + plotHeight} L ${first.x} ${pad.top + plotHeight} Z`
      : ''

  return (
    <section className="card p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-navy">Voting Activity</h2>
          <p className="mt-1 text-sm text-navy-muted">
            {status === 'upcoming'
              ? 'No votes yet. Activity will appear after voting opens.'
              : 'Hourly voting volume for this election'}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-surface px-3 py-3">
          <p className="text-xs text-navy-muted">Votes Today</p>
          <p className="mt-1 text-lg font-bold text-navy">{formatNumber(total)}</p>
        </div>
        <div className="rounded-xl bg-surface px-3 py-3">
          <p className="text-xs text-navy-muted">Peak Voting Time</p>
          <p className="mt-1 text-lg font-bold text-navy">
            {total === 0 ? '—' : formatHour(peak.hour)}
          </p>
        </div>
        <div className="rounded-xl bg-surface px-3 py-3">
          <p className="text-xs text-navy-muted">Average Votes / Hour</p>
          <p className="mt-1 text-lg font-bold text-navy">{formatNumber(average)}</p>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="mt-4 h-52 w-full text-navy sm:h-56"
        role="img"
        aria-label="Hourly voting activity chart"
      >
        {[0.25, 0.5, 0.75, 1].map((tick) => {
          const y = pad.top + (1 - tick) * plotHeight
          return (
            <g key={tick}>
              <line
                x1={pad.left}
                x2={width - pad.right}
                y1={y}
                y2={y}
                className="stroke-border"
                strokeWidth="1"
              />
              <text
                x={pad.left - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-navy-muted text-[10px]"
              >
                {formatNumber(Math.round(maxVotes * tick))}
              </text>
            </g>
          )
        })}
        {areaPath ? <path d={areaPath} className="fill-accent/15" /> : null}
        <path
          d={linePath}
          className="stroke-accent"
          fill="none"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {coords.map((point) => (
          <g key={point.hour}>
            <circle cx={point.x} cy={point.y} r="4" className="fill-accent" />
            <text
              x={point.x}
              y={height - 12}
              textAnchor="middle"
              className="fill-navy-muted text-[11px] font-medium"
            >
              {formatHour(point.hour)}
            </text>
          </g>
        ))}
      </svg>
    </section>
  )
}
