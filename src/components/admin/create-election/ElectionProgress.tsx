import { Check } from 'lucide-react'
import { createElectionSteps } from '../../../data/createElection'

type ElectionProgressProps = {
  currentStep: number
  onStepSelect: (step: number) => void
}

export function ElectionProgress({
  currentStep,
  onStepSelect,
}: ElectionProgressProps) {
  const current = createElectionSteps.find((step) => step.id === currentStep)

  return (
    <nav aria-label="Election creation steps">
      <ol className="flex items-center">
        {createElectionSteps.map((step, index) => {
          const complete = step.id < currentStep
          const active = step.id === currentStep
          const reachable = step.id <= currentStep

          return (
            <li
              key={step.id}
              className="flex min-w-0 flex-1 items-center last:flex-none"
            >
              <button
                type="button"
                disabled={!reachable}
                aria-current={active ? 'step' : undefined}
                onClick={() => reachable && onStepSelect(step.id)}
                className="flex min-w-0 flex-col items-center gap-2 disabled:cursor-default"
              >
                <span
                  className={`flex size-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                    active
                      ? 'bg-accent text-white'
                      : complete
                        ? 'bg-accent text-white'
                        : 'border border-border bg-white text-navy-muted'
                  }`}
                >
                  {complete ? (
                    <Check className="size-4" aria-hidden="true" />
                  ) : (
                    step.id
                  )}
                </span>
                <span
                  className={`hidden max-w-24 text-center text-xs font-medium sm:block ${
                    active ? 'text-navy' : 'text-navy-muted'
                  }`}
                >
                  {step.shortLabel}
                </span>
              </button>
              {index < createElectionSteps.length - 1 ? (
                <span
                  className={`mx-2 mb-6 hidden h-0.5 flex-1 rounded-full sm:mb-7 sm:block ${
                    step.id < currentStep ? 'bg-accent' : 'bg-border'
                  }`}
                  aria-hidden="true"
                />
              ) : null}
            </li>
          )
        })}
      </ol>
      <p className="mt-3 text-center text-sm font-medium text-navy sm:hidden">
        Step {currentStep} of {createElectionSteps.length}
        {current ? ` · ${current.label}` : ''}
      </p>
    </nav>
  )
}
