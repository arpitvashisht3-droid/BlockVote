import { BadgeCheck, Hash, Wallet } from 'lucide-react'
import { voterProfile } from '../../data/dashboard'

export function VoterStatus() {
  return (
    <section className="card p-5 sm:p-6">
      <h2 className="text-lg font-bold text-navy">Voter Status</h2>
      <dl className="mt-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <dt className="inline-flex items-center gap-2 text-sm text-navy-muted">
            <BadgeCheck className="size-4 text-accent" aria-hidden="true" />
            Status
          </dt>
          <dd className="text-sm font-semibold text-accent">
            {voterProfile.status}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="inline-flex items-center gap-2 text-sm text-navy-muted">
            <Hash className="size-4" aria-hidden="true" />
            Voter ID
          </dt>
          <dd className="font-mono text-sm font-semibold text-navy">
            {voterProfile.voterId}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="inline-flex items-center gap-2 text-sm text-navy-muted">
            <Wallet className="size-4" aria-hidden="true" />
            Wallet
          </dt>
          <dd className="font-mono text-sm font-semibold text-navy">
            {voterProfile.wallet}
          </dd>
        </div>
      </dl>
    </section>
  )
}
