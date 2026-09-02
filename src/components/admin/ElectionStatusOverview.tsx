import { electionStatusCounts } from '../../data/admin'

const items = [
  { label: 'Live', value: electionStatusCounts.live, tone: 'bg-accent-soft text-accent' },
  {
    label: 'Upcoming',
    value: electionStatusCounts.upcoming,
    tone: 'bg-upcoming-soft text-upcoming',
  },
  {
    label: 'Completed',
    value: electionStatusCounts.completed,
    tone: 'bg-slate-100 text-navy-muted',
  },
] as const

export function ElectionStatusOverview() {
  return (
    <section className="card p-5 sm:p-6">
      <h2 className="text-lg font-bold text-navy">Election Status Overview</h2>
      <ul className="mt-4 grid grid-cols-3 gap-3">
        {items.map((item) => (
          <li key={item.label} className="rounded-xl border border-border px-3 py-4 text-center">
            <p className="text-2xl font-bold text-navy">{item.value}</p>
            <p
              className={`mt-2 inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase ${item.tone}`}
            >
              {item.label}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}
