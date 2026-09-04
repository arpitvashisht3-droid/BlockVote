import { ArrowLeft, BadgeCheck, Clock3 } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { buttonClassName } from '../components/buttonStyles'
import { StatusBadge } from '../components/elections/StatusBadge'
import { CandidateResult } from '../components/results/CandidateResult'
import { ElectionTimeline } from '../components/results/ElectionTimeline'
import { ResultsSummary } from '../components/results/ResultsSummary'
import { VerificationCard } from '../components/results/VerificationCard'
import { WinnerCard } from '../components/results/WinnerCard'
import {
  formatPercent,
  getCandidateById,
  getElectionById,
  getVerifyPath,
} from '../data/elections'

export function ElectionResultsPage() {
  const { id } = useParams()
  const election = getElectionById(id)

  if (!election) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h1 className="text-2xl font-bold text-navy">Results not found</h1>
        <p className="mt-2 text-navy-muted">
          No published results are available for this election.
        </p>
        <Link
          to="/elections"
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-accent-hover"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to Elections
        </Link>
      </div>
    )
  }

  const results = election.results
  const winner = results
    ? getCandidateById(election, results.winnerId)
    : undefined
  const winnerResult = results?.candidateResults.find(
    (item) => item.candidateId === results.winnerId,
  )
  const verifyPath = getVerifyPath(election)

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <Link
        to="/elections"
        className="inline-flex items-center gap-2 text-sm font-medium text-navy-muted transition-colors hover:text-navy"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to Elections
      </Link>

      <header className="mt-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-navy sm:text-4xl">
            {election.title}
          </h1>
          <StatusBadge status={results ? 'ended' : election.status} />
        </div>
        <p className="mt-2 text-sm text-navy-muted sm:text-base">
          {results ? 'Final election results' : 'Election results'}
        </p>
        {results ? (
          <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-accent">
            <BadgeCheck className="size-4" aria-hidden="true" />
            Results verified
          </p>
        ) : null}
      </header>

      {results && winner && winnerResult ? (
        <>
          <div className="mt-8">
            <WinnerCard
              candidate={winner}
              votes={winnerResult.votes}
              percentage={winnerResult.percentage}
            />
          </div>

          <div className="mt-4">
            <ResultsSummary
              totalVotes={results.totalVotes}
              registeredVoters={results.registeredVoters}
              turnoutPercent={results.turnoutPercent}
              candidateCount={election.candidates.length}
            />
          </div>

          <div className="mt-6 grid items-start gap-6 lg:grid-cols-3">
            <section className="lg:col-span-2" aria-labelledby="results-heading">
              <div className="card p-5 sm:p-6">
                <h2 id="results-heading" className="text-lg font-bold text-navy">
                  Results
                </h2>
                <div className="mt-4 flex flex-col gap-3">
                  {results.candidateResults.map((item) => {
                    const candidate = getCandidateById(
                      election,
                      item.candidateId,
                    )

                    if (!candidate) {
                      return null
                    }

                    return (
                      <CandidateResult
                        key={item.candidateId}
                        candidate={candidate}
                        votes={item.votes}
                        percentage={item.percentage}
                        isWinner={item.candidateId === results.winnerId}
                      />
                    )
                  })}
                </div>
                <p className="mt-4 flex items-center gap-2 rounded-xl bg-accent-soft px-4 py-3 text-sm font-semibold text-accent">
                  <BadgeCheck className="size-4 shrink-0" aria-hidden="true" />
                  {winner.name} wins with {formatPercent(winnerResult.percentage)}{' '}
                  votes
                </p>
              </div>
            </section>

            <div className="flex flex-col gap-6">
              <ElectionTimeline
                items={[
                  { label: 'Election Started', date: election.startDate },
                  { label: 'Voting Closed', date: election.endDate },
                  {
                    label: 'Results Finalized',
                    date: results.resultsFinalizedDate,
                  },
                ]}
              />
              <VerificationCard
                election={election}
                totalTransactions={results.totalVotes}
                blockHeight={results.blockHeight}
                verifyPath={verifyPath}
              />
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/elections"
              className={buttonClassName({
                variant: 'secondary',
                size: 'lg',
                className: 'w-full sm:w-auto',
              })}
            >
              Back to Elections
            </Link>
            <Link
              to={verifyPath}
              className={buttonClassName({
                size: 'lg',
                className: 'w-full sm:w-auto',
              })}
            >
              View Blockchain Verification
            </Link>
          </div>
        </>
      ) : (
        <div className="card mt-8 px-6 py-14 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-slate-100 text-navy-muted">
            <Clock3 className="size-5" aria-hidden="true" />
          </span>
          <h2 className="mt-4 text-lg font-semibold text-navy">
            Results are not available yet.
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-navy-muted">
            {election.status === 'upcoming'
              ? `Voting opens on ${election.startDate}. Final results will appear here after the election closes.`
              : `This election is still open until ${election.endDate}. Final results will be published after voting closes.`}
          </p>
          <Link
            to={`/elections/${election.id}`}
            className={buttonClassName({ className: 'mt-6' })}
          >
            View Election
          </Link>
        </div>
      )}
    </div>
  )
}
