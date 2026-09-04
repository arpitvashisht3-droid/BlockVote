import { Bell, Menu, Wallet } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { voterProfile } from '../../data/dashboard'
import { Button } from '../Button'
import { CandidateAvatar } from '../elections/CandidateAvatar'

const titles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/votes': 'My Votes',
  '/dashboard/transactions': 'Transactions',
  '/dashboard/profile': 'Profile',
}

type DashboardHeaderProps = {
  onMenuClick: () => void
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const { pathname } = useLocation()
  const title = titles[pathname] ?? 'Dashboard'

  return (
    <header className="flex h-16 items-center justify-between gap-3 border-b border-border bg-white px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-lg text-navy md:hidden"
          aria-label="Open dashboard menu"
          onClick={onMenuClick}
        >
          <Menu className="size-5" />
        </button>
        <h1 className="truncate text-base font-semibold text-navy sm:text-lg">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-lg text-navy-muted transition-colors hover:bg-slate-100 hover:text-navy"
          aria-label="Notifications"
        >
          <Bell className="size-5" />
        </button>
        <Button className="hidden sm:inline-flex">
          <Wallet className="size-4" aria-hidden="true" />
          Connect Wallet
        </Button>
        <div className="hidden items-center gap-2 sm:flex">
          <CandidateAvatar name={voterProfile.name} size="sm" />
          <span className="hidden text-sm font-medium text-navy lg:inline">
            {voterProfile.firstName}
          </span>
        </div>
      </div>
    </header>
  )
}
