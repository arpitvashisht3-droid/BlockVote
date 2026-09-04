import type { Candidate } from '../../data/elections'
import { CandidateAvatar } from './CandidateAvatar'

type CandidateCardProps = {
  candidate: Candidate
  selected: boolean
  disabled?: boolean
  name: string
  onSelect: () => void
  onViewProfile: () => void
}

export function CandidateCard({
  candidate,
  selected,
  disabled = false,
  name,
  onSelect,
  onViewProfile,
}: CandidateCardProps) {
  return (
    <article
      className={`flex items-center gap-3 rounded-xl border p-4 transition-colors sm:gap-4 ${
        selected
          ? 'border-accent bg-accent-soft/70'
          : 'border-border bg-white hover:border-slate-300'
      } ${disabled ? 'opacity-80' : ''}`}
    >
      <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 sm:gap-4">
        <input
          type="radio"
          name={name}
          value={candidate.id}
          checked={selected}
          disabled={disabled}
          className="sr-only"
          onChange={onSelect}
        />
        <CandidateAvatar name={candidate.name} />
        <span className="min-w-0">
          <span className="block font-semibold text-navy">{candidate.name}</span>
          <span className="block text-sm text-navy-muted">
            {candidate.department}
          </span>
        </span>
      </label>

      <button
        type="button"
        className="shrink-0 text-sm font-semibold text-accent transition-colors hover:text-accent-hover"
        onClick={onViewProfile}
      >
        View Profile
      </button>

      <button
        type="button"
        disabled={disabled}
        aria-hidden="true"
        tabIndex={-1}
        className={`grid size-5 shrink-0 place-items-center rounded-full border ${
          selected ? 'border-accent bg-accent' : 'border-slate-300 bg-white'
        }`}
        onClick={onSelect}
      >
        {selected ? <span className="size-2 rounded-full bg-white" /> : null}
      </button>
    </article>
  )
}
