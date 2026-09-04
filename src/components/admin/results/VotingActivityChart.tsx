import type { ElectionStatus } from '../../../data/elections'
import type { HourlyPoint } from '../../../data/manageElection'
import { formatActivityHour } from '../../../data/adminResults'
import { VotingActivity } from '../manage-election/VotingActivity'

type VotingActivityChartProps = {
  points: HourlyPoint[]
  status: ElectionStatus
}

export function VotingActivityChart({
  points,
  status,
}: VotingActivityChartProps) {
  return (
    <VotingActivity
      points={points}
      status={status}
      formatHour={formatActivityHour}
    />
  )
}
