import { Link } from 'react-router-dom'
import { ActiveElectionCard } from '../components/dashboard/ActiveElectionCard'
import { QuickActions } from '../components/dashboard/QuickActions'
import { RecentVotes } from '../components/dashboard/RecentVotes'
import { StatCard } from '../components/dashboard/StatCard'
import { UpcomingElectionCard } from '../components/dashboard/UpcomingElectionCard'
import { VerificationStatusCard } from '../components/dashboard/VerificationStatusCard'
import { VoterStatus } from '../components/dashboard/VoterStatus'
import {
  dashboardStats,
  getActiveDashboardElections,
  getUpcomingPreviewElections,
  voterProfile,
} from '../data/dashboard'

export function VoterDashboardPage() {
  const activeElections = getActiveDashboardElections()
  const upcoming = getUpcomingPreviewElections()

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-navy sm:text-3xl">
            Welcome back, {voterProfile.firstName}
          </h2>
          <p className="mt-1 text-sm text-navy-muted sm:text-base">
            Stay updated with your elections and voting activity.
          </p>
        </div>
        <p className="inline-flex items-center rounded-xl bg-upcoming-soft px-4 py-3 text-sm font-medium text-upcoming">
          You are eligible to vote in 2 elections.
        </p>
      </section>

      <section
        aria-label="Dashboard statistics"
        className="grid grid-cols-2 gap-3 lg:grid-cols-4"
      >
        {dashboardStats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2" aria-labelledby="active-elections-heading">
          <h2 id="active-elections-heading" className="text-lg font-bold text-navy">
            Active Elections
          </h2>
          <div className="mt-4 flex flex-col gap-3">
            {activeElections.map((election) => (
              <ActiveElectionCard
                key={election.id}
                election={election}
                voted={election.id === 'cultural-fest-committee'}
              />
            ))}
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
          {upcoming.map(({ election, startLabel, candidateCount }) => (
            <UpcomingElectionCard
              key={election.id}
              election={election}
              startLabel={startLabel}
              candidateCount={candidateCount}
            />
          ))}
        </div>
      </section>

      <QuickActions />
    </div>
  )
}
