import {
  CheckCircle2,
  CircleHelp,
  LayoutDashboard,
  LogOut,
  Receipt,
  Settings,
  UserRound,
  Vote,
} from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { useDemoAuth } from '../../context/DemoAuthContext'
import { CandidateAvatar } from '../elections/CandidateAvatar'
import { Logo } from '../Logo'

const mainLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/elections', label: 'Elections', icon: Vote },
  { to: '/dashboard/votes', label: 'My Votes', icon: CheckCircle2 },
  { to: '/dashboard/transactions', label: 'Transactions', icon: Receipt },
  { to: '/dashboard/profile', label: 'Profile', icon: UserRound },
] as const

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-accent text-white'
      : 'text-slate-300 hover:bg-white/5 hover:text-white'
  }`

type DashboardSidebarProps = {
  onNavigate?: () => void
}

export function DashboardSidebar({ onNavigate }: DashboardSidebarProps) {
  const { user, logout } = useDemoAuth()
  const name = user?.name || 'Voter'
  const role = user?.role === 'admin' ? 'Administrator' : 'Registered Voter'

  return (
    <div className="flex h-full flex-col bg-navy text-white">
      <div className="border-b border-white/10 px-5 py-5">
        <Logo variant="dark" to="/dashboard" />
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-4" aria-label="Dashboard">
        {mainLinks.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            end={'end' in item ? item.end : undefined}
            className={linkClass}
            onClick={onNavigate}
          >
            <item.icon className="size-4" aria-hidden="true" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-1 border-t border-white/10 p-4">
        <Link
          to="/dashboard/profile"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white"
          onClick={onNavigate}
        >
          <Settings className="size-4" aria-hidden="true" />
          Settings
        </Link>
        <a
          href="mailto:hello@blockvote.app"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white"
        >
          <CircleHelp className="size-4" aria-hidden="true" />
          Help & Support
        </a>
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white"
          onClick={() => {
            logout()
            onNavigate?.()
          }}
        >
          <LogOut className="size-4" aria-hidden="true" />
          Logout
        </button>
      </div>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-3">
          <CandidateAvatar name={name} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {name}
            </p>
            <p className="text-xs text-slate-400">{role}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
