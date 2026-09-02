import { formatNumber, formatPercent } from '../../../data/elections'
import {
  endDateLabel,
  getElectionType,
  getRegisteredVoters,
  getTurnoutPercent,
  getVotesCast,
  type ElectionManagement,
} from '../../../data/manageElection'
import { StatusBadge } from '../../elections/StatusBadge'
import { AdminElectionActions } from './AdminElectionActions'

type AdminElectionListCardProps = {
  item: ElectionManagement
  onCopyId: () => void
  onDuplicate: () => void
  onArchive: () => void
}

export function AdminElectionCard({
  item,
  onCopyId,
  onDuplicate,
  onArchive,
}: AdminElectionListCardProps) {
  const { election, organization, paused } = item

  return (
    <article className="card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-navy">{election.title}</h3>
          <p className="mt-1 text-xs text-navy-muted">{organization}</p>
          <p className="mt-1 font-mono text-xs text-navy-muted">
            {election.electionCode}
          </p>
        </div>
        <StatusBadge status={election.status} paused={paused} />
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-xs text-navy-muted">Candidates</dt>
          <dd className="font-semibold text-navy">
            {formatNumber(election.candidates.length)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-navy-muted">Voters</dt>
          <dd className="font-semibold text-navy">
            {formatNumber(getRegisteredVoters(election))}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-navy-muted">Votes</dt>
          <dd className="font-semibold text-navy">
            {formatNumber(getVotesCast(election))}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-navy-muted">Turnout</dt>
          <dd className="font-semibold text-navy">
            {formatPercent(getTurnoutPercent(election))}
          </dd>
        </div>
      </dl>
      <p className="mt-3 text-xs text-navy-muted">
        {getElectionType(election)} · Ends {endDateLabel(election.endDate)}
      </p>
      <div className="mt-4">
        <AdminElectionActions
          item={item}
          layout="card"
          onCopyId={onCopyId}
          onDuplicate={onDuplicate}
          onArchive={onArchive}
        />
      </div>
    </article>
  )
}
