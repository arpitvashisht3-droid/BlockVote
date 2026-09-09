/**
 * elections.ts — Election type definitions, utility functions, and session-level
 * election registration used by the admin create/manage flow.
 *
 * All hardcoded demo elections have been removed.
 * Elections are loaded from the Sepolia blockchain via src/services/blockchain.ts.
 */

export type ElectionStatus = 'live' | 'upcoming' | 'ended'

export const electionTypes = [
  'Society Election',
  'College Election',
  'University Election',
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
  // Eligibility configuration (set during creation)
  societyName?: string
  collegeName?: string
  collegeId?: string
  universityName?: string
  conductorId?: string
  maxVoters?: number
  // Raw start/end for countdown arithmetic
  startDateRaw?: string
  startTimeRaw?: string
  endDateRaw?: string
  endTimeRaw?: string
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

export function formatElectionDateTime(rawOrDateStr: string | undefined): string {
  if (!rawOrDateStr) return 'TBD'
  // If string already has a formatted time like "Sep 10, 2026, 09:00 AM", return it directly
  if (/\d{1,2}:\d{2}\s*(AM|PM)/i.test(rawOrDateStr)) {
    return rawOrDateStr
  }
  const d = new Date(rawOrDateStr.includes('T') ? rawOrDateStr : rawOrDateStr.replace(',', ''))
  if (isNaN(d.getTime())) return rawOrDateStr

  const day = d.getDate()
  const month = d.toLocaleString('en-US', { month: 'short' })
  const year = d.getFullYear()
  const hours24 = d.getHours()
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const meridiem = hours24 >= 12 ? 'PM' : 'AM'
  const hours = hours24 % 12 || 12
  const hourLabel = String(hours).padStart(2, '0')

  return `${month} ${day}, ${year}, ${hourLabel}:${minutes} ${meridiem}`
}

export function mapBackendElectionToFrontend(item: any): Election {
  const nowMs = Date.now()
  const startMs = item.startDate ? new Date(item.startDate).getTime() : NaN
  const endMs = item.endDate ? new Date(item.endDate).getTime() : NaN

  let computedStatus: ElectionStatus = 'upcoming'
  if (!isNaN(startMs) && startMs > 0 && !isNaN(endMs)) {
    if (nowMs < startMs) {
      computedStatus = 'upcoming'
    } else if (nowMs >= startMs && nowMs <= endMs) {
      computedStatus = 'live'
    } else {
      computedStatus = 'ended'
    }
  } else if (item.status === 'live' || item.status === 'active') {
    computedStatus = 'live'
  } else if (item.status === 'ended' || item.status === 'completed') {
    computedStatus = 'ended'
  } else if (item.status === 'upcoming') {
    computedStatus = 'upcoming'
  }

  const startDateStr = formatElectionDateTime(item.startDate)
  const endDateStr = formatElectionDateTime(item.endDate)

  const candidates: Candidate[] = Array.isArray(item.candidates)
    ? item.candidates.map((c: any, idx: number) => ({
        id: c.id || `cand-${idx}`,
        name: c.name || 'Candidate',
        department: c.department || c.party || 'General',
        about: c.manifesto || c.about || `${c.name || 'Candidate'} is running in this election.`,
        position: c.position || 'Representative',
        achievements: c.achievements || defaultCandidateAchievements(c.department || c.party || 'General', c.position),
        onchainId: c.onchainId,
      }))
    : []

  return {
    id: item.id,
    title: item.title || 'Untitled Election',
    description: item.description || '',
    detailsDescription: item.description || '',
    status: computedStatus,
    electionCode: item.electionCode || item.id,
    startDate: startDateStr,
    endDate: endDateStr,
    startDateRaw: item.startDate || new Date().toISOString(),
    endDateRaw: item.endDate || new Date().toISOString(),
    voterStatus:
      computedStatus === 'live'
        ? 'Eligible to vote'
        : computedStatus === 'upcoming'
          ? 'Voting has not started'
          : 'Voting closed',
    timeLabel:
      computedStatus === 'live'
        ? `Ends ${endDateStr}`
        : computedStatus === 'upcoming'
          ? `Starts ${startDateStr}`
          : `Ended on ${endDateStr}`,
    candidates,
    organization: item.organization || item.societyName || item.collegeName || item.universityName || 'BlockVote Platform',
    electionType: item.type || item.electionType || 'College Election',
    societyName: item.societyName,
    collegeName: item.collegeName,
    collegeId: item.collegeId,
    universityName: item.universityName,
    conductorId: item.conductorId,
    maxVoters: item.maxVoters ? Number(item.maxVoters) : undefined,
    published: true,
    thumbnail: item.thumbnail || { icon: 'landmark', tone: 'navy' },
  }
}

export async function fetchBackendElections(conductorOnly = false): Promise<Election[]> {
  try {
    const token = localStorage.getItem('blockvote_token') || localStorage.getItem('blockvote_auth_token')
    const headers: Record<string, string> = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const queryParam = conductorOnly ? '?conductorOnly=true' : ''
    const apiUrl = typeof window !== 'undefined' && window.location.port === '5173'
      ? `/api/elections${queryParam}`
      : `http://localhost:3000/api/elections${queryParam}`

    const res = await fetch(apiUrl, { headers })
    if (res.ok) {
      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        const fetched: Election[] = json.data.map(mapBackendElectionToFrontend)
        for (const elec of fetched) {
          registerSessionElection(elec)
        }
      }
    }
  } catch (err) {
    console.error('Failed to fetch elections from backend REST API:', err)
  }
  return getAllElections()
}

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

export function getElectionPath(election: Election, basePath = '/dashboard/elections') {
  if (election.status === 'ended') {
    return `${basePath}/${election.id}/results`
  }

  return `${basePath}/${election.id}`
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
