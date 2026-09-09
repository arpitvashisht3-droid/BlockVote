import { CheckCircle2, ShieldCheck, ExternalLink, Vote } from 'lucide-react'
import { Link } from 'react-router-dom'
import { RecentVotes } from '../components/dashboard/RecentVotes'

export function MyVotesPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy sm:text-3xl">
          My Voting History
        </h1>
        <p className="mt-1 text-sm text-navy-muted sm:text-base">
          Review your verified votes recorded immutably on the Ethereum Sepolia blockchain.
        </p>
      </div>

      {/* Security Status Banner */}
      <div className="flex items-center gap-4 rounded-2xl bg-accent/10 p-5 border border-accent/20 text-navy">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-accent text-white">
          <ShieldCheck className="size-6" />
        </div>
        <div>
          <h3 className="font-bold text-navy">Cryptographically Sealed Ballots</h3>
          <p className="text-xs sm:text-sm text-navy-muted">
            All ballots submitted from your account are anonymized, verified via smart contracts, and linked to your wallet signature.
          </p>
        </div>
      </div>

      <RecentVotes />

      <div className="card p-6 text-center space-y-3">
        <Vote className="mx-auto size-10 text-slate-300" />
        <h3 className="text-base font-bold text-navy">Ready to participate in active elections?</h3>
        <p className="text-xs text-navy-muted max-w-md mx-auto">
          Explore current live ballots open for participation across the network.
        </p>
        <Link
          to="/dashboard/elections"
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-accent-hover"
        >
          Explore Active Elections
        </Link>
      </div>
    </div>
  )
}
