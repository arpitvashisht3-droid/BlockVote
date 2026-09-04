import { Link } from 'react-router-dom'
import { recentVotes } from '../../data/dashboard'
import { truncateTxHash } from '../../data/verification'

export function RecentVotes() {
  return (
    <section className="card overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <h2 className="text-lg font-bold text-navy">Recent Votes</h2>
        <Link
          to="/dashboard/votes"
          className="text-sm font-semibold text-accent hover:text-accent-hover"
        >
          View All Votes
        </Link>
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-t border-border bg-slate-50 text-xs tracking-wide text-navy-muted uppercase">
            <tr>
              <th className="px-5 py-3 font-semibold">Election</th>
              <th className="px-5 py-3 font-semibold">Candidate</th>
              <th className="px-5 py-3 font-semibold">Date</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold">Transaction</th>
            </tr>
          </thead>
          <tbody>
            {recentVotes.map((vote) => (
              <tr key={vote.id} className="border-t border-border">
                <td className="px-5 py-3 font-medium text-navy">
                  {vote.electionTitle}
                </td>
                <td className="px-5 py-3 text-navy-muted">{vote.candidateName}</td>
                <td className="px-5 py-3 text-navy-muted">{vote.date}</td>
                <td className="px-5 py-3">
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
                    <span className="size-1.5 rounded-full bg-accent" />
                    Verified
                  </span>
                </td>
                <td className="px-5 py-3 font-mono text-xs font-semibold text-navy">
                  {truncateTxHash(vote.transactionHash)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-border border-t border-border md:hidden">
        {recentVotes.map((vote) => (
          <li key={vote.id} className="space-y-2 px-5 py-4">
            <p className="font-semibold text-navy">{vote.electionTitle}</p>
            <p className="text-sm text-navy-muted">{vote.candidateName}</p>
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="text-navy-muted">{vote.date}</span>
              <span className="inline-flex items-center gap-1.5 font-semibold text-accent">
                <span className="size-1.5 rounded-full bg-accent" />
                Verified
              </span>
            </div>
            <p className="font-mono text-xs font-semibold text-navy">
              {truncateTxHash(vote.transactionHash)}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}
