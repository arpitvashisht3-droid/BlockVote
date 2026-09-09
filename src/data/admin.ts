/**
 * admin.ts — Type definitions for admin dashboard.
 *
 * All hardcoded demo data removed:
 *   - adminStats (24 elections, 6 active, 18,542 voters, 12,847 votes)
 *   - votingActivity (fake 7-day Mon–Sun chart data)
 *   - managedElections (fake student-council-2024, tech-club-president entries)
 *   - electionStatusCounts (fake 6/8/10)
 *   - recentAdminActivity (4 fake activity items)
 *
 * Stats are now computed from the real election list (listAdminElections).
 */

import type { Election, ElectionStatus } from './elections'

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

export type ActivityPoint = {
  day: string
  votes: number
}

export type ManagedElection = {
  electionId: string
  status: ElectionStatus
  votes: number
  registeredVoters: number
  turnoutPercent: number
  endsLabel: string
}

export type AdminActivityItem = {
  id: string
  title: string
  detail: string
  time: string
  type: 'created' | 'live' | 'finalized' | 'milestone'
}

/**
 * Builds admin stat cards from real election data.
 * All numbers are derived — nothing hardcoded.
 */
export function buildAdminStats(elections: Election[]): AdminStat[] {
  const live = elections.filter((e) => e.status === 'live').length
  const upcoming = elections.filter((e) => e.status === 'upcoming').length
  const ended = elections.filter((e) => e.status === 'ended').length
  const total = elections.length

  return [
    {
      label: 'Total Elections',
      value: String(total),
      detail: 'All-time catalog',
      trend: '',
      trendUp: true,
    },
    {
      label: 'Active Elections',
      value: String(live),
      detail: 'Currently open',
      trend: '',
      trendUp: true,
    },
    {
      label: 'Upcoming Elections',
      value: String(upcoming),
      detail: 'Scheduled',
      trend: '',
      trendUp: true,
    },
    {
      label: 'Completed Elections',
      value: String(ended),
      detail: 'Finalized on-chain',
      trend: '',
      trendUp: false,
    },
  ]
}

/**
 * Builds election status counts from real election data.
 */
export function buildElectionStatusCounts(elections: Election[]) {
  return {
    live: elections.filter((e) => e.status === 'live').length,
    upcoming: elections.filter((e) => e.status === 'upcoming').length,
    completed: elections.filter((e) => e.status === 'ended').length,
  }
}
