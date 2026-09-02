import { BadgeCheck } from 'lucide-react'

export function VerificationHeader() {
  return (
    <header>
      <h1 className="text-3xl font-bold tracking-tight text-navy sm:text-4xl">
        Blockchain Verification
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-navy-muted sm:text-base">
        Independently verify the integrity and transparency of this election.
      </p>
      <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1.5 text-sm font-semibold text-accent">
        <BadgeCheck className="size-4" aria-hidden="true" />
        Election Verified
      </p>
    </header>
  )
}
