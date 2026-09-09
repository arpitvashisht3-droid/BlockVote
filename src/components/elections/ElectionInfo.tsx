import {
  BarChart3,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Hash,
  Users,
} from 'lucide-react'
import { formatNumber, formatElectionDateTime, type Election } from '../../data/elections'

type ElectionInfoProps = {
  election: Election
}

export function ElectionInfo({ election }: ElectionInfoProps) {
  const rows = [
    {
      icon: Hash,
      label: 'Election ID',
      value: election.electionCode,
    },
    {
      icon: CalendarClock,
      label: 'Start Date & Time',
      value: formatElectionDateTime(election.startDate),
    },
    {
      icon: Clock3,
      label: 'End Date & Time',
      value: formatElectionDateTime(election.endDate),
    },
    {
      icon: Users,
      label: 'Total Candidates',
      value: String(election.candidates.length),
    },
    {
      icon: BarChart3,
      label: 'Total Votes',
      value:
        election.voteCount != null ? formatNumber(election.voteCount) : '—',
    },
    {
      icon: CheckCircle2,
      label: 'Your Status',
      value: election.voterStatus,
      accent: election.status === 'live',
    },
  ]

  return (
    <section className="card overflow-hidden" aria-labelledby="election-info-heading">
      <h2 id="election-info-heading" className="sr-only">
        Election information
      </h2>
      <dl>
        {rows.map(({ icon: Icon, label, value, accent }, index) => (
          <div
            key={label}
            className={`flex items-center gap-3 px-5 py-4 ${
              index < rows.length - 1 ? 'border-b border-border' : ''
            }`}
          >
            <Icon
              className={`size-4 shrink-0 ${accent ? 'text-accent' : 'text-navy-muted'}`}
              aria-hidden="true"
            />
            <dt className="text-sm text-navy-muted">{label}</dt>
            <dd
              className={`ml-auto text-right text-sm font-semibold ${
                accent ? 'text-accent' : 'text-navy'
              }`}
            >
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
