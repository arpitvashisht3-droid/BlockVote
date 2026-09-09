import { BadgeCheck } from 'lucide-react'
import { verificationChecks } from '../../data/verification'

export function VerificationChecks() {
  return (
    <section aria-labelledby="verification-checks-heading">
      <h2 id="verification-checks-heading" className="text-lg font-bold text-navy">
        Verification Checks
      </h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {verificationChecks.map((check) => (
          <article key={check.title} className="card flex items-start gap-3 p-4">
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
              <BadgeCheck className="size-4" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold text-navy">{check.title}</h3>
                <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-semibold tracking-wide text-accent uppercase">
                  Verified
                </span>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-navy-muted">
                {check.explanation}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
