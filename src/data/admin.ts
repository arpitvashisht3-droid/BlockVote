import { getElectionById, type Election, type ElectionStatus } from './elections'

export const adminProfile = {
  name: 'Admin',
  role: 'Election Administrator',
}

export type AdminStat = {
  label: string
  value: string
  detail: string
  trend: string
  trendUp: boolean
}

export const adminStats: AdminStat[] = [
  {
    label: 'Total Elections',
    value: '24',
    detail: 'All-time catalog',
    trend: '+12%',
    trendUp: true,
  },
  {
    label: 'Active Elections',
    value: '6',
    detail: 'Currently open',
    trend: '+2 this week',
    trendUp: true,
  },
  {
    label: 'Total Voters',
    value: '18,542',
    detail: 'Registered on BlockVote',
    trend: '+4.8%',
    trendUp: true,
  },
  {
    label: 'Total Votes',
    value: '12,847',
    detail: 'Recorded on-chain',
    trend: '+18.2%',
    trendUp: true,
  },
]

export type ActivityPoint = {
  day: string
  votes: number
}

export const votingActivity: ActivityPoint[] = [
  { day: 'Mon', votes: 1240 },
  { day: 'Tue', votes: 1842 },
  { day: 'Wed', votes: 2104 },
  { day: 'Thu', votes: 1765 },
  { day: 'Fri', votes: 2430 },
  { day: 'Sat', votes: 2981 },
  { day: 'Sun', votes: 3204 },
]

export type ManagedElection = {
  electionId: string
  status: ElectionStatus
  votes: number
  registeredVoters: number
  turnoutPercent: number
  endsLabel: string
}

export const managedElections: ManagedElection[] = [
  {
    electionId: 'student-council-2024',
    status: 'live',
    votes: 1247,
    registeredVoters: 7842,
    turnoutPercent: 67,
    endsLabel: 'Ends 25 May 2024',
  },
  {
    electionId: 'tech-club-president',
    status: 'live',
    votes: 842,
    registeredVoters: 2140,
    turnoutPercent: 39,
    endsLabel: 'Ends 28 May 2024',
  },
]

export const electionStatusCounts = {
  live: 6,
  upcoming: 8,
  completed: 10,
}

export type AdminActivityItem = {
  id: string
  title: string
  detail: string
  time: string
  type: 'created' | 'live' | 'finalized' | 'milestone'
}

export const recentAdminActivity: AdminActivityItem[] = [
  {
    id: 'a1',
    title: 'New election created',
    detail: 'Academic Council Election',
    time: '2 hours ago',
    type: 'created',
  },
  {
    id: 'a2',
    title: 'Election went live',
    detail: 'Tech Club President Election',
    time: '5 hours ago',
    type: 'live',
  },
  {
    id: 'a3',
    title: 'Results finalized',
    detail: 'Cultural Fest Committee',
    time: 'Yesterday',
    type: 'finalized',
  },
  {
    id: 'a4',
    title: '1,000 votes reached',
    detail: 'Student Council Election',
    time: 'Yesterday',
    type: 'milestone',
  },
]

export function getManagedElections() {
  return managedElections.flatMap((item) => {
    const election = getElectionById(item.electionId)
    return election ? [{ election, ...item }] : []
  })
}

export function getAdminElection(id: string | undefined): Election | undefined {
  return getElectionById(id)
}
