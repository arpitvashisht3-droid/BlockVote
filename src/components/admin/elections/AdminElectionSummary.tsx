type AdminElectionSummaryProps = {
  total: number
  live: number
  upcoming: number
  completed: number
}

const cards = [
  { key: 'total', label: 'Total Elections', tone: 'text-navy' },
  { key: 'live', label: 'Live', tone: 'text-accent' },
  { key: 'upcoming', label: 'Upcoming', tone: 'text-upcoming' },
  { key: 'completed', label: 'Completed', tone: 'text-navy-muted' },
] as const

export function AdminElectionSummary({
  total,
  live,
  upcoming,
  completed,
}: AdminElectionSummaryProps) {
  const values = { total, live, upcoming, completed }

  return (
    <section
      aria-label="Election summary"
      className="grid grid-cols-2 gap-3 lg:grid-cols-4"
    >
      {cards.map((card) => (
        <article key={card.key} className="card p-4 sm:p-5">
          <p className="text-sm font-medium text-navy-muted">{card.label}</p>
          <p className={`mt-2 text-3xl font-bold tracking-tight ${card.tone}`}>
            {values[card.key]}
          </p>
        </article>
      ))}
    </section>
  )
}
