import { Ban, CirclePause, Radio, Trophy } from 'lucide-react'
import type { ElectionStatus } from '../../../data/elections'

type ResultsStatusCardProps = {
  status: ElectionStatus
  paused: boolean
}

const copy = {
  live: {
    title: 'Live Results',
    message: 'Voting is currently in progress.',
    icon: Radio,
    tone: 'bg-accent-soft text-accent',
  },
  ended: {
    title: 'Final Results',
    message: 'Voting has ended and results are ready for review.',
    icon: Trophy,
    tone: 'bg-accent-soft text-accent',
  },
  upcoming: {
    title: 'Results Not Available',
    message: 'Results will appear after voting begins.',
    icon: Ban,
    tone: 'bg-slate-100 text-navy-muted',
  },
  paused: {
    title: 'Voting Paused',
    message: 'Results are temporarily frozen.',
    icon: CirclePause,
    tone: 'bg-amber-50 text-amber-700',
  },
} as const

export function ResultsStatusCard({ status, paused }: ResultsStatusCardProps) {
  const state = paused ? copy.paused : copy[status]
  const Icon = state.icon

  return (
    <section className="card p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span
          className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${state.tone}`}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-lg font-bold text-navy">{state.title}</h2>
          <p className="mt-1 text-sm text-navy-muted">{state.message}</p>
        </div>
      </div>
    </section>
  )
}
