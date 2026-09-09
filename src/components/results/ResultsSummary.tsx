import { formatNumber, formatPercent } from '../../data/elections'

type ResultsSummaryProps = {
  totalVotes: number
  registeredVoters: number
  turnoutPercent: number
  candidateCount: number
}

export function ResultsSummary({
  totalVotes,
  registeredVoters,
  turnoutPercent,
  candidateCount,
}: ResultsSummaryProps) {
  const stats = [
    { label: 'Total Votes', value: formatNumber(totalVotes) },
    { label: 'Registered Voters', value: formatNumber(registeredVoters) },
    { label: 'Turnout', value: formatPercent(turnoutPercent) },
    { label: 'Candidates', value: String(candidateCount) },
  ]

  return (
    <section
      aria-label="Results summary"
      className="grid grid-cols-2 gap-3 lg:grid-cols-4"
    >
      {stats.map((stat) => (
        <article key={stat.label} className="card px-5 py-5">
          <p className="text-2xl font-bold tracking-tight text-navy sm:text-3xl">
            {stat.value}
          </p>
          <p className="mt-1 text-sm text-navy-muted">{stat.label}</p>
        </article>
      ))}
    </section>
  )
}
