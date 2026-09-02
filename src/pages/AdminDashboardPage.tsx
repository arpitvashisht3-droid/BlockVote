import { ActivityChart } from '../components/admin/ActivityChart'
import { AdminElectionCard } from '../components/admin/AdminElectionCard'
import { AdminQuickActions } from '../components/admin/AdminQuickActions'
import { AdminStatCard } from '../components/admin/AdminStatCard'
import { ElectionStatusOverview } from '../components/admin/ElectionStatusOverview'
import { RecentActivity } from '../components/admin/RecentActivity'
import { adminStats, getManagedElections } from '../data/admin'

export function AdminDashboardPage() {
  const managed = getManagedElections()

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
            {managed.map(({ election, ...management }) => (
              <AdminElectionCard
                key={election.id}
                election={election}
                management={management}
              />
            ))}
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
