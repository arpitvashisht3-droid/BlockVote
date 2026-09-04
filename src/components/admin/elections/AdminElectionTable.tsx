import type { ElectionManagement } from '../../../data/manageElection'
import { AdminElectionCard } from './AdminElectionCard'
import { AdminElectionRow } from './AdminElectionRow'

type AdminElectionTableProps = {
  items: ElectionManagement[]
  onCopyId: (item: ElectionManagement) => void
  onDuplicate: (item: ElectionManagement) => void
  onArchive: (item: ElectionManagement) => void
}

export function AdminElectionTable({
  items,
  onCopyId,
  onDuplicate,
  onArchive,
}: AdminElectionTableProps) {
  return (
    <>
      <div className="card hidden overflow-hidden lg:block">
        <table className="w-full min-w-0 text-sm">
          <caption className="sr-only">All elections</caption>
          <thead className="bg-slate-50 text-left text-xs font-semibold tracking-wide text-navy-muted uppercase">
            <tr>
              <th scope="col" className="w-[22%] px-4 py-3">
                Election
              </th>
              <th scope="col" className="w-[10%] px-4 py-3">
                Status
              </th>
              <th scope="col" className="w-[9%] px-4 py-3">
                Candidates
              </th>
              <th scope="col" className="w-[9%] px-4 py-3">
                Voters
              </th>
              <th scope="col" className="w-[8%] px-4 py-3">
                Votes
              </th>
              <th scope="col" className="w-[8%] px-4 py-3">
                Turnout
              </th>
              <th scope="col" className="w-[12%] px-4 py-3">
                End Date
              </th>
              <th scope="col" className="px-4 py-3">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <AdminElectionRow
                key={item.election.id}
                item={item}
                onCopyId={() => onCopyId(item)}
                onDuplicate={() => onDuplicate(item)}
                onArchive={() => onArchive(item)}
              />
            ))}
          </tbody>
        </table>
      </div>

      <ul className="grid gap-3 lg:hidden">
        {items.map((item) => (
          <li key={item.election.id}>
            <AdminElectionCard
              item={item}
              onCopyId={() => onCopyId(item)}
              onDuplicate={() => onDuplicate(item)}
              onArchive={() => onArchive(item)}
            />
          </li>
        ))}
      </ul>
    </>
  )
}
