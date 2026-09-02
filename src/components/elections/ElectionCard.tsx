import {
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock3,
  Cpu,
  GraduationCap,
  Landmark,
  Music,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  formatVoteCount,
  getElectionPath,
  type Election,
} from '../../data/elections'
import { buttonClassName } from '../buttonStyles'
import { StatusBadge } from './StatusBadge'

const thumbnailIcons = {
  landmark: Landmark,
  cpu: Cpu,
  music: Music,
  graduation: GraduationCap,
} as const

const thumbnailTones = {
  navy: 'bg-navy text-accent',
  teal: 'bg-accent-soft text-accent',
  indigo: 'bg-upcoming-soft text-upcoming',
  slate: 'bg-slate-100 text-navy-muted',
} as const

const ctaLabels = {
  live: 'Vote Now',
  upcoming: 'View Details',
  ended: 'View Results',
} as const

type ElectionCardProps = {
  election: Election
}

export function ElectionCard({ election }: ElectionCardProps) {
  const ThumbnailIcon = thumbnailIcons[election.thumbnail.icon]
  const ctaVariant = election.status === 'live' ? 'primary' : 'secondary'

  return (
    <article className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-5 sm:p-5">
      <div
        className={`flex h-36 w-full shrink-0 items-center justify-center rounded-lg sm:h-24 sm:w-28 ${thumbnailTones[election.thumbnail.tone]}`}
        aria-hidden="true"
      >
        <ThumbnailIcon className="size-10 sm:size-8" />
      </div>

      <div className="min-w-0 flex-1">
        <StatusBadge status={election.status} />
        <h2 className="mt-2 text-lg font-semibold tracking-tight text-navy">
          {election.title}
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-navy-muted">
          {election.description}
        </p>

        <ul className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-navy-muted">
          <li className="inline-flex items-center gap-1.5">
            {election.status === 'live' ? (
              <Clock3 className="size-4 text-accent" aria-hidden="true" />
            ) : (
              <Calendar className="size-4" aria-hidden="true" />
            )}
            {election.timeLabel}
          </li>
          {election.voteCount != null ? (
            <li className="inline-flex items-center gap-1.5">
              <Users className="size-4" aria-hidden="true" />
              {formatVoteCount(election.voteCount)}
            </li>
          ) : null}
          {election.turnoutPercent != null ? (
            <li className="inline-flex items-center gap-1.5">
              <BarChart3 className="size-4" aria-hidden="true" />
              {election.turnoutPercent}% turnout
            </li>
          ) : null}
          {election.published ? (
            <li className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-accent" aria-hidden="true" />
              Published
            </li>
          ) : null}
        </ul>
      </div>

      <Link
        to={getElectionPath(election)}
        className={buttonClassName({
          variant: ctaVariant,
          className: 'w-full shrink-0 sm:w-auto',
        })}
      >
        {ctaLabels[election.status]}
      </Link>
    </article>
  )
}
