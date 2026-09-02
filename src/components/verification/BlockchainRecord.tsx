import { formatNumber } from '../../data/elections'
import {
  truncateHash,
  type BlockchainRecordData,
} from '../../data/verification'
import { CopyHash } from './CopyHash'

type BlockchainRecordProps = {
  record: BlockchainRecordData
}

export function BlockchainRecord({ record }: BlockchainRecordProps) {
  const rows = [
    {
      label: 'Block Hash',
      value: record.blockHash,
      display: truncateHash(record.blockHash, 18, 8),
    },
    {
      label: 'Previous Block Hash',
      value: record.previousBlockHash,
      display: truncateHash(record.previousBlockHash, 18, 8),
    },
    {
      label: 'Merkle Root',
      value: record.merkleRoot,
      display: truncateHash(record.merkleRoot, 18, 8),
    },
  ]

  return (
    <section className="card p-5 sm:p-6" aria-labelledby="blockchain-record-heading">
      <h2 id="blockchain-record-heading" className="text-lg font-bold text-navy">
        Blockchain Record
      </h2>
      <dl className="mt-4 divide-y divide-border border-t border-border">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <dt className="text-sm text-navy-muted">{row.label}</dt>
            <dd className="min-w-0">
              <CopyHash
                value={row.value}
                display={row.display}
                label={row.label}
              />
            </dd>
          </div>
        ))}
        <div className="flex items-center justify-between gap-3 py-3">
          <dt className="text-sm text-navy-muted">Transaction Count</dt>
          <dd className="text-sm font-semibold text-navy">
            {formatNumber(record.transactionCount)}
          </dd>
        </div>
      </dl>
    </section>
  )
}
