import { Bell, Menu } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { adminProfile } from '../../data/admin'
import { CandidateAvatar } from '../elections/CandidateAvatar'

const pageCopy: Record<string, { title: string; subtitle: string }> = {
  '/admin': {
    title: 'Admin Dashboard',
    subtitle: 'Manage elections, monitor participation, and verify results.',
  },
  '/admin/elections': {
    title: 'Elections',
    subtitle: 'Create, monitor, and manage all your elections.',
  },
  '/admin/elections/create': {
    title: 'Create New Election',
    subtitle:
      'Set up your election, add candidates, configure voting rules, and publish when ready.',
  },
  '/admin/candidates': {
    title: 'Candidate Management',
    subtitle: 'Manage candidates across your elections.',
  },
  '/admin/results': {
    title: 'Election Results',
    subtitle: 'Monitor election performance and review voting results.',
  },
  '/admin/transactions': {
    title: 'Transactions',
    subtitle: 'Inspect on-chain voting activity.',
  },
}

type AdminHeaderProps = {
  onMenuClick: () => void
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const { pathname } = useLocation()
  const copy =
    pageCopy[pathname] ??
    (pathname.startsWith('/admin/elections/')
      ? {
          title: 'Manage Election',
          subtitle: 'Election controls and publishing tools.',
        }
      : {
          title: 'Admin Dashboard',
          subtitle:
            'Manage elections, monitor participation, and verify results.',
        })

  return (
    <header className="flex min-h-16 items-center justify-between gap-3 border-b border-border bg-white px-4 py-3 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-lg text-navy md:hidden"
          aria-label="Open admin menu"
          onClick={onMenuClick}
        >
          <Menu className="size-5" />
        </button>
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold text-navy sm:text-lg">
            {copy.title}
          </h1>
          <p className="hidden truncate text-xs text-navy-muted sm:block">
            {copy.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-lg text-navy-muted transition-colors hover:bg-slate-100 hover:text-navy"
          aria-label="Notifications"
        >
          <Bell className="size-5" />
        </button>
        <div className="flex items-center gap-2">
          <CandidateAvatar name={adminProfile.name} size="sm" />
          <span className="hidden text-sm font-medium text-navy sm:inline">
            Admin
          </span>
        </div>
      </div>
    </header>
  )
}
