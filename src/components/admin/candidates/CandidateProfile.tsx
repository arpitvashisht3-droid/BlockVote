import { formatNumber, type Candidate, type Election } from '../../../data/elections'
import { candidateVoteCount } from '../../../data/candidateManagement'
import { CandidateProfileModal } from '../../elections/CandidateProfileModal'

type CandidateProfileProps = {
  candidate: Candidate | null
  election: Election
  onClose: () => void
}

export function CandidateProfile({
  candidate,
  election,
  onClose,
}: CandidateProfileProps) {
  const votes = candidate ? candidateVoteCount(election, candidate.id) : null

  return (
    <CandidateProfileModal
      candidate={candidate}
      onClose={onClose}
      electionTitle={election.title}
      votesLabel={votes == null ? '—' : formatNumber(votes)}
      statusLabel={candidate?.removed ? 'Removed' : 'Active'}
    />
  )
}
