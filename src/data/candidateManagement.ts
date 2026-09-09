import type { Candidate, Election } from './elections'
import { formatNumber } from './elections'
import {
  getActiveCandidates,
  getCandidatePosition,
  getCandidateVotes,
} from './manageElection'

export const DEFAULT_CANDIDATE_ELECTION_ID = ''

export type CandidateStatusFilter = 'all' | 'active' | 'removed'

export type CandidateListFilters = {
  query: string
  position: string
  department: string
  status: CandidateStatusFilter
}

function uniqueSorted(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort(
    (a, b) => a.localeCompare(b),
  )
}

export function getUniquePositions(candidates: Candidate[]) {
  return uniqueSorted(candidates.map(getCandidatePosition))
}

export function getUniqueDepartments(candidates: Candidate[]) {
  return uniqueSorted(candidates.map((candidate) => candidate.department))
}

export function summarizeCandidates(election: Election) {
  const { candidates } = election
  return {
    total: candidates.length,
    active: getActiveCandidates(candidates).length,
    positions: getUniquePositions(candidates).length,
    electionTitle: election.title,
  }
}

export function filterCandidates(
  candidates: Candidate[],
  { query, position, department, status }: CandidateListFilters,
) {
  const normalized = query.trim().toLowerCase()

  return candidates.filter((candidate) => {
    const role = getCandidatePosition(candidate)
    const matchesQuery =
      normalized.length === 0 ||
      candidate.name.toLowerCase().includes(normalized) ||
      candidate.department.toLowerCase().includes(normalized) ||
      role.toLowerCase().includes(normalized)
    const matchesPosition = position === 'all' || role === position
    const matchesDepartment =
      department === 'all' || candidate.department === department
    const matchesStatus =
      status === 'all' ||
      (status === 'active' && !candidate.removed) ||
      (status === 'removed' && Boolean(candidate.removed))

    return matchesQuery && matchesPosition && matchesDepartment && matchesStatus
  })
}

export function canRemoveCandidate(
  candidates: Candidate[],
  candidateId: string,
) {
  const target = candidates.find((candidate) => candidate.id === candidateId)
  if (!target || target.removed) {
    return false
  }

  return getActiveCandidates(candidates).length > 2
}

export function formatCandidateVoteDisplay(
  election: Election,
  candidateId: string,
) {
  if (election.status === 'upcoming') {
    return '—'
  }

  const tally = getCandidateVotes(election, candidateId)
  if (!tally) {
    return '—'
  }

  return `${formatNumber(tally.votes)} votes`
}

export function candidateVoteCount(election: Election, candidateId: string) {
  if (election.status === 'upcoming') {
    return null
  }

  return getCandidateVotes(election, candidateId)?.votes ?? null
}
