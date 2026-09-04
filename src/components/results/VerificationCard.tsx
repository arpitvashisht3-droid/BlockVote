import { BadgeCheck, Hash, Layers, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatNumber, type Election } from '../../data/elections'
import { buttonClassName } from '../buttonStyles'

type VerificationCardProps = {
  election: Election
  totalTransactions: number
  blockHeight: number
  verifyPath: string
}

export function VerificationCard({
  election,
  totalTransactions,
  blockHeight,
  verifyPath,
}: VerificationCardProps) {
  const rows = [
    { icon: Hash, label: 'Election ID', value: election.electionCode },
    {
      icon: Layers,
      label: 'Block Height',
      value: formatNumber(blockHeight),
    },
    {
      icon: ShieldCheck,
      label: 'Total Transactions',
      value: formatNumber(totalTransactions),
    },
    { icon: BadgeCheck, label: 'Verification Status', value: 'Verified' },
  ]

  return (
    <section className="card p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
          <ShieldCheck className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-lg font-bold text-navy">Blockchain Verified</h2>
          <p className="mt-1 text-sm leading-relaxed text-navy-muted">
            Every vote was securely recorded and the final results can be
            independently verified on the blockchain.
          </p>
        </div>
      </div>

      <dl className="mt-5 divide-y divide-border border-t border-border">
        {rows.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-3 py-3">
            <Icon className="size-4 shrink-0 text-navy-muted" aria-hidden="true" />
            <dt className="text-sm text-navy-muted">{label}</dt>
            <dd
              className={`ml-auto text-sm font-semibold ${
                label === 'Verification Status' ? 'text-accent' : 'text-navy'
              }`}
            >
              {value}
            </dd>
          </div>
        ))}
      </dl>

      <Link
        to={verifyPath}
        className={buttonClassName({ className: 'mt-4 w-full' })}
      >
        Verify on Blockchain
      </Link>
    </section>
  )
}
