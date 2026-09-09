import { ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { buttonClassName } from '../buttonStyles'

interface VerificationStatusCardProps {
  verifiedVotes?: number
  lastVerified?: string
}

export function VerificationStatusCard({
  verifiedVotes = 0,
  lastVerified = '—',
}: VerificationStatusCardProps) {
  return (
    <section className="card p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
          <ShieldCheck className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-lg font-bold text-navy">Your votes are secure</h2>
          <p className="mt-1 text-sm leading-relaxed text-navy-muted">
            Every vote you&apos;ve cast is recorded as a tamper-resistant
            blockchain transaction while keeping your identity private.
          </p>
        </div>
      </div>

      <dl className="mt-5 space-y-3 border-t border-border pt-4">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-sm text-navy-muted">Verified Votes</dt>
          <dd className="text-sm font-semibold text-navy">
            {verifiedVotes}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-sm text-navy-muted">Last Verified</dt>
          <dd className="text-sm font-semibold text-navy">
            {lastVerified}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-sm text-navy-muted">Status</dt>
          <dd className="text-sm font-semibold text-accent">
            {verifiedVotes > 0 ? 'Verified on Sepolia' : 'Ready'}
          </dd>
        </div>
      </dl>

      <Link
        to="/dashboard/transactions"
        className={buttonClassName({ className: 'mt-5 w-full' })}
      >
        View Transactions
      </Link>
    </section>
  )
}
