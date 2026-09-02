import {
  formatPercent,
  getVerifyPath,
  type Candidate,
  type Election,
} from './elections'
import {
  getActiveCandidates,
  getCandidatePosition,
  getRegisteredVoters,
  getTurnoutPercent,
  getVotesCast,
  hasBlockchainRecord,
  type ElectionManagement,
  type ManageActivityItem,
} from './manageElection'
import {
  getVerificationByCode,
  truncateHash,
} from './verification'

export const DEFAULT_RESULTS_ELECTION_ID = 'student-council-2024'

export type ResultRowStatus =
  | 'Leading'
  | 'Winner'
  | 'Live'
  | 'Final'
  | 'Active'
  | 'Paused'
  | 'No votes yet'

export type CandidateResultRow = {
  candidate: Candidate
  position: string
  votes: number
  percentage: number
  status: ResultRowStatus
  isLeader: boolean
}

export type ResultActivityItem = {
  id: string
  title: string
  time: string
  type: ManageActivityItem['type'] | 'lead' | 'published'
}

export type ResultsSummaryStats = {
  registeredVoters: number
  votesCast: number
  turnoutPercent: number
  candidateCount: number
  remaining: number
}

export function formatActivityHour(hour: string) {
  const match = hour.trim().match(/^(\d{1,2})\s+(AM|PM)$/i)
  if (!match) {
    return hour
  }

  return `${match[1]}:00 ${match[2].toUpperCase()}`
}

export function isResultsFinalized(state: ElectionManagement) {
  if (typeof state.resultsFinalized === 'boolean') {
    return state.resultsFinalized
  }

  return state.election.status === 'ended' && Boolean(state.election.results)
}

export function isResultsPublished(election: Election) {
  return Boolean(election.published)
}

export function finalizeElectionResults(election: Election): Election {
  const nowLabel = 'Just now'
  if (election.results) {
    return {
      ...election,
      results: {
        ...election.results,
        resultsFinalizedDate: nowLabel,
      },
    }
  }

  const rows = getCandidateResultRows(election)
  const totalVotes = rows.reduce((sum, row) => sum + row.votes, 0)
  const leader = rows[0]

  return {
    ...election,
    results: {
      totalVotes,
      registeredVoters: getRegisteredVoters(election),
      turnoutPercent: getTurnoutPercent(election),
      blockHeight: 0,
      resultsFinalizedDate: nowLabel,
      winnerId: leader?.candidate.id ?? '',
      candidateResults: rows.map((row) => ({
        candidateId: row.candidate.id,
        votes: row.votes,
        percentage: row.percentage,
      })),
    },
  }
}

export function getResultsSummary(election: Election): ResultsSummaryStats {
  const upcoming = election.status === 'upcoming'
  const registeredVoters = getRegisteredVoters(election)
  const votesCast = upcoming ? 0 : getVotesCast(election)
  const turnoutPercent = upcoming ? 0 : getTurnoutPercent(election)
  const candidateCount = getActiveCandidates(election.candidates).length
  const remaining = Math.max(registeredVoters - votesCast, 0)

  return {
    registeredVoters,
    votesCast,
    turnoutPercent,
    candidateCount,
    remaining,
  }
}

export function getCandidateResultRows(
  election: Election,
  paused = false,
): CandidateResultRow[] {
  const upcoming = election.status === 'upcoming'
  const ended = election.status === 'ended'
  const candidates = election.candidates
  const tallies = new Map(
    (election.results?.candidateResults ?? []).map((item) => [
      item.candidateId,
      item,
    ]),
  )
  const totalFromTallies = [...tallies.values()].reduce(
    (sum, item) => sum + item.votes,
    0,
  )

  const rows = candidates.map((candidate) => {
    const tally = tallies.get(candidate.id)
    const votes = upcoming ? 0 : (tally?.votes ?? 0)
    const percentage =
      tally?.percentage ??
      (totalFromTallies > 0 ? (votes / totalFromTallies) * 100 : 0)

    return {
      candidate,
      position: getCandidatePosition(candidate),
      votes,
      percentage,
      status: 'Active' as ResultRowStatus,
      isLeader: false,
    }
  })

  const leaderVotes = Math.max(0, ...rows.map((row) => row.votes))
  const hasVotes = leaderVotes > 0

  return rows
    .map((row) => {
      const isLeader = hasVotes && row.votes === leaderVotes
      let status: ResultRowStatus

      if (upcoming) {
        status = 'No votes yet'
      } else if (isLeader && ended) {
        status = 'Winner'
      } else if (isLeader) {
        status = 'Leading'
      } else if (ended) {
        status = 'Final'
      } else if (paused) {
        status = 'Paused'
      } else {
        status = 'Active'
      }

      return { ...row, isLeader, status }
    })
    .sort((a, b) => b.votes - a.votes || a.candidate.name.localeCompare(b.candidate.name))
}

export function getLeadingRow(rows: CandidateResultRow[]) {
  return rows.find((row) => row.isLeader)
}

export function getResultActivity(
  state: ElectionManagement,
): ResultActivityItem[] {
  const { election, paused, activityLog } = state
  const finalized = isResultsFinalized(state)
  const items: ResultActivityItem[] = []

  if (election.published && (finalized || election.status === 'ended')) {
    const publishedLog = activityLog.find((item) =>
      item.title.toLowerCase().includes('published'),
    )
    items.push({
      id: publishedLog?.id ?? 'published',
      title: 'Results published',
      time: publishedLog?.time ?? 'Yesterday',
      type: 'published',
    })
  }

  if (finalized) {
    items.push({
      id: 'finalized',
      title: 'Results finalized',
      time: election.results?.resultsFinalizedDate ?? 'Yesterday',
      type: 'ended',
    })
  }

  if (election.status === 'ended') {
    items.push({
      id: 'closed',
      title: 'Voting closed',
      time: election.endDate.split(',')[0]?.trim() ?? 'Yesterday',
      type: 'ended',
    })
  }

  if (paused) {
    items.push({
      id: 'paused',
      title: 'Voting paused',
      time: 'Just now',
      type: 'paused',
    })
  }

  if (
    (election.status === 'live' || election.status === 'ended') &&
    (election.results?.candidateResults.length ?? 0) > 1
  ) {
    items.push({
      id: 'lead',
      title: 'Leading candidate changed',
      time: '5 hours ago',
      type: 'lead',
    })
  }

  for (const item of activityLog) {
    if (item.type === 'milestone' || item.type === 'opened') {
      items.push({
        id: item.id,
        title: item.title,
        time: item.time,
        type: item.type,
      })
    }
  }

  const seen = new Set<string>()
  return items.filter((item) => {
    const key = item.title
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}

export function getVerificationDetails(election: Election) {
  const record = getVerificationByCode(election.electionCode)
  const available = hasBlockchainRecord(election)
  const merkleRoot = record?.record.merkleRoot
  const blockHeight =
    election.results?.blockHeight ?? record?.transactions[0]?.blockNumber
  const transactions =
    record?.record.transactionCount ?? election.results?.totalVotes

  return {
    available,
    verifyPath: getVerifyPath(election),
    electionCode: election.electionCode,
    merkleRoot,
    merkleLabel: merkleRoot ? truncateHash(merkleRoot, 10, 8) : undefined,
    blockHeight,
    transactions,
  }
}

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`
  }
  return value
}

export function buildResultsCsv(rows: CandidateResultRow[]) {
  const header = [
    'Candidate',
    'Position',
    'Department',
    'Votes',
    'Percentage',
    'Status',
  ]
  const body = rows.map((row) =>
    [
      csvEscape(row.candidate.name),
      csvEscape(row.position),
      csvEscape(row.candidate.department),
      String(row.votes),
      formatPercent(row.percentage),
      csvEscape(row.status),
    ].join(','),
  )

  return [header.join(','), ...body].join('\n')
}

export function downloadResultsCsv(election: Election, rows: CandidateResultRow[]) {
  const csv = buildResultsCsv(rows)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `blockvote-results-${election.id}.csv`
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
