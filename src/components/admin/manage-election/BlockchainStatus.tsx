import { BadgeCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  formatNumber,
  getVerifyPath,
  type Election,
} from '../../../data/elections'
import { hasBlockchainRecord } from '../../../data/manageElection'
import { getVerificationByCode } from '../../../data/verification'
import { buttonClassName } from '../../buttonStyles'

type BlockchainStatusProps = {
  election: Election
}

export function BlockchainStatus({ election }: BlockchainStatusProps) {
  const record = getVerificationByCode(election.electionCode)
  const verified = hasBlockchainRecord(election)
  const blockHeight =
    election.results?.blockHeight ?? record?.transactions[0]?.blockNumber
  const transactions =
    record?.record.transactionCount ?? election.results?.totalVotes
  const lastVerification =
    election.results?.resultsFinalizedDate ?? record?.transactions[0]?.timestamp

  return (
    <section className="card p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-bold text-navy">Blockchain Status</h2>
        {verified ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent">
            <BadgeCheck className="size-3.5" aria-hidden="true" />
            Verified
          </span>
        ) : (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-navy-muted">
            Pending
          </span>
        )}
      </div>

      {verified ? (
        <dl className="mt-4 space-y-3">
          <div>
            <dt className="text-xs font-semibold tracking-wide text-navy-muted uppercase">
              Election ID
            </dt>
            <dd className="mt-1 font-mono text-sm font-semibold text-navy">
              {election.electionCode}
            </dd>
          </div>
          {blockHeight ? (
            <div>
              <dt className="text-xs font-semibold tracking-wide text-navy-muted uppercase">
                Block Height
              </dt>
              <dd className="mt-1 text-sm font-semibold text-navy">
                {formatNumber(blockHeight)}
              </dd>
            </div>
          ) : null}
          {transactions ? (
            <div>
              <dt className="text-xs font-semibold tracking-wide text-navy-muted uppercase">
                Transactions
              </dt>
              <dd className="mt-1 text-sm font-semibold text-navy">
                {formatNumber(transactions)}
              </dd>
            </div>
          ) : null}
          {lastVerification ? (
            <div>
              <dt className="text-xs font-semibold tracking-wide text-navy-muted uppercase">
                Last Verification
              </dt>
              <dd className="mt-1 text-sm font-semibold text-navy">
                {lastVerification}
              </dd>
            </div>
          ) : null}
        </dl>
      ) : (
        <p className="mt-4 text-sm text-navy-muted">
          Blockchain verification will be available once the election is
          finalized.
        </p>
      )}

      <Link
        to={getVerifyPath(election)}
        className={buttonClassName({
          variant: 'secondary',
          className: 'mt-5 w-full',
        })}
      >
        Verify Election
      </Link>
    </section>
  )
}
