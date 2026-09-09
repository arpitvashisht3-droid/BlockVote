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
import { getApiBaseUrl } from './apiConfig'

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
  // Type-specific eligibility fields
  societyName: string
  collegeName: string
  collegeId: string
  universityName: string
  secretCode: string  // entered by conductor, hashed on backend — never stored plaintext in DB
  maxVoters: string   // string input, parsed to number (empty means unlimited)
}

export type CreateElectionDraft = {
  details: ElectionDetailsFields
  candidates: DraftCandidate[]
  settings: VotingSettings
}

export type DetailsErrors = Partial<
  Record<
    | 'name'
    | 'description'
    | 'startDate'
    | 'startTime'
    | 'endDate'
    | 'endTime'
    | 'secretCode'
    | 'societyName'
    | 'collegeName'
    | 'collegeId'
    | 'universityName'
    | 'maxVoters',
    string
  >
>

export type CandidateErrors = Partial<
  Record<'name' | 'department' | 'position' | 'about', string>
>

export const defaultDetails: ElectionDetailsFields = {
  name: '',
  description: '',
  type: 'Society Election',
  startDate: '',
  startTime: '09:00',
  endDate: '',
  endTime: '21:00',
  organization: '',
  electionCode: '',
  slug: '',
  societyName: '',
  collegeName: '',
  collegeId: '',
  universityName: '',
  secretCode: '',
  maxVoters: '',
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
      type: 'Society Election',
      startDate: toDateStr(tomorrow),
      startTime: '09:00',
      endDate: toDateStr(nextWeek),
      endTime: '21:00',
      organization: '',
      electionCode: code,
      slug: generateSlug(code),
      societyName: '',
      collegeName: '',
      collegeId: '',
      universityName: '',
      secretCode: '',
      maxVoters: '',
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

  // Type-specific validation
  if (!details.secretCode.trim()) {
    errors.secretCode = 'A secret code is required for eligibility verification.'
  }

  if (details.type === 'Society Election' && !details.societyName.trim()) {
    errors.societyName = 'Society name is required.'
  }

  if (details.type === 'College Election') {
    if (!details.collegeName.trim()) errors.collegeName = 'College name is required.'
    if (!details.collegeId.trim()) errors.collegeId = 'College ID/identifier is required.'
  }

  if (details.type === 'University Election' && !details.universityName.trim()) {
    errors.universityName = 'University name is required.'
  }

  if (details.maxVoters && details.maxVoters.trim()) {
    const num = Number(details.maxVoters)
    if (isNaN(num) || num <= 0 || !Number.isInteger(num)) {
      errors.maxVoters = 'Voter cap must be a positive whole number.'
    }
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
  const month = parsed.toLocaleString('en-US', { month: 'short' })
  const year = parsed.getFullYear()
  const minutes = String(parsed.getMinutes()).padStart(2, '0')
  const hours24 = parsed.getHours()
  const meridiem = hours24 >= 12 ? 'PM' : 'AM'
  const hours = hours24 % 12 || 12
  const hourLabel = String(hours).padStart(2, '0')

  return `${month} ${day}, ${year}, ${hourLabel}:${minutes} ${meridiem}`
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

  const maxVotersNum = draft.details.maxVoters ? Number(draft.details.maxVoters) : undefined
  const startObj = parseElectionDate(draft.details.startDate, draft.details.startTime)
  const endObj = parseElectionDate(draft.details.endDate, draft.details.endTime)

  const startDateRaw = startObj ? startObj.toISOString() : `${draft.details.startDate}T${draft.details.startTime}:00`
  const endDateRaw = endObj ? endObj.toISOString() : `${draft.details.endDate}T${draft.details.endTime}:00`

  return {
    id: draft.details.slug,
    title,
    description,
    detailsDescription: description,
    status,
    electionCode: draft.details.electionCode,
    startDate: startLabel,
    endDate: endLabel,
    startDateRaw,
    endDateRaw,
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
    societyName: draft.details.societyName.trim() || undefined,
    collegeName: draft.details.collegeName.trim() || undefined,
    collegeId: draft.details.collegeId.trim() || undefined,
    universityName: draft.details.universityName.trim() || undefined,
    maxVoters: maxVotersNum && !isNaN(maxVotersNum) ? maxVotersNum : undefined,
    published: true,
  }
}

export async function publishDraftElection(draft: CreateElectionDraft): Promise<Election> {
  const election = draftToElection(draft)
  registerSessionElection(election)
  seedElectionManagement(election, {
    organization: draft.details.organization.trim() || 'Not specified',
    settings: { ...draft.settings },
  })

  // Post to backend REST API for persistent JSON database storage
  const token = localStorage.getItem('blockvote_token') || localStorage.getItem('blockvote_auth_token')
  const maxVotersNum = draft.details.maxVoters ? Number(draft.details.maxVoters) : undefined

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const apiUrl = `${getApiBaseUrl()}/elections`

  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        id: election.id,
        title: election.title,
        description: election.description,
        type: election.electionType,
        startDate: election.startDateRaw,
        endDate: election.endDateRaw,
        status: election.status,
        societyName: draft.details.societyName,
        collegeName: draft.details.collegeName,
        collegeId: draft.details.collegeId,
        universityName: draft.details.universityName,
        secretCode: draft.details.secretCode, // server hashes with bcrypt
        maxVoters: maxVotersNum && !isNaN(maxVotersNum) ? maxVotersNum : undefined,
        candidates: election.candidates.map((cand) => ({
          name: cand.name,
          department: cand.department,
          position: cand.position,
          manifesto: cand.about,
        })),
      }),
    })

    const resData = await res.json()
    if (!res.ok || !resData.success) {
      throw new Error(resData.message || 'Failed to save election to backend JSON database')
    }

    if (resData.data?.id) {
      election.id = resData.data.id
      registerSessionElection(election)
    }
  } catch (err: any) {
    console.error('Database write error during publishDraftElection:', err)
    // If backend is down or failed, throw so success state is NOT shown falsely
    throw new Error(err?.message || 'Election could not be saved to backend database.')
  }

  return election
}
