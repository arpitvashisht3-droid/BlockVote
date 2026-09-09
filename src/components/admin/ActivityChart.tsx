import { BarChart3 } from 'lucide-react'
import type { ActivityPoint } from '../../data/admin'
import { formatNumber } from '../../data/elections'

interface ActivityChartProps {
  activity?: ActivityPoint[]
}

export function ActivityChart({ activity = [] }: ActivityChartProps) {
  const width = 640
  const height = 220
  const pad = { top: 18, right: 12, bottom: 36, left: 44 }
  const totalVotes = activity.reduce((sum, point) => sum + point.votes, 0)
  const maxVotes = Math.max(...activity.map((point) => point.votes), 0)

  if (activity.length === 0 || maxVotes === 0) {
    return (
      <section className="card p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-navy">Election Activity</h2>
            <p className="mt-1 text-sm text-navy-muted">Votes recorded over time</p>
          </div>
        </div>
        <div className="flex h-44 flex-col items-center justify-center text-center">
          <BarChart3 className="size-8 text-slate-300" aria-hidden="true" />
          <p className="mt-2 text-sm font-medium text-navy">No activity recorded yet</p>
          <p className="mt-1 text-xs text-navy-muted">
            Voting trends will appear here as transactions are confirmed on-chain.
          </p>
        </div>
      </section>
    )
  }

  const plotWidth = width - pad.left - pad.right
  const plotHeight = height - pad.top - pad.bottom

  const points = activity.map((point, index) => {
    const x =
      pad.left +
      (activity.length === 1
        ? plotWidth / 2
        : (index / (activity.length - 1)) * plotWidth)
    const y = pad.top + (1 - point.votes / maxVotes) * plotHeight
    return { ...point, x, y }
  })

  const linePath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ')
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${pad.top + plotHeight} L ${points[0].x} ${pad.top + plotHeight} Z`

  return (
    <section className="card p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-navy">Election Activity</h2>
          <p className="mt-1 text-sm text-navy-muted">Votes recorded over the last 7 days</p>
        </div>
        <p className="text-sm font-semibold text-accent">
          {formatNumber(totalVotes)} votes
        </p>
      </div>

      <div className="mt-4">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-52 w-full text-navy sm:h-56"
          role="img"
          aria-label="Chart of votes recorded each day"
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
          <path d={areaPath} className="fill-accent/15" />
          <path
            d={linePath}
            className="stroke-accent"
            fill="none"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {points.map((point) => (
            <g key={point.day}>
              <circle cx={point.x} cy={point.y} r="4" className="fill-accent" />
              <text
                x={point.x}
                y={height - 12}
                textAnchor="middle"
                className="fill-navy-muted text-[11px] font-medium"
              >
                {point.day}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </section>
  )
}
