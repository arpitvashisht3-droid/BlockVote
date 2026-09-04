import { useState } from 'react'
import { formatNumber } from '../../data/elections'
import {
  truncateTxHash,
  type VoteTransaction,
} from '../../data/verification'
import { Button } from '../Button'
import { CopyHash } from './CopyHash'

type TransactionListProps = {
  transactions: VoteTransaction[]
}

export function TransactionList({ transactions }: TransactionListProps) {
  const [openHash, setOpenHash] = useState<string | null>(null)

  return (
    <section className="card p-5 sm:p-6" aria-labelledby="sample-tx-heading">
      <h2 id="sample-tx-heading" className="text-lg font-bold text-navy">
        Sample Vote Transactions
      </h2>
      <p className="mt-1 text-sm text-navy-muted">
        These records show ballot commitments only. Voter identities are not
        stored on-chain.
      </p>

      <ul className="mt-5 divide-y divide-border border-t border-border">
        {transactions.map((tx) => {
          const expanded = openHash === tx.hash

          return (
            <li key={tx.hash} className="py-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-xs font-medium text-navy-muted">Transaction</p>
                    <div className="mt-1">
                      <CopyHash
                        value={tx.hash}
                        display={truncateTxHash(tx.hash)}
                        label="transaction hash"
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-navy-muted">Block</p>
                    <p className="mt-1 font-mono text-sm font-semibold text-navy">
                      #{formatNumber(tx.blockNumber)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-navy-muted">Timestamp</p>
                    <p className="mt-1 text-sm font-semibold text-navy">
                      {tx.timestamp}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-navy-muted">Status</p>
                    <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
                      <span className="size-2 rounded-full bg-accent" aria-hidden="true" />
                      Confirmed
                    </p>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  className="shrink-0"
                  aria-expanded={expanded}
                  onClick={() =>
                    setOpenHash((current) => (current === tx.hash ? null : tx.hash))
                  }
                >
                  View Transaction
                </Button>
              </div>

              {expanded ? (
                <div className="mt-3 rounded-xl border border-border bg-surface p-4 text-sm text-navy-muted">
                  <p>
                    <span className="font-medium text-navy">Full hash: </span>
                    <code className="font-mono text-xs break-all text-navy">
                      {tx.hash}
                    </code>
                  </p>
                  <p className="mt-2">
                    <span className="font-medium text-navy">Confirmations: </span>
                    {tx.confirmations}
                  </p>
                  <p className="mt-2">
                    Record type: encrypted ballot commitment. No voter name,
                    wallet identity, or personal data is attached to this
                    transaction.
                  </p>
                </div>
              ) : null}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
