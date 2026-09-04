import { Percent, UserRound, Users, Vote } from 'lucide-react'
import {
  formatNumber,
  formatPercent,
  type Election,
} from '../../../data/elections'
import {
  getRegisteredVoters,
  getTurnoutPercent,
  getVotesCast,
} from '../../../data/manageElection'

type ElectionStatsProps = {
  election: Election
}

const cards = [
  { key: 'registered', label: 'Registered Voters', icon: Users },
  { key: 'votes', label: 'Votes Cast', icon: Vote },
  { key: 'turnout', label: 'Turnout', icon: Percent },
  { key: 'candidates', label: 'Candidates', icon: UserRound },
] as const

export function ElectionStats({ election }: ElectionStatsProps) {
  const values = {
    registered: formatNumber(getRegisteredVoters(election)),
    votes: formatNumber(getVotesCast(election)),
    turnout: formatPercent(getTurnoutPercent(election)),
    candidates: formatNumber(election.candidates.length),
  }
  const details = {
    registered: 'Eligible roll',
    votes: 'Recorded ballots',
    turnout: 'Of registered voters',
    candidates: 'On the ballot',
  }

  return (
    <section aria-label="Election statistics" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map(({ key, label, icon: Icon }) => (
        <article key={key} className="card p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-navy-muted">{label}</p>
            <span className="flex size-8 items-center justify-center rounded-lg bg-accent-soft text-accent">
              <Icon className="size-4" aria-hidden="true" />
            </span>
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight text-navy">
            {values[key]}
          </p>
          <p className="mt-1 text-xs text-navy-muted">{details[key]}</p>
        </article>
      ))}
    </section>
  )
}
