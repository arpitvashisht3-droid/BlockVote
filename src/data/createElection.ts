import {
  defaultCandidateAchievements,
  registerSessionElection,
  type Candidate,
  type Election,
  type ElectionStatus,
  type ElectionType,
} from './elections'
import {
  defaultSettings,
  visibilityOptions,
  votingMethods,
  type ElectionVisibility,
  type VotingMethod,
  type VotingSettings,
} from './votingSettings'
import { seedElectionManagement } from './manageElection'

export {
  electionTypes,
  type ElectionType,
} from './elections'

export {
  defaultSettings,
  visibilityOptions,
  votingMethods,
  type ElectionVisibility,
  type VotingMethod,
  type VotingSettings,
}

export const createElectionSteps = [
  { id: 1, label: 'Election Details', shortLabel: 'Details' },
  { id: 2, label: 'Candidates', shortLabel: 'Candidates' },
  { id: 3, label: 'Voting Settings', shortLabel: 'Settings' },
  { id: 4, label: 'Review & Publish', shortLabel: 'Review' },
] as const

// Generate a unique election code for each new draft
function generateElectionCode(): string {
  const now = new Date()
  const year = now.getFullYear()
  const seq = Math.floor(Math.random() * 900) + 100
  return `BLC-${year}-${seq}`
}

function generateSlug(code: string): string {
  return code.toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

export type DraftCandidate = {
  id: string
  name: string
  department: string
  position: string
  about: string
}

export type ElectionDetailsFields = {
  name: string
  description: string
  type: ElectionType
  startDate: string
  startTime: string
  endDate: string
  endTime: string
  organization: string
  electionCode: string
  slug: string
}

export type CreateElectionDraft = {
  details: ElectionDetailsFields
  candidates: DraftCandidate[]
  settings: VotingSettings
}

export type DetailsErrors = Partial<
  Record<
    'name' | 'description' | 'startDate' | 'startTime' | 'endDate' | 'endTime',
    string
  >
>

export type CandidateErrors = Partial<
  Record<'name' | 'department' | 'position' | 'about', string>
>

export const defaultDetails: ElectionDetailsFields = {
  name: '',
  description: '',
  type: 'Student Election',
  startDate: '',
  startTime: '09:00',
  endDate: '',
  endTime: '21:00',
  organization: '',
  electionCode: '',
  slug: '',
}

export const defaultCandidates: DraftCandidate[] = []

export function createInitialDraft(): CreateElectionDraft {
  const code = generateElectionCode()
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const nextWeek = new Date(today)
  nextWeek.setDate(nextWeek.getDate() + 7)

  const toDateStr = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

  return {
    details: {
      name: '',
      description: '',
      type: 'Student Election',
      startDate: toDateStr(tomorrow),
      startTime: '09:00',
      endDate: toDateStr(nextWeek),
      endTime: '21:00',
      organization: '',
      electionCode: code,
      slug: generateSlug(code),
    },
    // No pre-filled candidates — admins enter real candidates
    candidates: [],
    settings: { ...defaultSettings },
  }
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function createCandidateId(name: string) {
  const base = slugify(name) || 'candidate'
  return `${base}-${Math.random().toString(36).slice(2, 7)}`
}

export function parseElectionDate(date: string, time: string) {
  if (!date || !time) {
    return null
  }

  const parsed = new Date(`${date}T${time}`)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function validateDetails(details: ElectionDetailsFields): DetailsErrors {
  const errors: DetailsErrors = {}

  if (!details.name.trim()) {
    errors.name = 'Election name is required.'
  }

  if (!details.description.trim()) {
    errors.description = 'A description is required.'
  }

  if (!details.startDate) {
    errors.startDate = 'Start date is required.'
  }

  if (!details.startTime) {
    errors.startTime = 'Start time is required.'
  }

  if (!details.endDate) {
    errors.endDate = 'End date is required.'
  }

  if (!details.endTime) {
    errors.endTime = 'End time is required.'
  }

  const start = parseElectionDate(details.startDate, details.startTime)
  const end = parseElectionDate(details.endDate, details.endTime)

  if (start && end && end <= start) {
    errors.endDate = 'End must be after the start date and time.'
    errors.endTime = 'End must be after the start date and time.'
  }

  return errors
}

export function detailsAreValid(details: ElectionDetailsFields) {
  return Object.keys(validateDetails(details)).length === 0
}

export function validateCandidate(
  candidate: {
    name: string
    department: string
    position?: string
    about?: string
  },
  options: { strict?: boolean } = {},
): CandidateErrors {
  const errors: CandidateErrors = {}

  if (!candidate.name.trim()) {
    errors.name = 'Candidate name is required.'
  }

  if (!candidate.department.trim()) {
    errors.department = 'Department or organization is required.'
  }

  if (options.strict && !candidate.position?.trim()) {
    errors.position = 'Position is required.'
  }

  if (options.strict && (candidate.about?.trim().length ?? 0) < 40) {
    errors.about = 'Biography should be at least 40 characters.'
  }

  return errors
}

export function candidateIsValid(
  candidate: {
    name: string
    department: string
    position?: string
    about?: string
  },
  options: { strict?: boolean } = {},
) {
  return Object.keys(validateCandidate(candidate, options)).length === 0
}

export function formatDateTimeLabel(date: string, time: string) {
  const parsed = parseElectionDate(date, time)
  if (!parsed) {
    return `${date} ${time}`.trim()
  }

  const day = parsed.getDate()
  const month = parsed.toLocaleString('en-GB', { month: 'short' })
  const year = parsed.getFullYear()
  const minutes = String(parsed.getMinutes()).padStart(2, '0')
  const hours24 = parsed.getHours()
  const meridiem = hours24 >= 12 ? 'PM' : 'AM'
  const hours = hours24 % 12 || 12
  const hourLabel = String(hours).padStart(2, '0')

  return `${day} ${month} ${year}, ${hourLabel}:${minutes} ${meridiem}`
}

export function booleanLabel(value: boolean) {
  return value ? 'On' : 'Off'
}

function getStatus(details: ElectionDetailsFields): ElectionStatus {
  const start = parseElectionDate(details.startDate, details.startTime)
  const end = parseElectionDate(details.endDate, details.endTime)
  const now = new Date()

  if (start && now < start) {
    return 'upcoming'
  }

  if (end && now > end) {
    return 'ended'
  }

  return 'live'
}

function toCandidate(candidate: DraftCandidate): Candidate {
  const position = candidate.position.trim()

  return {
    id: candidate.id,
    name: candidate.name.trim(),
    department: candidate.department.trim(),
    position: position || undefined,
    about:
      candidate.about.trim() ||
      `${candidate.name.trim()} is standing${position ? ` for ${position}` : ''} in this election.`,
    achievements: defaultCandidateAchievements(
      candidate.department.trim(),
      position,
    ),
  }
}

export function draftToElection(draft: CreateElectionDraft): Election {
  const status = getStatus(draft.details)
  const startLabel = formatDateTimeLabel(
    draft.details.startDate,
    draft.details.startTime,
  )
  const endLabel = formatDateTimeLabel(
    draft.details.endDate,
    draft.details.endTime,
  )
  const title = draft.details.name.trim()
  const description = draft.details.description.trim()

  return {
    id: draft.details.slug,
    title,
    description,
    detailsDescription: description,
    status,
    electionCode: draft.details.electionCode,
    startDate: startLabel,
    endDate: endLabel,
    voterStatus:
      status === 'live'
        ? 'Eligible to vote'
        : status === 'upcoming'
          ? 'Voting has not started'
          : 'Voting closed',
    timeLabel:
      status === 'live'
        ? `Ends ${endLabel}`
        : status === 'upcoming'
          ? `Starts ${startLabel}`
          : `Ended on ${endLabel}`,
    candidates: draft.candidates.map(toCandidate),
    thumbnail: { icon: 'landmark', tone: 'navy' },
    organization: draft.details.organization.trim() || undefined,
    electionType: draft.details.type,
    published: true,
  }
}

export function publishDraftElection(draft: CreateElectionDraft) {
  const election = draftToElection(draft)
  registerSessionElection(election)
  seedElectionManagement(election, {
    organization: draft.details.organization.trim() || 'Not specified',
    settings: { ...draft.settings },
  })
  return election
}
