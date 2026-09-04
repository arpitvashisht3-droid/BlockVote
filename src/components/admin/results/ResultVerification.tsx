import { BadgeCheck, Hash, Layers, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatNumber, type Election } from '../../../data/elections'
import { getVerificationDetails } from '../../../data/adminResults'
import { buttonClassName } from '../../buttonStyles'

type ResultVerificationProps = {
  election: Election
  finalized: boolean
}

export function ResultVerification({
  election,
  finalized,
}: ResultVerificationProps) {
  const details = getVerificationDetails(election)
  const ready = details.available && (finalized || election.status !== 'upcoming')

  return (
    <section className="card p-5 sm:p-6">
      <h2 className="text-lg font-bold text-navy">Result Verification</h2>
      <p className="mt-1 text-sm text-navy-muted">
        On-chain integrity checks for the selected election.
      </p>

      {ready ? (
        <>
          <dl className="mt-5 divide-y divide-border border-t border-border">
            <div className="flex items-center gap-3 py-3">
              <ShieldCheck
                className="size-4 shrink-0 text-navy-muted"
                aria-hidden="true"
              />
              <dt className="text-sm text-navy-muted">Blockchain Status</dt>
              <dd className="ml-auto inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
                <BadgeCheck className="size-4" aria-hidden="true" />
                Verified
              </dd>
            </div>
            <div className="flex items-center gap-3 py-3">
              <Hash className="size-4 shrink-0 text-navy-muted" aria-hidden="true" />
              <dt className="text-sm text-navy-muted">Election ID</dt>
              <dd className="ml-auto font-mono text-sm font-semibold text-navy">
                {details.electionCode}
              </dd>
            </div>
            <div className="flex items-center gap-3 py-3">
              <Layers
                className="size-4 shrink-0 text-navy-muted"
                aria-hidden="true"
              />
              <dt className="text-sm text-navy-muted">Block Height</dt>
              <dd className="ml-auto text-sm font-semibold text-navy">
                {details.blockHeight != null
                  ? formatNumber(details.blockHeight)
                  : '—'}
              </dd>
            </div>
            <div className="flex items-center gap-3 py-3">
              <ShieldCheck
                className="size-4 shrink-0 text-navy-muted"
                aria-hidden="true"
              />
              <dt className="text-sm text-navy-muted">Transactions</dt>
              <dd className="ml-auto text-sm font-semibold text-navy">
                {details.transactions != null
                  ? formatNumber(details.transactions)
                  : '—'}
              </dd>
            </div>
            <div className="flex items-center gap-3 py-3">
              <Hash className="size-4 shrink-0 text-navy-muted" aria-hidden="true" />
              <dt className="text-sm text-navy-muted">Merkle Root</dt>
              <dd className="ml-auto font-mono text-sm font-semibold text-navy">
                {details.merkleLabel ?? '—'}
              </dd>
            </div>
          </dl>
          <Link
            to={details.verifyPath}
            className={buttonClassName({ className: 'mt-4 w-full' })}
          >
            Verify on Blockchain
          </Link>
        </>
      ) : (
        <p className="mt-5 rounded-xl bg-slate-50 px-4 py-3 text-sm text-navy-muted">
          Blockchain verification will be available after results are finalized.
        </p>
      )}
    </section>
  )
}
