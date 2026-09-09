import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Vote } from 'lucide-react'
import { ActiveElectionCard } from '../components/dashboard/ActiveElectionCard'
import { QuickActions } from '../components/dashboard/QuickActions'
import { RecentVotes } from '../components/dashboard/RecentVotes'
import { StatCard } from '../components/dashboard/StatCard'
import { UpcomingElectionCard } from '../components/dashboard/UpcomingElectionCard'
import { VerificationStatusCard } from '../components/dashboard/VerificationStatusCard'
import { VoterStatus } from '../components/dashboard/VoterStatus'
import { useDemoAuth } from '../context/DemoAuthContext'
import { getSessionElections, type Election } from '../data/elections'
import type { DashboardStat } from '../data/dashboard'
import {
  chainElectionToElection,
  fetchElectionsFromChain,
} from '../services/blockchain'

export function VoterDashboardPage() {
  const { user } = useDemoAuth()
  const [elections, setElections] = useState<Election[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const chainData = await fetchElectionsFromChain()
        const mapped = chainData.map(chainElectionToElection)
        const session = getSessionElections()
        const combined = [...session]
        for (const c of mapped) {
          if (!combined.some((e) => e.onchainId === c.onchainId)) {
            combined.push(c)
          }
        }
        if (mounted) setElections(combined)
      } catch (err) {
        console.error('Failed to load elections:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  const activeElections = elections.filter((e) => e.status === 'live')
  const upcomingElections = elections.filter((e) => e.status === 'upcoming')
  const totalVotes = elections.reduce((sum, e) => sum + (e.voteCount ?? 0), 0)

  const stats: DashboardStat[] = [
    {
      label: 'Active Elections',
      value: String(activeElections.length),
      detail: activeElections.length > 0 ? 'Voting currently open' : 'No open ballots',
      icon: 'vote',
    },
    {
      label: 'Total Votes Cast',
      value: String(totalVotes),
      detail: 'Across all elections',
      icon: 'check',
    },
    {
      label: 'Upcoming',
      value: String(upcomingElections.length),
      detail: 'Scheduled soon',
      icon: 'calendar',
    },
    {
      label: 'Network',
      value: 'Sepolia',
      detail: 'Ethereum Testnet',
      icon: 'shield',
    },
  ]

  const displayName = user?.name ? user.name.split(' ')[0] : 'Voter'

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-navy sm:text-3xl">
            Welcome back, {displayName}
          </h2>
          <p className="mt-1 text-sm text-navy-muted sm:text-base">
            Stay updated with your elections and blockchain voting activity.
          </p>
        </div>
        <p className="inline-flex items-center rounded-xl bg-slate-100 px-4 py-3 text-sm font-medium text-navy">
          {activeElections.length > 0
            ? `${activeElections.length} active election${activeElections.length > 1 ? 's' : ''} available`
            : 'No active elections currently'}
        </p>
      </section>

      <section
        aria-label="Dashboard statistics"
        className="grid grid-cols-2 gap-3 lg:grid-cols-4"
      >
        {stats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2" aria-labelledby="active-elections-heading">
          <h2 id="active-elections-heading" className="text-lg font-bold text-navy">
            Active Elections
          </h2>
          <div className="mt-4 flex flex-col gap-3">
            {loading ? (
              <div className="card p-6 text-center text-sm text-navy-muted">
                Loading elections from blockchain...
              </div>
            ) : activeElections.length === 0 ? (
              <div className="card p-8 text-center">
                <Vote className="mx-auto size-8 text-slate-300" aria-hidden="true" />
                <p className="mt-2 text-sm font-medium text-navy">No active elections</p>
                <p className="mt-1 text-xs text-navy-muted">
                  There are no active elections open for voting at this time.
                </p>
              </div>
            ) : (
              activeElections.map((election) => (
                <ActiveElectionCard
                  key={election.id}
                  election={election}
                />
              ))
            )}
          </div>
        </section>

        <div className="flex flex-col gap-6">
          <VoterStatus />
          <VerificationStatusCard />
        </div>
      </div>

      <RecentVotes />

      <section aria-labelledby="upcoming-elections-heading">
        <div className="flex items-center justify-between gap-3">
          <h2 id="upcoming-elections-heading" className="text-lg font-bold text-navy">
            Upcoming Elections
          </h2>
          <Link
            to="/elections"
            className="text-sm font-semibold text-accent hover:text-accent-hover"
          >
            View All Elections
          </Link>
        </div>
        <div className="mt-4 flex flex-col gap-3">
          {upcomingElections.length === 0 ? (
            <div className="card p-6 text-center text-sm text-navy-muted">
              No upcoming elections scheduled.
            </div>
          ) : (
            upcomingElections.map((election) => (
              <UpcomingElectionCard
                key={election.id}
                election={election}
                startLabel={election.startDate}
                candidateCount={election.candidates.length}
              />
            ))
          )}
        </div>
      </section>

      <QuickActions />
    </div>
  )
}
