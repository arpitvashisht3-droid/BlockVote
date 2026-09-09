import { useEffect, useState } from 'react'
import { ActivityChart } from '../components/admin/ActivityChart'
import { AdminElectionCard } from '../components/admin/AdminElectionCard'
import { AdminQuickActions } from '../components/admin/AdminQuickActions'
import { AdminStatCard } from '../components/admin/AdminStatCard'
import { ElectionStatusOverview } from '../components/admin/ElectionStatusOverview'
import { RecentActivity } from '../components/admin/RecentActivity'
import {
  buildAdminStats,
  buildElectionStatusCounts,
  type ManagedElection,
} from '../data/admin'
import { getSessionElections, type Election } from '../data/elections'
import {
  chainElectionToElection,
  fetchElectionsFromChain,
} from '../services/blockchain'

export function AdminDashboardPage() {
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
        console.error('Failed to load elections in admin dashboard:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  const adminStats = buildAdminStats(elections)
  const statusCounts = buildElectionStatusCounts(elections)

  const activeElections = elections.filter((e) => e.status === 'live')
  const managed: Array<{ election: Election; management: ManagedElection }> =
    activeElections.map((election) => ({
      election,
      management: {
        electionId: election.id,
        status: election.status,
        votes: election.voteCount ?? 0,
        registeredVoters: 0,
        turnoutPercent: 0,
        endsLabel: election.endDate ? `Ends ${election.endDate}` : 'Ongoing',
      },
    }))

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <p className="text-sm text-navy-muted sm:hidden">
        Manage elections, monitor participation, and verify results.
      </p>

      <section
        aria-label="Admin statistics"
        className="grid grid-cols-2 gap-3 lg:grid-cols-4"
      >
        {adminStats.map((stat) => (
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
            {loading ? (
              <div className="card p-6 text-center text-sm text-navy-muted">
                Loading elections...
              </div>
            ) : managed.length === 0 ? (
              <div className="card p-8 text-center text-sm text-navy-muted">
                No active elections currently running.
              </div>
            ) : (
              managed.map(({ election, management }) => (
                <AdminElectionCard
                  key={election.id}
                  election={election}
                  management={management}
                />
              ))
            )}
          </div>
        </section>

        <div className="flex flex-col gap-6">
          <ElectionStatusOverview counts={statusCounts} />
          <RecentActivity />
        </div>
      </div>

      <AdminQuickActions />
    </div>
  )
}
