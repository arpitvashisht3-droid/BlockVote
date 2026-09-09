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
  fetchBackendElections,
  getCandidateById,
  getElectionById,
  type Election,
} from '../data/elections'
import { getActiveCandidates } from '../data/manageElection'
import {
  chainElectionToElection,
  fetchElectionsFromChain,
} from '../services/blockchain'
import { sendOnChainVote } from '../services/wallet'

export function ElectionDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [election, setElection] = useState<Election | undefined>(() => getElectionById(id))
  const [loading, setLoading] = useState(!election)
  const [voteError, setVoteError] = useState<string | null>(null)

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
    let mounted = true
    async function loadElection() {
      if (!id) return
      try {
        const backendElections = await fetchBackendElections()
        let found = backendElections.find((e) => e.id === id || e.electionCode === id)
        if (!found) {
          const chainData = await fetchElectionsFromChain()
          found = chainData
            .map(chainElectionToElection)
            .find((e) => e.id === id || String(e.onchainId) === id || e.electionCode === id)
        }
        if (mounted && found) {
          setElection(found)
        }
      } catch (err) {
        console.error('Error loading election:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    loadElection()
    return () => {
      mounted = false
      window.clearTimeout(confirmTimer.current)
    }
  }, [id])

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
        <p className="text-sm text-navy-muted">Loading election details from blockchain...</p>
      </div>
    )
  }

  if (!election) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h1 className="text-2xl font-bold text-navy">Election not found</h1>
        <p className="mt-2 text-navy-muted">
          This election is not in the current BlockVote catalog.
        </p>
        <Link
          to="/dashboard/elections"
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

  async function handleConfirmVote() {
    if (!election || !selectedCandidate) {
      return
    }

    setConfirming(true)
    setVoteError(null)

    try {
      let txHash: string | undefined = undefined

      if (election.onchainId != null && selectedCandidate.onchainId != null) {
        txHash = await sendOnChainVote(election.onchainId, selectedCandidate.onchainId)
      }

      const electionId = election.id
      navigate('/vote-success', {
        state: { electionId, txHash },
      })
    } catch (err: any) {
      console.error('Vote submission failed:', err)
      setVoteError(err?.message || 'Vote transaction failed. Please try again.')
      setConfirming(false)
      setConfirmationOpen(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <Link
        to="/dashboard/elections"
        className="inline-flex items-center gap-2 text-sm font-medium text-navy-muted transition-colors hover:text-navy"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to Elections
      </Link>

      {voteError && (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-red-500/30 bg-red-50 p-4 text-sm text-red-800"
        >
          {voteError}
        </div>
      )}

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
            {ballotCandidates.length === 0 ? (
              <div className="card p-6 text-center text-sm text-navy-muted">
                No candidates registered for this ballot yet.
              </div>
            ) : (
              ballotCandidates.map((candidate) => (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  name={`election-${election.id}`}
                  selected={selectedCandidateId === candidate.id}
                  disabled={!canVote}
                  onSelect={() => setSelectedCandidateId(candidate.id)}
                  onViewProfile={() => setProfileCandidateId(candidate.id)}
                />
              ))
            )}
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
