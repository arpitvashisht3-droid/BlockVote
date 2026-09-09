type CandidateSummaryProps = {
  total: number
  active: number
  positions: number
  electionTitle: string
}

const cards = [
  { key: 'total', label: 'Total Candidates' },
  { key: 'active', label: 'Active Candidates' },
  { key: 'positions', label: 'Positions' },
  { key: 'election', label: 'Election' },
] as const

export function CandidateSummary({
  total,
  active,
  positions,
  electionTitle,
}: CandidateSummaryProps) {
  const values = {
    total: String(total),
    active: String(active),
    positions: String(positions),
    election: electionTitle,
  }

  return (
    <section
      aria-label="Candidate summary"
      className="grid grid-cols-2 gap-3 lg:grid-cols-4"
    >
      {cards.map((card) => (
        <article key={card.key} className="card min-w-0 p-4 sm:p-5">
          <p className="text-sm font-medium text-navy-muted">{card.label}</p>
          <p
            className={`mt-2 font-bold tracking-tight text-navy ${
              card.key === 'election'
                ? 'text-base leading-snug sm:text-lg'
                : 'text-3xl'
            }`}
          >
            {values[card.key]}
          </p>
        </article>
      ))}
    </section>
  )
}
