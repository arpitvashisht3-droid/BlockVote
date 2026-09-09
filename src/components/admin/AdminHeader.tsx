import { useEffect, useRef, useState } from 'react'
import { Bell, ChevronDown, CircleHelp, LogOut, Menu, Settings, User } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDemoAuth } from '../../context/DemoAuthContext'
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
  '/admin/profile': {
    title: 'Conductor Profile',
    subtitle: 'Manage your election conductor profile and security details.',
  },
  '/admin/settings': {
    title: 'Settings',
    subtitle: 'Manage election defaults and application preferences.',
  },
  '/admin/help': {
    title: 'Help & Support',
    subtitle: 'Election conductor documentation, FAQs, and support resources.',
  },
}

type AdminHeaderProps = {
  onMenuClick: () => void
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useDemoAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

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

  const displayName = user?.name || 'Election Conductor'
  const displayEmail = user?.email || 'admin@blockvote.io'
  const displayRole = user?.role === 'admin' ? 'Election Conductor' : 'Administrator'

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setDropdownOpen(false)
    }

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [dropdownOpen])

  const handleLogout = () => {
    setDropdownOpen(false)
    logout()
    navigate('/')
  }

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

        {/* Profile Dropdown Container */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-xl p-1.5 transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-accent/30"
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
          >
            <CandidateAvatar name={displayName} size="sm" />
            <div className="hidden text-left sm:block">
              <span className="block text-sm font-semibold text-navy leading-none">
                {displayName}
              </span>
              <span className="block text-[11px] font-medium text-accent leading-tight mt-0.5">
                {displayRole}
              </span>
            </div>
            <ChevronDown className={`size-4 text-navy-muted transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Profile Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 origin-top-right rounded-2xl border border-border bg-white p-2 shadow-xl ring-1 ring-black/5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="border-b border-border px-3 py-3">
                <p className="text-sm font-bold text-navy truncate">{displayName}</p>
                <p className="text-xs text-navy-muted truncate mt-0.5">{displayEmail}</p>
                <span className="mt-2 inline-flex items-center rounded-md bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">
                  {displayRole}
                </span>
              </div>

              <div className="py-1">
                <Link
                  to="/admin/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-navy transition-colors hover:bg-slate-50"
                >
                  <User className="size-4 text-navy-muted" />
                  My Profile
                </Link>

                <Link
                  to="/admin/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-navy transition-colors hover:bg-slate-50"
                >
                  <Settings className="size-4 text-navy-muted" />
                  Settings
                </Link>

                <Link
                  to="/admin/help"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-navy transition-colors hover:bg-slate-50"
                >
                  <CircleHelp className="size-4 text-navy-muted" />
                  Help & Support
                </Link>
              </div>

              <div className="border-t border-border pt-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50"
                >
                  <LogOut className="size-4" />
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
