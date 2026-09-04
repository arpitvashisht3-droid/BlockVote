import { Check, ExternalLink } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { buttonClassName } from '../components/buttonStyles'
import { truncateTxHash } from '../data/verification'

type VoteSuccessState = {
  electionId?: string
  transactionHash?: string
}

export function VoteSuccessPage() {
  const location = useLocation()
  const state = location.state as VoteSuccessState | null
  const electionPath = state?.electionId
    ? `/elections/${state.electionId}`
    : '/elections'
  const displayHash = state?.transactionHash
    ? truncateTxHash(state.transactionHash)
    : '0x7a9c...4b8f'

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-16 text-center sm:px-6 sm:py-20">
      <div className="relative">
        <span className="absolute -top-2 -left-6 size-2.5 rounded-full bg-amber-400" />
        <span className="absolute top-1 -right-7 size-2 rounded-full bg-upcoming" />
        <span className="absolute -bottom-1 -left-4 size-2 rounded-full bg-accent" />
        <span className="absolute right-0 -bottom-3 size-1.5 rounded-full bg-rose-400" />
        <span className="flex size-20 items-center justify-center rounded-full bg-accent text-white shadow-card">
          <Check className="size-10 stroke-[2.5]" aria-hidden="true" />
        </span>
      </div>

      <h1 className="mt-8 text-3xl font-bold tracking-tight text-navy sm:text-4xl">
        Vote Cast Successfully!
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-navy-muted sm:text-base">
        Thank you for participating in the election. Your vote has been recorded
        on the blockchain.
      </p>

      <div className="mt-8 w-full rounded-xl border border-border bg-slate-50 px-4 py-4 text-left">
        <p className="text-xs font-semibold tracking-wide text-navy-muted uppercase">
          Transaction Hash
        </p>
        <p className="mt-1 font-mono text-sm font-semibold text-navy">
          {displayHash}
        </p>
        <button
          type="button"
          className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent-hover"
        >
          View on Explorer
          <ExternalLink className="size-3.5" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row">
        <Link
          to={electionPath}
          className={buttonClassName({ size: 'lg', className: 'w-full' })}
        >
          Back to Election
        </Link>
        <Link
          to="/elections"
          className={buttonClassName({
            variant: 'secondary',
            size: 'lg',
            className: 'w-full',
          })}
        >
          View My Dashboard
        </Link>
      </div>
    </div>
  )
}
