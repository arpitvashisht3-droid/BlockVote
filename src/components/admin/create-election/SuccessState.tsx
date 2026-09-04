import { Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { buttonClassName } from '../../buttonStyles'

type SuccessStateProps = {
  electionName: string
  electionId: string
  slug: string
}

export function SuccessState({
  electionName,
  electionId,
  slug,
}: SuccessStateProps) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-2 py-6 text-center sm:py-10">
      <span className="flex size-20 items-center justify-center rounded-full bg-accent text-white shadow-card">
        <Check className="size-10 stroke-[2.5]" aria-hidden="true" />
      </span>
      <h1 className="mt-6 text-2xl font-bold tracking-tight text-navy sm:text-3xl">
        Election Created Successfully
      </h1>
      <p className="mt-2 text-sm text-navy-muted">
        Your election is ready for voters according to the rules you configured.
      </p>

      <div className="mt-8 w-full space-y-3 text-left">
        <div className="rounded-xl border border-border bg-slate-50 px-4 py-4">
          <p className="text-xs font-semibold tracking-wide text-navy-muted uppercase">
            Election Name
          </p>
          <p className="mt-1 font-semibold text-navy">{electionName}</p>
        </div>
        <div className="rounded-xl border border-border bg-slate-50 px-4 py-4">
          <p className="text-xs font-semibold tracking-wide text-navy-muted uppercase">
            Election ID
          </p>
          <p className="mt-1 font-mono text-sm font-semibold text-navy">
            {electionId}
          </p>
        </div>
      </div>

      <div className="mt-8 flex w-full flex-col gap-3">
        <Link
          to={`/elections/${slug}`}
          className={buttonClassName({ size: 'lg', className: 'w-full' })}
        >
          View Election
        </Link>
        <Link
          to={`/admin/elections/${slug}`}
          className={buttonClassName({
            variant: 'secondary',
            size: 'lg',
            className: 'w-full',
          })}
        >
          Manage Election
        </Link>
        <Link
          to="/admin"
          className={buttonClassName({
            variant: 'ghost',
            size: 'lg',
            className: 'w-full',
          })}
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
