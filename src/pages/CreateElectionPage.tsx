import { useEffect, useRef, useState } from 'react'
import { Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CandidateList } from '../components/admin/create-election/CandidateList'
import { ElectionDetailsForm } from '../components/admin/create-election/ElectionDetailsForm'
import { ElectionProgress } from '../components/admin/create-election/ElectionProgress'
import { ElectionReview } from '../components/admin/create-election/ElectionReview'
import { PublishElectionModal } from '../components/admin/create-election/PublishElectionModal'
import { SuccessState } from '../components/admin/create-election/SuccessState'
import { VotingSettingsForm } from '../components/admin/create-election/VotingSettingsForm'
import { Button } from '../components/Button'
import { buttonClassName } from '../components/buttonStyles'
import {
  createInitialDraft,
  detailsAreValid,
  validateDetails,
  type CreateElectionDraft,
  type ElectionDetailsFields,
  type VotingSettings,
} from '../data/createElection'
import {
  createApiCandidate,
  createApiElection,
  DEFAULT_ADMIN_TOKEN,
} from '../services/api'

export function CreateElectionPage() {
  const [step, setStep] = useState(1)
  const [draft, setDraft] = useState<CreateElectionDraft>(createInitialDraft)
  const [detailsDirty, setDetailsDirty] = useState(false)
  const [draftSaved, setDraftSaved] = useState(false)
  const [publishOpen, setPublishOpen] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [published, setPublished] = useState(false)
  const [createdInfo, setCreatedInfo] = useState<{ name: string; id: string; slug: string } | null>(null)
  const [publishError, setPublishError] = useState<string | null>(null)
  const draftTimer = useRef<number | undefined>(undefined)

  const detailsErrors = detailsDirty ? validateDetails(draft.details) : {}
  const canContinueDetails = detailsAreValid(draft.details)
  const canContinueCandidates = draft.candidates.length >= 2

  useEffect(() => {
    return () => {
      window.clearTimeout(draftTimer.current)
    }
  }, [])

  function updateDetails(patch: Partial<ElectionDetailsFields>) {
    setDetailsDirty(true)
    setDraft((current) => ({
      ...current,
      details: { ...current.details, ...patch },
    }))
  }

  function updateSettings(patch: Partial<VotingSettings>) {
    setDraft((current) => ({
      ...current,
      settings: { ...current.settings, ...patch },
    }))
  }

  function goToStep(nextStep: number) {
    if (nextStep < step) {
      setStep(nextStep)
      return
    }

    if (nextStep > 1 && !canContinueDetails) {
      setDetailsDirty(true)
      return
    }

    if (nextStep > 2 && !canContinueCandidates) {
      return
    }

    setStep(nextStep)
  }

  function handleSaveDraft() {
    setDraftSaved(true)
    window.clearTimeout(draftTimer.current)
    draftTimer.current = window.setTimeout(() => {
      setDraftSaved(false)
    }, 3500)
  }

  async function handlePublish() {
    setPublishing(true)
    setPublishError(null)

    try {
      const createdElection = await createApiElection(
        {
          title: draft.details.name.trim(),
          description: draft.details.description.trim(),
          detailsDescription: draft.details.description.trim(),
          organization: draft.details.organization.trim() || 'BlockVote Platform',
          electionType: draft.details.type,
          startDate: draft.details.startDate ? new Date(`${draft.details.startDate}T${draft.details.startTime}`).toISOString() : new Date().toISOString(),
          endDate: draft.details.endDate ? new Date(`${draft.details.endDate}T${draft.details.endTime}`).toISOString() : new Date(Date.now() + 86400000).toISOString(),
          status: 'upcoming',
          published: true,
        },
        DEFAULT_ADMIN_TOKEN,
      )

      for (const candidate of draft.candidates) {
        await createApiCandidate(
          createdElection.id,
          {
            name: candidate.name.trim(),
            department: candidate.department.trim() || 'General',
            position: candidate.position?.trim() || 'Candidate',
            about: candidate.about?.trim() || '',
            achievements: [candidate.about?.trim() || 'Candidate in this election'],
          },
          DEFAULT_ADMIN_TOKEN,
        )
      }

      setCreatedInfo({
        name: createdElection.title,
        id: createdElection.id,
        slug: createdElection.slug,
      })

      setPublishing(false)
      setPublishOpen(false)
      setPublished(true)
    } catch (err) {
      setPublishing(false)
      setPublishError((err as Error).message || 'Failed to publish election to backend.')
    }
  }

  if (published && createdInfo) {
    return (
      <SuccessState
        electionName={createdInfo.name}
        electionId={createdInfo.id}
        slug={createdInfo.slug}
      />
    )
  }

  return (
    <div className="mx-auto max-w-3xl overflow-x-hidden">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-navy sm:text-3xl">
          Create New Election
        </h1>
        <p className="mt-2 text-sm text-navy-muted sm:text-base">
          Set up your election, add candidates, configure voting rules, and
          publish when ready.
        </p>
      </header>

      {publishError ? (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">
          Publish Error: {publishError}
        </div>
      ) : null}

      <div className="card p-5 sm:p-8">
        <ElectionProgress currentStep={step} onStepSelect={goToStep} />

        <form
          className="mt-8"
          onSubmit={(event) => {
            event.preventDefault()
          }}
        >
          {step === 1 ? (
            <ElectionDetailsForm
              value={draft.details}
              errors={detailsErrors}
              onChange={updateDetails}
            />
          ) : null}

          {step === 2 ? (
            <CandidateList
              candidates={draft.candidates}
              onChange={(candidates) => {
                setDraft((current) => ({ ...current, candidates }))
              }}
            />
          ) : null}

          {step === 3 ? (
            <VotingSettingsForm
              value={draft.settings}
              onChange={updateSettings}
            />
          ) : null}

          {step === 4 ? <ElectionReview draft={draft} /> : null}

          <div
            className={`mt-8 flex flex-col-reverse gap-3 sm:flex-row ${
              step === 4 ? 'sm:flex-wrap sm:justify-between' : 'sm:justify-between'
            }`}
          >
            {step === 1 ? (
              <Link
                to="/admin"
                className={buttonClassName({
                  variant: 'secondary',
                  className: 'w-full sm:w-auto',
                })}
              >
                Cancel
              </Link>
            ) : (
              <Button
                variant="secondary"
                className="w-full sm:w-auto"
                onClick={() => setStep((current) => current - 1)}
              >
                Back
              </Button>
            )}

            {step === 1 ? (
              <Button
                className="w-full sm:w-auto"
                disabled={!canContinueDetails}
                onClick={() => {
                  setDetailsDirty(true)
                  if (canContinueDetails) {
                    setStep(2)
                  }
                }}
              >
                Next: Candidates
              </Button>
            ) : null}

            {step === 2 ? (
              <Button
                className="w-full sm:w-auto"
                disabled={!canContinueCandidates}
                onClick={() => {
                  if (canContinueCandidates) {
                    setStep(3)
                  }
                }}
              >
                Next: Voting Settings
              </Button>
            ) : null}

            {step === 3 ? (
              <Button className="w-full sm:w-auto" onClick={() => setStep(4)}>
                Next: Review
              </Button>
            ) : null}

            {step === 4 ? (
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <Button
                  variant="ghost"
                  className="w-full sm:w-auto"
                  onClick={handleSaveDraft}
                >
                  Save as Draft
                </Button>
                <Button
                  className="w-full sm:w-auto"
                  onClick={() => setPublishOpen(true)}
                >
                  Publish Election
                </Button>
              </div>
            ) : null}
          </div>
        </form>
      </div>

      {draftSaved ? (
        <div
          role="status"
          className="fixed right-4 bottom-4 z-40 flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-3 text-sm font-medium text-navy shadow-lg"
        >
          <Check className="size-4 text-accent" aria-hidden="true" />
          Draft saved locally. Nothing was sent to a server.
        </div>
      ) : null}

      <PublishElectionModal
        open={publishOpen}
        publishing={publishing}
        onClose={() => {
          if (!publishing) {
            setPublishOpen(false)
          }
        }}
        onConfirm={handlePublish}
      />
    </div>
  )
}
