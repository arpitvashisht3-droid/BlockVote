import { useEffect, useId, useRef, useState } from 'react'
import { Ellipsis } from 'lucide-react'
import { Link } from 'react-router-dom'
import { buttonClassName } from '../../buttonStyles'
import type { ElectionManagement } from '../../../data/manageElection'

type AdminElectionActionsProps = {
  item: ElectionManagement
  layout?: 'row' | 'card'
  onCopyId: () => void
  onDuplicate: () => void
  onArchive: () => void
}

export function AdminElectionActions({
  item,
  layout = 'row',
  onCopyId,
  onDuplicate,
  onArchive,
}: AdminElectionActionsProps) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuId = useId()
  const { election } = item
  const showResults = Boolean(election.results) || election.status === 'ended'

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <div
      className={`flex ${
        layout === 'card'
          ? 'w-full flex-col gap-2'
          : 'min-w-40 flex-col items-stretch gap-2'
      }`}
    >
      <Link
        to={`/admin/elections/${election.id}`}
        className={buttonClassName({
          className: 'w-full',
        })}
      >
        Manage
      </Link>
      <Link
        to={`/elections/${election.id}`}
        className={buttonClassName({
          variant: 'secondary',
          className: 'w-full',
        })}
      >
        View Public Election
      </Link>
      <Link
        to={`/admin/elections/${election.id}/results`}
        className={buttonClassName({
          variant: 'ghost',
          className: 'w-full',
        })}
      >
        View Results & Audit
      </Link>
      <div className={`relative ${layout === 'card' ? '' : 'self-end'}`} ref={menuRef}>
        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-lg text-navy-muted hover:bg-slate-100 hover:text-navy"
          aria-label={`More actions for ${election.title}`}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen((value) => !value)}
        >
          <Ellipsis className="size-4" />
        </button>
        {open ? (
          <div
            id={menuId}
            role="menu"
            className="absolute right-0 z-20 mt-2 w-48 rounded-xl border border-border bg-white p-1 shadow-lg"
          >
            <button
              type="button"
              role="menuitem"
              className="flex w-full rounded-lg px-3 py-2 text-left text-sm text-navy hover:bg-slate-50"
              onClick={() => {
                setOpen(false)
                onCopyId()
              }}
            >
              Copy Election ID
            </button>
            <button
              type="button"
              role="menuitem"
              className="flex w-full rounded-lg px-3 py-2 text-left text-sm text-navy hover:bg-slate-50"
              onClick={() => {
                setOpen(false)
                onDuplicate()
              }}
            >
              Duplicate
            </button>
            <button
              type="button"
              role="menuitem"
              className="flex w-full rounded-lg px-3 py-2 text-left text-sm text-rose-700 hover:bg-rose-50"
              onClick={() => {
                setOpen(false)
                onArchive()
              }}
            >
              Archive
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
