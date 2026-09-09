import { X } from 'lucide-react'
import {
  defaultCandidateAchievements,
  type Candidate,
} from '../../data/elections'
import { Button } from '../Button'
import { Modal } from '../Modal'
import { CandidateAvatar } from './CandidateAvatar'

type CandidateProfileModalProps = {
  candidate: Candidate | null
  onClose: () => void
  electionTitle?: string
  votesLabel?: string
  statusLabel?: string
}

export function CandidateProfileModal({
  candidate,
  onClose,
  electionTitle,
  votesLabel,
  statusLabel,
}: CandidateProfileModalProps) {
  const showMeta = Boolean(electionTitle || votesLabel || statusLabel)
  const achievements = candidate
    ? candidate.achievements.length > 0
      ? showMeta
        ? candidate.achievements.slice(0, 3)
        : candidate.achievements
      : defaultCandidateAchievements(
          candidate.department,
          candidate.position,
        )
    : []
  const subtitle = candidate
    ? [candidate.department, candidate.position].filter(Boolean).join(' · ')
    : ''

  return (
    <Modal
      open={candidate != null}
      title="Candidate Profile"
      onClose={onClose}
      className="max-h-[90vh] overflow-y-auto"
    >
      {candidate ? (
        <div>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <CandidateAvatar name={candidate.name} size="lg" />
              <div>
                <p className="text-sm font-medium text-accent">
                  Candidate Profile
                </p>
                <p className="text-lg font-bold text-navy">{candidate.name}</p>
                <p className="text-sm text-navy-muted">{subtitle}</p>
              </div>
            </div>
            <button
              type="button"
              className="rounded-lg p-1 text-navy-muted transition-colors hover:bg-slate-100 hover:text-navy"
              aria-label="Close candidate profile"
              onClick={onClose}
            >
              <X className="size-5" />
            </button>
          </div>

          <section className="mt-6">
            <h3 className="text-sm font-semibold text-navy">About</h3>
            <p className="mt-2 text-sm leading-relaxed text-navy-muted">
              {candidate.about}
            </p>
          </section>

          <section className="mt-5">
            <h3 className="text-sm font-semibold text-navy">Achievements</h3>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-navy-muted">
              {achievements.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          {showMeta ? (
            <dl className="mt-5 grid grid-cols-1 gap-3 rounded-xl bg-slate-50 p-4 text-center sm:grid-cols-3">
              <div>
                <dt className="text-xs font-semibold tracking-wide text-navy-muted uppercase">
                  Election
                </dt>
                <dd className="mt-1 text-sm font-semibold text-navy">
                  {electionTitle ?? '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold tracking-wide text-navy-muted uppercase">
                  Votes
                </dt>
                <dd className="mt-1 text-sm font-semibold text-navy">
                  {votesLabel ?? '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold tracking-wide text-navy-muted uppercase">
                  Status
                </dt>
                <dd className="mt-1 text-sm font-semibold text-navy">
                  {statusLabel ?? '—'}
                </dd>
              </div>
            </dl>
          ) : null}

          <Button className="mt-6 w-full" variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      ) : null}
    </Modal>
  )
}
