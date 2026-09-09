/**
 * dashboard.ts — Type definitions for the voter dashboard.
 *
 * All hardcoded demo data (voterProfile, dashboardStats, recentVotes,
 * upcomingPreviews, verificationSummary) has been removed.
 * Voter dashboard components now show empty/loading states or derive data
 * from blockchain-fetched elections.
 */

import { CalendarClock, CheckCircle2, ShieldCheck, Vote } from 'lucide-react'

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

export const dashboardStatIcons = {
  vote: Vote,
  check: CheckCircle2,
  calendar: CalendarClock,
  shield: ShieldCheck,
} as const
