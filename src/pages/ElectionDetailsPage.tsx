import { ArrowLeft } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '../components/Button'
import { CandidateCard } from '../components/elections/CandidateCard'
import { CandidateProfileModal } from '../components/elections/CandidateProfileModal'
import { ElectionInfo } from '../components/elections/ElectionInfo'
import { StatusBadge } from '../components/elections/StatusBadge'
import { VoteConfirmationModal } from '../components/elections/VoteConfirmationModal'
import {
  getCandidateById,
  getElectionById,
} from '../data/elections'
import { getActiveCandidates } from '../data/manageElection'

export function ElectionDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const election = getElectionById(id)
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(
    null,
  )
  const [profileCandidateId, setProfileCandidateId] = useState<string | null>(
    null,
  )
  const [confirmationOpen, setConfirmationOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const confirmTimer = useRef<number | undefined>(undefined)

  useEffect(() => {
    return () => {
      window.clearTimeout(confirmTimer.current)
    }
  }, [])

  if (!election) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h1 className="text-2xl font-bold text-navy">Election not found</h1>
        <p className="mt-2 text-navy-muted">
          This election is not in the current BlockVote catalog.
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

  const ballotCandidates = getActiveCandidates(election.candidates)
  const selectedCandidate = getCandidateById(election, selectedCandidateId)
  const profileCandidate = getCandidateById(election, profileCandidateId) ?? null
  const canVote = election.status === 'live'
  const confirmationCandidate =
    confirmationOpen && selectedCandidate ? selectedCandidate : null

  function closeConfirmation() {
    if (confirming) {
      return
    }

    setConfirmationOpen(false)
  }

  function handleConfirmVote() {
    if (!election || !selectedCandidate) {
      return
    }

    setConfirming(true)
    const electionId = election.id
    confirmTimer.current = window.setTimeout(() => {
      navigate('/vote-success', {
        state: { electionId },
      })
    }, 800)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <Link
        to="/elections"
        className="inline-flex items-center gap-2 text-sm font-medium text-navy-muted transition-colors hover:text-navy"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to Elections
      </Link>

      <header className="mt-6 max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-navy sm:text-4xl">
          {election.title}
        </h1>
        <div className="mt-3">
          <StatusBadge status={election.status} />
        </div>
        <p className="mt-3 text-sm leading-relaxed text-navy-muted sm:text-base">
          {election.detailsDescription}
        </p>
      </header>

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-2">
        <ElectionInfo election={election} />

        <section aria-labelledby="candidates-heading">
          <h2 id="candidates-heading" className="text-xl font-bold text-navy">
            Candidates
          </h2>
          <p className="mt-1 text-sm text-navy-muted">
            Select one candidate to vote
          </p>

          <div
            className="mt-4 flex flex-col gap-3"
            role="radiogroup"
            aria-labelledby="candidates-heading"
          >
            {ballotCandidates.map((candidate) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                name={`election-${election.id}`}
                selected={selectedCandidateId === candidate.id}
                disabled={!canVote}
                onSelect={() => setSelectedCandidateId(candidate.id)}
                onViewProfile={() => setProfileCandidateId(candidate.id)}
              />
            ))}
          </div>

          <Button
            size="lg"
            className="mt-5 w-full"
            disabled={!canVote || !selectedCandidate}
            onClick={() => setConfirmationOpen(true)}
          >
            Cast Vote
          </Button>
          {!canVote ? (
            <p className="mt-2 text-center text-sm text-navy-muted">
              {election.status === 'upcoming'
                ? `Voting opens on ${election.startDate}.`
                : 'This election has ended. Voting is closed.'}
            </p>
          ) : null}
        </section>
      </div>

      <CandidateProfileModal
        candidate={profileCandidate}
        onClose={() => setProfileCandidateId(null)}
      />
      <VoteConfirmationModal
        candidate={confirmationCandidate}
        confirming={confirming}
        onCancel={closeConfirmation}
        onConfirm={handleConfirmVote}
      />
    </div>
  )
}
