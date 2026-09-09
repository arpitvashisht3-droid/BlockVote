// admin.ts no longer exports managedElections (demo data removed)
import {
  defaultCandidateAchievements,
  getAllElections,
  getElectionByParam,
  registerSessionElection,
  type Candidate,
  type Election,
  type ElectionStatus,
  type ElectionType,
} from './elections'
import { getVerificationByCode } from './verification'
import {
  defaultSettings,
  type VotingSettings,
} from './votingSettings'

export type HourlyPoint = {
  hour: string
  votes: number
}

export type ManageActivityItem = {
  id: string
  title: string
  time: string
  type: 'created' | 'opened' | 'milestone' | 'paused' | 'ended' | 'updated'
}

export type ControlAction =
  | 'pause'
  | 'resume'
  | 'end'
  | 'publish'
  | 'start'
  | 'archive'

export type ElectionManagement = {
  election: Election
  organization: string
  paused: boolean
  archived: boolean
  resultsFinalized?: boolean
  settings: VotingSettings
  hourlyActivity: HourlyPoint[]
  activityLog: ManageActivityItem[]
}

// Hourly activity starts all-zeros — real time-series data requires a backend
// indexing service that is not yet implemented.
const emptyHourly: HourlyPoint[] = [
  { hour: '8 AM', votes: 0 },
  { hour: '10 AM', votes: 0 },
  { hour: '12 PM', votes: 0 },
  { hour: '2 PM', votes: 0 },
  { hour: '4 PM', votes: 0 },
  { hour: '6 PM', votes: 0 },
  { hour: '8 PM', votes: 0 },
]

const managementStore = new Map<string, ElectionManagement>()

function cloneManagement(state: ElectionManagement): ElectionManagement {
  return structuredClone(state)
}

function cloneElection(election: Election): Election {
  return structuredClone(election)
}

function defaultActivity(election: Election): ManageActivityItem[] {
  // Only include verifiable facts — no fabricated timestamps or milestones.
  // Real activity (votes reached, pauses, etc.) will be appended dynamically
  // by the admin manage/create flow.
  return [
    { id: 'created', title: 'Election created', time: 'Recently', type: 'created' },
    ...(election.status === 'live' || election.status === 'ended'
      ? [{ id: 'opened', title: 'Voting opened', time: election.startDate, type: 'opened' as const }]
      : []),
    ...(election.status === 'ended'
      ? [{ id: 'ended', title: 'Voting closed', time: election.endDate, type: 'ended' as const }]
      : []),
  ]
}

function buildManagement(
  election: Election,
  extras?: Partial<Pick<ElectionManagement, 'organization' | 'settings'>>,
): ElectionManagement {
  return {
    election: cloneElection(election),
    organization:
      extras?.organization ??
      election.organization ??
      'Not specified',
    paused: false,
    archived: false,
    resultsFinalized: false,
    settings: extras?.settings ? { ...extras.settings } : { ...defaultSettings },
    // Hourly activity is always empty — real time-series data is not available
    // from the current contract ABI. A future backend indexer can populate this.
    hourlyActivity: emptyHourly.map((point) => ({ ...point })),
    activityLog: defaultActivity(election),
  }
}

export function hourlyForStatus(_status: ElectionStatus): HourlyPoint[] {
  // Always return empty hourly data — real time-series requires a backend indexer.
  return emptyHourly.map((point) => ({ ...point }))
}

export function seedElectionManagement(
  election: Election,
  extras?: Partial<Pick<ElectionManagement, 'organization' | 'settings'>>,
) {
  const existing = managementStore.get(election.id)
  if (existing) {
    existing.election = cloneElection(election)
    if (extras?.organization) {
      existing.organization = extras.organization
    }
    if (extras?.settings) {
      existing.settings = { ...extras.settings }
    }
    return
  }

  managementStore.set(election.id, buildManagement(election, extras))
}

export function getElectionManagement(
  id: string | undefined,
): ElectionManagement | undefined {
  if (!id) {
    return undefined
  }

  const stored = managementStore.get(id)
  if (stored) {
    return cloneManagement(stored)
  }

  const election = getElectionByParam(id)
  if (!election) {
    return undefined
  }

  const existingByElection = managementStore.get(election.id)
  if (existingByElection) {
    return cloneManagement(existingByElection)
  }

  const created = buildManagement(election)
  managementStore.set(election.id, created)
  return cloneManagement(created)
}

export function saveElectionManagement(next: ElectionManagement) {
  const stored = cloneManagement(next)
  managementStore.set(next.election.id, stored)
  registerSessionElection(stored.election)
}

export function getRegisteredVoters(election: Election) {
  if (election.results?.registeredVoters) {
    return election.results.registeredVoters
  }

  // Registered voter count is not available from the current contract ABI.
  // Returns 0 until a backend/indexer provides this data.
  return 0
}

export function getVotesCast(election: Election) {
  return election.voteCount ?? 0
}

export function getTurnoutPercent(election: Election) {
  const registered = getRegisteredVoters(election)
  const votes = getVotesCast(election)
  if (registered > 0) {
    return (votes / registered) * 100
  }

  return election.turnoutPercent ?? 0
}

export function getCandidateVotes(election: Election, candidateId: string) {
  return election.results?.candidateResults.find(
    (item) => item.candidateId === candidateId,
  )
}

export function hasBlockchainRecord(election: Election) {
  return Boolean(
    getVerificationByCode(election.electionCode) || election.results?.blockHeight,
  )
}

export function applyElectionStatus(
  election: Election,
  status: ElectionStatus,
): Election {
  return {
    ...election,
    status,
    published: true,
    voterStatus:
      status === 'live'
        ? 'Eligible to vote'
        : status === 'upcoming'
          ? 'Voting has not started'
          : 'Voting closed',
    timeLabel:
      status === 'live'
        ? `Ends ${election.endDate}`
        : status === 'upcoming'
          ? `Starts ${election.startDate}`
          : `Ended on ${election.endDate}`,
  }
}

export function parseDisplayDateTime(value: string) {
  const parsed = new Date(value.replace(',', ''))
  if (Number.isNaN(parsed.getTime())) {
    return null
  }

  const date = `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`
  const time = `${String(parsed.getHours()).padStart(2, '0')}:${String(parsed.getMinutes()).padStart(2, '0')}`
  return { date, time }
}

export function getCandidatePosition(candidate: Candidate) {
  return candidate.position?.trim() || 'Candidate'
}

export function isCandidateActive(candidate: Candidate) {
  return !candidate.removed
}

export function getActiveCandidates(candidates: Candidate[]) {
  return candidates.filter(isCandidateActive)
}

export function toDraftCandidate(candidate: Candidate) {
  return {
    id: candidate.id,
    name: candidate.name,
    department: candidate.department,
    position: candidate.position ?? '',
    about: candidate.about,
  }
}

export function fromDraftCandidate(
  draft: {
    id?: string
    name: string
    department: string
    position: string
    about: string
  },
  previous?: Candidate,
): Candidate {
  const position = draft.position.trim()
  return {
    id: draft.id ?? previous?.id ?? '',
    name: draft.name.trim(),
    department: draft.department.trim(),
    position: position || undefined,
    about:
      draft.about.trim() ||
      previous?.about ||
      `${draft.name.trim()} is standing${position ? ` for ${position}` : ''} in this election.`,
    achievements: previous?.achievements?.length
      ? previous.achievements
      : defaultCandidateAchievements(draft.department.trim(), position),
    removed: previous?.removed,
  }
}

export const controlCopy: Record<
  ControlAction,
  { title: string; message: string; confirm: string; danger: boolean }
> = {
  pause: {
    title: 'Pause Voting?',
    message:
      'Voting will temporarily stop. Voters will not be able to cast votes until voting resumes.',
    confirm: 'Confirm',
    danger: false,
  },
  resume: {
    title: 'Resume Voting?',
    message: 'Voting will open again and eligible voters will be able to cast ballots.',
    confirm: 'Resume Voting',
    danger: false,
  },
  end: {
    title: 'End Election?',
    message: 'Ending the election will permanently stop voting.',
    confirm: 'End Election',
    danger: true,
  },
  publish: {
    title: 'Publish Election?',
    message: 'Published elections can be discovered by voters according to visibility rules.',
    confirm: 'Publish',
    danger: false,
  },
  start: {
    title: 'Start Election?',
    message: 'Starting the election will open voting immediately.',
    confirm: 'Start Election',
    danger: false,
  },
  archive: {
    title: 'Archive Election?',
    message: 'This election will be archived in this admin session and hidden from active work.',
    confirm: 'Archive',
    danger: true,
  },
}

export function duplicateElection(state: ElectionManagement): ElectionManagement {
  const copyId = `${state.election.id}-copy-${Date.now().toString(36)}`
  const copy: Election = {
    ...cloneElection(state.election),
    id: copyId,
    title: `${state.election.title} (Copy)`,
    electionCode: `${state.election.electionCode}-C`,
    status: 'upcoming',
    published: false,
    voteCount: 0,
    results: undefined,
    voterStatus: 'Voting has not started',
    timeLabel: `Starts ${state.election.startDate}`,
  }

  const duplicated: ElectionManagement = {
    ...state,
    election: copy,
    paused: false,
    archived: false,
    resultsFinalized: false,
    hourlyActivity: emptyHourly.map((point) => ({ ...point })),
    activityLog: [
      {
        id: 'created',
        title: 'Election created',
        time: 'Just now',
        type: 'created',
      },
    ],
  }

  managementStore.set(copyId, cloneManagement(duplicated))
  registerSessionElection(copy)
  return duplicated
}

export function listAdminElections() {
  return getAllElections()
    .map((election) => getElectionManagement(election.id))
    .filter((item): item is ElectionManagement => item != null && !item.archived)
}

export function archiveElectionById(id: string) {
  const current = getElectionManagement(id)
  if (!current) {
    return
  }

  saveElectionManagement({
    ...current,
    archived: true,
    activityLog: [
      {
        id: `archived-${Date.now()}`,
        title: 'Election archived',
        time: 'Just now',
        type: 'ended',
      },
      ...current.activityLog,
    ],
  })
}

export function getElectionType(election: Election) {
  return election.electionType ?? 'General Election'
}

export function endDateLabel(value: string) {
  return value.split(',')[0]?.trim() ?? value
}

export function getEndTimestamp(value: string) {
  const parsed = parseDisplayDateTime(value)
  if (!parsed) {
    const fallback = Date.parse(value.replace(',', ''))
    return Number.isNaN(fallback) ? Number.POSITIVE_INFINITY : fallback
  }

  const date = new Date(`${parsed.date}T${parsed.time}`)
  return Number.isNaN(date.getTime()) ? Number.POSITIVE_INFINITY : date.getTime()
}

export type AdminListStatus = 'all' | 'live' | 'upcoming' | 'paused' | 'ended'
export type AdminListSort = 'newest' | 'oldest' | 'votes' | 'ending'

export function summarizeAdminElections(items: ElectionManagement[]) {
  return {
    total: items.length,
    live: items.filter((item) => item.election.status === 'live' && !item.paused)
      .length,
    upcoming: items.filter((item) => item.election.status === 'upcoming').length,
    completed: items.filter((item) => item.election.status === 'ended').length,
  }
}

export function filterAdminElections(
  items: ElectionManagement[],
  {
    query,
    status,
    electionType,
    sort,
  }: {
    query: string
    status: AdminListStatus
    electionType: 'all' | ElectionType
    sort: AdminListSort
  },
) {
  const normalized = query.trim().toLowerCase()

  const filtered = items.filter((item) => {
    const { election, organization, paused } = item
    const type = getElectionType(election)
    const matchesQuery =
      normalized.length === 0 ||
      election.title.toLowerCase().includes(normalized) ||
      election.electionCode.toLowerCase().includes(normalized) ||
      organization.toLowerCase().includes(normalized) ||
      (election.organization?.toLowerCase().includes(normalized) ?? false)

    const matchesType = electionType === 'all' || type === electionType
    const matchesStatus =
      status === 'all' ||
      (status === 'paused' && paused) ||
      (status === 'live' && election.status === 'live' && !paused) ||
      (status === 'upcoming' && election.status === 'upcoming') ||
      (status === 'ended' && election.status === 'ended')

    return matchesQuery && matchesType && matchesStatus
  })

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'votes') {
      return getVotesCast(b.election) - getVotesCast(a.election)
    }

    if (sort === 'ending') {
      return getEndTimestamp(a.election.endDate) - getEndTimestamp(b.election.endDate)
    }

    const startA = getEndTimestamp(a.election.startDate)
    const startB = getEndTimestamp(b.election.startDate)
    return sort === 'oldest' ? startA - startB : startB - startA
  })

  return sorted
}
