import type { ReactNode } from 'react'
import {
  booleanLabel,
  formatDateTimeLabel,
  type CreateElectionDraft,
} from '../../../data/createElection'
import { CandidateAvatar } from '../../elections/CandidateAvatar'

type ElectionReviewProps = {
  draft: CreateElectionDraft
}

function ReviewBlock({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="rounded-xl border border-border bg-surface px-4 py-4 sm:px-5">
      <h3 className="text-sm font-semibold tracking-wide text-navy-muted uppercase">
        {title}
      </h3>
      <div className="mt-3">{children}</div>
    </section>
  )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 py-2 sm:grid-cols-[10rem_1fr] sm:gap-4">
      <p className="text-sm text-navy-muted">{label}</p>
      <p className="text-sm font-medium text-navy">{value}</p>
    </div>
  )
}

export function ElectionReview({ draft }: ElectionReviewProps) {
  const { details, candidates, settings } = draft
  const start = formatDateTimeLabel(details.startDate, details.startTime)
  const end = formatDateTimeLabel(details.endDate, details.endTime)

  return (
    <div className="space-y-4">
      <ReviewBlock title="Election Details">
        <div className="divide-y divide-border">
          <ReviewRow label="Name" value={details.name || '—'} />
          <ReviewRow label="Description" value={details.description || '—'} />
          <ReviewRow label="Type" value={details.type} />
          <ReviewRow label="Start" value={start} />
          <ReviewRow label="End" value={end} />
          <ReviewRow label="Organization" value={details.organization.trim() || 'Not specified'} />
          <ReviewRow label="Election ID" value={details.electionCode} />
          {details.type === 'Society Election' && details.societyName && (
            <ReviewRow label="Society Name" value={details.societyName} />
          )}
          {details.type === 'College Election' && (
            <>
              {details.collegeName && <ReviewRow label="College Name" value={details.collegeName} />}
              {details.collegeId && <ReviewRow label="College Code" value={details.collegeId} />}
            </>
          )}
          {details.type === 'University Election' && details.universityName && (
            <ReviewRow label="University Name" value={details.universityName} />
          )}
          <ReviewRow label="Secret Code" value={details.secretCode ? '•••••••• (Hashed Server-Side)' : 'Not set'} />
          <ReviewRow label="Voter Capacity Cap" value={details.maxVoters ? `${details.maxVoters} voters max` : 'Unlimited'} />
        </div>
      </ReviewBlock>

      <ReviewBlock title="Candidates">
        <p className="text-sm text-navy-muted">
          {candidates.length} candidate{candidates.length === 1 ? '' : 's'} on
          the ballot
        </p>
        <ul className="mt-3 space-y-3">
          {candidates.map((candidate) => (
            <li key={candidate.id} className="flex items-center gap-3">
              <CandidateAvatar name={candidate.name} size="sm" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-navy">{candidate.name}</p>
                <p className="text-xs text-navy-muted">
                  {candidate.department}
                  {candidate.position ? ` · ${candidate.position}` : ''}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </ReviewBlock>

      <ReviewBlock title="Voting Settings">
        <div className="divide-y divide-border">
          <ReviewRow label="Voting method" value={settings.method} />
          <ReviewRow
            label="Votes per voter"
            value={String(settings.votesPerVoter)}
          />
          <ReviewRow
            label="Anonymous voting"
            value={booleanLabel(settings.anonymousVoting)}
          />
          <ReviewRow
            label="Wallet requirement"
            value={booleanLabel(settings.requireWallet)}
          />
          <ReviewRow
            label="Live results"
            value={booleanLabel(settings.showLiveResults)}
          />
          <ReviewRow label="Visibility" value={settings.visibility} />
          <ReviewRow
            label="Voter verification"
            value={booleanLabel(settings.requireVoterVerification)}
          />
          <ReviewRow
            label="Blockchain verification"
            value={booleanLabel(settings.enableBlockchainVerification)}
          />
        </div>
      </ReviewBlock>

      <div className="rounded-xl border border-accent/20 bg-accent-soft px-4 py-4 sm:px-5">
        <p className="font-semibold text-navy">Ready to publish?</p>
        <p className="mt-1 text-sm text-navy-muted">
          Once published, voters will be able to participate according to the
          configured election rules.
        </p>
      </div>
    </div>
  )
}
