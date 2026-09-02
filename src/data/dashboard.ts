import { CalendarClock, CheckCircle2, ShieldCheck, Vote } from 'lucide-react'
import { getElectionById, type Election } from './elections'

export type DashboardStat = {
  label: string
  value: string
  detail: string
  icon: 'vote' | 'check' | 'calendar' | 'shield'
}

export type RecentVote = {
  id: string
  electionTitle: string
  candidateName: string
  date: string
  transactionHash: string
  electionId?: string
}

export type UpcomingPreview = {
  electionId: string
  startLabel: string
  candidateCount: number
}

export const voterProfile = {
  name: 'Parth Sharma',
  firstName: 'Parth',
  role: 'Voter',
  status: 'Eligible to Vote',
  voterId: 'VTR-84291',
  wallet: '0x91c...8a21',
}

export const dashboardStats: DashboardStat[] = [
  {
    label: 'Active Elections',
    value: '3',
    detail: 'Open for your ballot',
    icon: 'vote',
  },
  {
    label: 'Votes Cast',
    value: '7',
    detail: 'Recorded on-chain',
    icon: 'check',
  },
  {
    label: 'Upcoming Elections',
    value: '2',
    detail: 'You are eligible',
    icon: 'calendar',
  },
  {
    label: 'Verified Votes',
    value: '7',
    detail: 'Integrity confirmed',
    icon: 'shield',
  },
]

export const dashboardStatIcons = {
  vote: Vote,
  check: CheckCircle2,
  calendar: CalendarClock,
  shield: ShieldCheck,
} as const

export const recentVotes: RecentVote[] = [
  {
    id: 'vote-1',
    electionId: 'student-council-2024',
    electionTitle: 'Student Council Election 2024',
    candidateName: 'Rahul Sharma',
    date: '25 May 2024',
    transactionHash: '0x7a9c4e21b8d03f91c4b8f',
  },
  {
    id: 'vote-2',
    electionTitle: 'Tech Innovation Committee',
    candidateName: 'Aman Verma',
    date: '18 May 2024',
    transactionHash: '0x31fe90ab62c17d4482ac',
  },
]

export const upcomingPreviews: UpcomingPreview[] = [
  {
    electionId: 'tech-club-president',
    startLabel: 'Starts 14 Jun 2024',
    candidateCount: 3,
  },
  {
    electionId: 'academic-council',
    startLabel: 'Starts 20 Jun 2024',
    candidateCount: 5,
  },
]

export const verificationSummary = {
  verifiedVotes: 7,
  lastVerified: '25 May 2024',
  status: 'All votes verified',
}

export function getActiveDashboardElections(): Election[] {
  const featured = [
    getElectionById('student-council-2024'),
    getElectionById('tech-club-president'),
    getElectionById('cultural-fest-committee'),
  ]

  return featured.filter((election): election is Election => election != null)
}

export function getUpcomingPreviewElections() {
  return upcomingPreviews.flatMap((item) => {
    const election = getElectionById(item.electionId)
    return election ? [{ election, ...item }] : []
  })
}
