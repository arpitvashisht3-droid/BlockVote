import { useEffect, useState } from 'react'
import { ActivityChart } from '../components/admin/ActivityChart'
import { AdminElectionCard } from '../components/admin/AdminElectionCard'
import { AdminQuickActions } from '../components/admin/AdminQuickActions'
import { AdminStatCard } from '../components/admin/AdminStatCard'
import { ElectionStatusOverview } from '../components/admin/ElectionStatusOverview'
import { RecentActivity } from '../components/admin/RecentActivity'
import { DEFAULT_ADMIN_TOKEN, fetchApiElections } from '../services/api'
import { mapApiElectionToElection, type Election } from '../data/elections'
import type { AdminStat, ManagedElection } from '../data/admin'

export function AdminDashboardPage() {
  const [elections, setElections] = useState<Election[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    fetchApiElections(DEFAULT_ADMIN_TOKEN)
      .then((data) => {
        if (isMounted) {
          setElections(data.map(mapApiElectionToElection))
          setLoading(false)
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to load elections from backend API.')
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  const totalCount = elections.length
  const liveCount = elections.filter((e) => e.status === 'live').length
  const upcomingCount = elections.filter((e) => e.status === 'upcoming').length
  const endedCount = elections.filter((e) => e.status === 'ended').length

  const dynamicStats: AdminStat[] = [
    { label: 'Total Elections', value: String(totalCount), detail: 'Catalog total', trend: 'Active', trendUp: true },
    { label: 'Active Elections', value: String(liveCount), detail: 'Currently open', trend: 'Live', trendUp: true },
    { label: 'Upcoming', value: String(upcomingCount), detail: 'Scheduled', trend: 'Upcoming', trendUp: true },
    { label: 'Ended', value: String(endedCount), detail: 'Completed', trend: 'Closed', trendUp: false },
  ]

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl py-12 text-center text-navy-muted">
        Loading admin dashboard data from backend...
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl py-12 text-center text-rose-600 font-semibold">
        Error loading admin dashboard: {error}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <p className="text-sm text-navy-muted sm:hidden">
        Manage elections, monitor participation, and verify results.
      </p>

      <section
        aria-label="Admin statistics"
        className="grid grid-cols-2 gap-3 lg:grid-cols-4"
      >
        {dynamicStats.map((stat) => (
          <AdminStatCard key={stat.label} stat={stat} />
        ))}
      </section>

      <ActivityChart />

      <div className="grid items-start gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2" aria-labelledby="active-admin-elections">
          <h2 id="active-admin-elections" className="text-lg font-bold text-navy">
            Active Elections
          </h2>
          <div className="mt-4 flex flex-col gap-3">
            {elections.map((election) => {
              const management: ManagedElection = {
                electionId: election.id,
                status: election.status,
                votes: election.voteCount || 0,
                registeredVoters: 1000,
                turnoutPercent: election.turnoutPercent || 0,
                endsLabel: election.endDate,
              }
              return (
                <AdminElectionCard
                  key={election.id}
                  election={election}
                  management={management}
                />
              )
            })}
          </div>
        </section>

        <div className="flex flex-col gap-6">
          <ElectionStatusOverview />
          <RecentActivity />
        </div>
      </div>

      <AdminQuickActions />
    </div>
  )
}
