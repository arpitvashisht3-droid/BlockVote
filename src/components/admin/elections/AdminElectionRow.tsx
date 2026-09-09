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

type AdminElectionRowProps = {
  item: ElectionManagement
  onCopyId: () => void
  onDuplicate: () => void
  onArchive: () => void
}

export function AdminElectionRow({
  item,
  onCopyId,
  onDuplicate,
  onArchive,
}: AdminElectionRowProps) {
  const { election, organization, paused } = item

  return (
    <tr className="border-t border-border">
      <th scope="row" className="px-4 py-4 text-left align-top">
        <p className="font-semibold text-navy">{election.title}</p>
        <p className="mt-1 text-xs text-navy-muted">
          {organization}
          <span className="mx-1">·</span>
          {election.electionCode}
        </p>
        <p className="mt-1 text-xs text-navy-muted">{getElectionType(election)}</p>
      </th>
      <td className="px-4 py-4 align-top">
        <StatusBadge status={election.status} paused={paused} />
      </td>
      <td className="px-4 py-4 align-top text-sm text-navy-muted">
        {formatNumber(election.candidates.length)}
      </td>
      <td className="px-4 py-4 align-top text-sm text-navy-muted">
        {formatNumber(getRegisteredVoters(election))}
      </td>
      <td className="px-4 py-4 align-top text-sm text-navy-muted">
        {formatNumber(getVotesCast(election))}
      </td>
      <td className="px-4 py-4 align-top text-sm text-navy-muted">
        {formatPercent(getTurnoutPercent(election))}
      </td>
      <td className="px-4 py-4 align-top text-sm text-navy-muted">
        {endDateLabel(election.endDate)}
      </td>
      <td className="px-4 py-4 align-top">
        <AdminElectionActions
          item={item}
          onCopyId={onCopyId}
          onDuplicate={onDuplicate}
          onArchive={onArchive}
        />
      </td>
    </tr>
  )
}
