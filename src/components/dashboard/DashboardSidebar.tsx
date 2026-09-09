import {
  CheckCircle2,
  CircleHelp,
  LayoutDashboard,
  LogOut,
  Receipt,
  Settings,
  UserRound,
  Vote,
  LucideIcon
} from 'lucide-react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useDemoAuth } from '../../context/DemoAuthContext'
import { CandidateAvatar } from '../elections/CandidateAvatar'
import { Logo } from '../Logo'

interface SidebarLinkItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

const mainLinks: SidebarLinkItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/dashboard/elections', label: 'Elections', icon: Vote },
  { to: '/dashboard/votes', label: 'My Votes', icon: CheckCircle2 },
  { to: '/dashboard/transactions', label: 'Transactions', icon: Receipt },
  { to: '/dashboard/profile', label: 'Profile', icon: UserRound },
]

const secondaryLinks: SidebarLinkItem[] = [
  { to: '/dashboard/settings', label: 'Settings', icon: Settings },
  { to: '/dashboard/help', label: 'Help & Support', icon: CircleHelp },
]

type DashboardSidebarProps = {
  onNavigate?: () => void
}

export function DashboardSidebar({ onNavigate }: DashboardSidebarProps) {
  const { user, logout } = useDemoAuth()
  const location = useLocation()
  const name = user?.name || 'Voter'
  const role = user?.role === 'admin' ? 'Administrator' : 'Registered Voter'

  const linkClass = (toPath: string, end?: boolean) => {
    const isActive = end
      ? location.pathname === toPath
      : location.pathname.startsWith(toPath)
    return `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
      isActive
        ? 'bg-accent text-white font-semibold shadow-md shadow-accent/20'
        : 'text-slate-300 hover:bg-white/10 hover:text-white'
    }`
  }

  return (
    <div className="flex h-full min-h-screen flex-col bg-navy text-white select-none">
      {/* Brand Header */}
      <div className="shrink-0 border-b border-white/10 px-5 py-5">
        <Logo variant="dark" to="/dashboard" />
      </div>

      {/* Main Navigation */}
      <nav className="flex flex-1 flex-col gap-1.5 p-4 overflow-y-auto" aria-label="Dashboard">
        {mainLinks.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={linkClass(item.to, item.end)}
            onClick={onNavigate}
          >
            <item.icon className="size-4 shrink-0" aria-hidden="true" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Secondary Options */}
      <div className="shrink-0 space-y-1.5 border-t border-white/10 p-4">
        {secondaryLinks.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={linkClass(item.to)}
            onClick={onNavigate}
          >
            <item.icon className="size-4 shrink-0" aria-hidden="true" />
            <span>{item.label}</span>
          </NavLink>
        ))}

        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-300 transition-all hover:bg-red-500/20 hover:text-red-300"
          onClick={() => {
            logout()
            onNavigate?.()
          }}
        >
          <LogOut className="size-4 shrink-0" aria-hidden="true" />
          <span>Logout</span>
        </button>
      </div>

      {/* Logged-in User Profile Summary Card at Bottom */}
      <div className="shrink-0 border-t border-white/10 p-4">
        <Link
          to="/dashboard/profile"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl bg-white/5 p-3 transition-colors hover:bg-white/10"
        >
          <CandidateAvatar name={name} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">
              {name}
            </p>
            <p className="truncate text-xs text-slate-400">{role}</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
