import {
  BadgeCheck,
  Clock3,
  Globe,
  Hash,
  Layers,
  Vote,
} from 'lucide-react'
import { formatNumber, type Election } from '../../data/elections'
import type { ElectionVerification } from '../../data/verification'

type ElectionVerificationInfoProps = {
  election: Election
  verification: ElectionVerification
}

export function ElectionVerificationInfo({
  election,
  verification,
}: ElectionVerificationInfoProps) {
  const rows = [
    { icon: Vote, label: 'Election', value: election.title },
    { icon: Hash, label: 'Election ID', value: election.electionCode },
    { icon: BadgeCheck, label: 'Status', value: 'Verified', accent: true },
    { icon: Globe, label: 'Network', value: verification.network },
    {
      icon: Layers,
      label: 'Block Height',
      value: formatNumber(
        election.results?.blockHeight ??
          verification.transactions[0]?.blockNumber ??
          0,
      ),
    },
    {
      icon: Clock3,
      label: 'Finalized',
      value: election.results?.resultsFinalizedDate ?? election.endDate,
    },
  ]

  return (
    <section className="card overflow-hidden" aria-labelledby="election-info-heading">
      <h2 id="election-info-heading" className="px-5 pt-5 text-lg font-bold text-navy sm:px-6">
        Election information
      </h2>
      <dl className="mt-2">
        {rows.map(({ icon: Icon, label, value, accent }, index) => (
          <div
            key={label}
            className={`flex items-start gap-3 px-5 py-3.5 sm:items-center sm:px-6 ${
              index < rows.length - 1 ? 'border-b border-border' : ''
            }`}
          >
            <Icon
              className={`mt-0.5 size-4 shrink-0 sm:mt-0 ${accent ? 'text-accent' : 'text-navy-muted'}`}
              aria-hidden="true"
            />
            <dt className="text-sm text-navy-muted">{label}</dt>
            <dd
              className={`ml-auto max-w-[60%] text-right text-sm font-semibold break-words ${
                accent ? 'text-accent' : 'text-navy'
              }`}
            >
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
