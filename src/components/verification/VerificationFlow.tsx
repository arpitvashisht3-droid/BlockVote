import {
  BadgeCheck,
  Boxes,
  ChevronDown,
  ChevronRight,
  FileCheck,
  GitBranch,
  ShieldCheck,
  Vote,
} from 'lucide-react'
import { verificationFlowSteps } from '../../data/verification'

const stepIcons = [
  Vote,
  FileCheck,
  Boxes,
  GitBranch,
  ShieldCheck,
  BadgeCheck,
] as const

export function VerificationFlow() {
  return (
    <section aria-labelledby="verification-flow-heading">
      <h2 id="verification-flow-heading" className="text-lg font-bold text-navy">
        Verification flow
      </h2>
      <ol className="card mt-4 flex flex-col gap-3 p-5 sm:p-6 lg:flex-row lg:items-center lg:gap-0">
        {verificationFlowSteps.map((step, index) => {
          const Icon = stepIcons[index]
          const last = index === verificationFlowSteps.length - 1

          return (
            <li
              key={step}
              className="flex items-center gap-3 lg:min-w-0 lg:flex-1"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3 lg:flex-col lg:text-center">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <span className="text-sm font-semibold text-navy">{step}</span>
              </div>
              {last ? null : (
                <>
                  <ChevronDown
                    className="size-4 shrink-0 text-slate-300 lg:hidden"
                    aria-hidden="true"
                  />
                  <ChevronRight
                    className="mx-1 hidden size-4 shrink-0 text-slate-300 lg:block"
                    aria-hidden="true"
                  />
                </>
              )}
            </li>
          )
        })}
      </ol>
    </section>
  )
}
