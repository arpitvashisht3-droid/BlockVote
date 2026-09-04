import { useEffect, useId, useRef, useState } from 'react'
import { ArrowLeft, Copy, Ellipsis, Eye, Pencil } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Election, ElectionStatus } from '../../../data/elections'
import { Button } from '../../Button'
import { buttonClassName } from '../../buttonStyles'
import { StatusBadge } from '../../elections/StatusBadge'

type ManageElectionHeaderProps = {
  election: Election
  organization: string
  paused: boolean
  archived: boolean
  onEdit: () => void
  onCopyId: () => void
  onDuplicate: () => void
  onArchive: () => void
}

function StateLabel({
  status,
  paused,
  archived,
}: {
  status: ElectionStatus
  paused: boolean
  archived: boolean
}) {
  if (archived) {
    return 'Archived'
  }
  if (paused && status === 'live') {
    return 'Paused'
  }
  if (status === 'live') {
    return 'Live'
  }
  if (status === 'upcoming') {
    return 'Scheduled'
  }
  return 'Completed'
}

export function ManageElectionHeader({
  election,
  organization,
  paused,
  archived,
  onEdit,
  onCopyId,
  onDuplicate,
  onArchive,
}: ManageElectionHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  return (
    <header className="space-y-4">
      <Link
        to="/admin/elections"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent-hover"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to Elections
      </Link>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-navy sm:text-3xl">
              Manage {election.title}
            </h1>
            <StatusBadge status={election.status} />
          </div>
          <p className="mt-2 text-sm text-navy-muted">
            ID: {election.electionCode}
            <span className="mx-2 text-border">·</span>
            {organization}
            <span className="mx-2 text-border">·</span>
            <StateLabel
              status={election.status}
              paused={paused}
              archived={archived}
            />
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={`/elections/${election.id}`}
            className={buttonClassName({
              variant: 'secondary',
              className: 'w-full sm:w-auto',
            })}
          >
            <Eye className="size-4" aria-hidden="true" />
            View Public Election
          </Link>
          <Button
            variant="secondary"
            className="w-full sm:w-auto"
            onClick={onEdit}
          >
            <Pencil className="size-4" aria-hidden="true" />
            Edit Election
          </Button>
          <div className="relative" ref={menuRef}>
            <Button
              variant="ghost"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-controls={menuId}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <Ellipsis className="size-4" aria-hidden="true" />
              More
            </Button>
            {menuOpen ? (
              <div
                id={menuId}
                role="menu"
                className="absolute right-0 z-20 mt-2 w-52 rounded-xl border border-border bg-white p-1 shadow-lg"
              >
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-navy hover:bg-slate-50"
                  onClick={() => {
                    setMenuOpen(false)
                    onCopyId()
                  }}
                >
                  <Copy className="size-4" aria-hidden="true" />
                  Copy Election ID
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-navy hover:bg-slate-50"
                  onClick={() => {
                    setMenuOpen(false)
                    onDuplicate()
                  }}
                >
                  Duplicate Election
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-rose-700 hover:bg-rose-50"
                  onClick={() => {
                    setMenuOpen(false)
                    onArchive()
                  }}
                >
                  Archive Election
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  )
}
