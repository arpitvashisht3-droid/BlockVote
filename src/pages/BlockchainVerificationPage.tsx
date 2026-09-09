import { ArrowLeft, Clock3 } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { buttonClassName } from '../components/buttonStyles'
import { BlockchainRecord } from '../components/verification/BlockchainRecord'
import { ElectionVerificationInfo } from '../components/verification/ElectionVerificationInfo'
import { TransactionList } from '../components/verification/TransactionList'
import { TrustStatement } from '../components/verification/TrustStatement'
import { VerificationChecks } from '../components/verification/VerificationChecks'
import { VerificationFlow } from '../components/verification/VerificationFlow'
import { VerificationHeader } from '../components/verification/VerificationHeader'
import { getElectionByParam } from '../data/elections'
import {
  getResultsPath,
  getVerificationByCode,
} from '../data/verification'

export function BlockchainVerificationPage() {
  const { electionId } = useParams()
  const election = getElectionByParam(electionId)

  if (!election) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h1 className="text-2xl font-bold text-navy">Election not found</h1>
        <p className="mt-2 max-w-lg text-navy-muted">
          This verification record is not in the BlockVote catalog. Check the
          election ID and try again.
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

  const verification = getVerificationByCode(election.electionCode)
  const resultsPath = getResultsPath(election)

  if (!verification) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <Link
          to={`/elections/${election.id}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-navy-muted transition-colors hover:text-navy"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to Election
        </Link>
        <header className="mt-6">
          <h1 className="text-3xl font-bold tracking-tight text-navy">
            Blockchain Verification
          </h1>
          <p className="mt-2 text-navy-muted">{election.title}</p>
        </header>
        <div className="card mt-8 px-6 py-14 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-slate-100 text-navy-muted">
            <Clock3 className="size-5" aria-hidden="true" />
          </span>
          <h2 className="mt-4 text-lg font-semibold text-navy">
            Verification is not available yet.
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-navy-muted">
            A public blockchain record will appear here after this election is
            finalized.
          </p>
          <Link to="/elections" className={buttonClassName({ className: 'mt-6' })}>
            Back to Elections
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <Link
        to={resultsPath}
        className="inline-flex items-center gap-2 text-sm font-medium text-navy-muted transition-colors hover:text-navy"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to Election Results
      </Link>

      <div className="mt-6">
        <VerificationHeader />
      </div>

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-2">
        <ElectionVerificationInfo
          election={election}
          verification={verification}
        />
        <BlockchainRecord record={verification.record} />
      </div>

      <div className="mt-8">
        <VerificationChecks />
      </div>

      <div className="mt-8">
        <TransactionList transactions={verification.transactions} />
      </div>

      <div className="mt-8">
        <VerificationFlow />
      </div>

      <div className="mt-8">
        <TrustStatement resultsPath={resultsPath} />
      </div>
    </div>
  )
}
