/**
 * elections.ts — Election type definitions, utility functions, and session-level
 * election registration used by the admin create/manage flow.
 *
 * All hardcoded demo elections have been removed.
 * Elections are loaded from the Sepolia blockchain via src/services/blockchain.ts.
 */

export type ElectionStatus = 'live' | 'upcoming' | 'ended'

export const electionTypes = [
  'General Election',
  'Student Election',
  'Organization Election',
  'Committee Election',
] as const

export type ElectionType = (typeof electionTypes)[number]

export type ElectionSort = 'default' | 'votes' | 'title'

export type Candidate = {
  id: string
  name: string
  department: string
  about: string
  achievements: string[]
  position?: string
  removed?: boolean
  /** on-chain candidate ID (uint256) — required for casting a vote */
  onchainId?: number
}

export type CandidateResult = {
  candidateId: string
  votes: number
  percentage: number
}

export type ElectionResults = {
  totalVotes: number
  registeredVoters: number
  turnoutPercent: number
  blockHeight: number
  resultsFinalizedDate: string
  winnerId: string
  candidateResults: CandidateResult[]
}

export type Election = {
  id: string
  title: string
  description: string
  detailsDescription: string
  status: ElectionStatus
  electionCode: string
  startDate: string
  endDate: string
  voterStatus: string
  timeLabel: string
  voteCount?: number
  turnoutPercent?: number
  published?: boolean
  results?: ElectionResults
  candidates: Candidate[]
  organization?: string
  electionType?: ElectionType
  thumbnail: {
    icon: 'landmark' | 'cpu' | 'music' | 'graduation'
    tone: 'navy' | 'teal' | 'indigo' | 'slate'
  }
  /** on-chain election ID (uint256) — required for casting a vote */
  onchainId?: number
}

// ── Session elections (admin create/manage flow) ───────────────────────────────
// Elections created or modified in the current browser session are stored here.
// They overlay/replace chain data until the page is refreshed.

const sessionElections: Election[] = []

export function registerSessionElection(election: Election) {
  const existing = sessionElections.findIndex((item) => item.id === election.id)
  if (existing >= 0) {
    sessionElections[existing] = election
    return
  }

  sessionElections.unshift(election)
}

/**
 * Returns all session elections (created/modified in this browser session).
 * Does NOT include any hardcoded elections — real elections come from the blockchain.
 */
export function getSessionElections(): Election[] {
  return [...sessionElections]
}

export function getAllElections(): Election[] {
  return [...sessionElections]
}

export function getElectionById(id: string | undefined) {
  if (!id) {
    return undefined
  }

  return sessionElections.find((election) => election.id === id)
}

export function getElectionByParam(param: string | undefined) {
  if (!param) {
    return undefined
  }

  return (
    getElectionById(param) ??
    sessionElections.find((election) => election.electionCode === param)
  )
}

export function getVerifyPath(election: Election) {
  return `/verify/${election.electionCode}`
}

export function formatPercent(value: number) {
  return `${value.toFixed(1)}%`
}

export function getCandidateById(election: Election, candidateId: string | null) {
  if (!candidateId) {
    return undefined
  }

  return election.candidates.find((candidate) => candidate.id === candidateId)
}

export function formatVoteCount(count: number) {
  return `${count.toLocaleString('en-US')} votes`
}

export function formatNumber(count: number) {
  return count.toLocaleString('en-US')
}

export function defaultCandidateAchievements(
  department: string,
  position?: string,
) {
  const role = position?.trim() || 'this election'
  return [
    `Standing for ${role}`,
    `Represents ${department}`,
    'Committed to transparent, verifiable elections',
  ]
}

export function getElectionPath(election: Election) {
  if (election.status === 'ended') {
    return `/elections/${election.id}/results`
  }

  return `/elections/${election.id}`
}

export function filterElections(
  items: Election[],
  {
    query,
    status,
    sort,
  }: {
    query: string
    status: 'all' | ElectionStatus
    sort: ElectionSort
  },
) {
  const normalizedQuery = query.trim().toLowerCase()

  const filtered = items.filter((election) => {
    const matchesStatus = status === 'all' || election.status === status
    const matchesQuery =
      normalizedQuery.length === 0 ||
      election.title.toLowerCase().includes(normalizedQuery) ||
      election.description.toLowerCase().includes(normalizedQuery)

    return matchesStatus && matchesQuery
  })

  if (sort === 'title') {
    return [...filtered].sort((a, b) => a.title.localeCompare(b.title))
  }

  if (sort === 'votes') {
    return [...filtered].sort((a, b) => (b.voteCount ?? 0) - (a.voteCount ?? 0))
  }

  return filtered
}
