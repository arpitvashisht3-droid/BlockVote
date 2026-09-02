import { formatNumber, formatPercent } from '../../../data/elections'
import type { ResultsSummaryStats } from '../../../data/adminResults'

type ResultsSummaryProps = {
  stats: ResultsSummaryStats
}

export function ResultsSummary({ stats }: ResultsSummaryProps) {
  const cards = [
    {
      label: 'Registered Voters',
      value: formatNumber(stats.registeredVoters),
    },
    {
      label: 'Votes Cast',
      value: formatNumber(stats.votesCast),
    },
    {
      label: 'Turnout',
      value: formatPercent(stats.turnoutPercent),
    },
    {
      label: 'Candidates',
      value: formatNumber(stats.candidateCount),
    },
  ]

  return (
    <section
      aria-label="Results summary"
      className="grid grid-cols-2 gap-3 lg:grid-cols-4"
    >
      {cards.map((card) => (
        <article key={card.label} className="card min-w-0 p-4 sm:p-5">
          <p className="text-sm font-medium text-navy-muted">{card.label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-navy">
            {card.value}
          </p>
        </article>
      ))}
    </section>
  )
}
