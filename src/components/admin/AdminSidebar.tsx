import {
  CircleHelp,
  LayoutDashboard,
  LogOut,
  Plus,
  Receipt,
  Settings,
  Trophy,
  UserRound,
  Vote,
} from 'lucide-react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useDemoAuth } from '../../context/DemoAuthContext'
import { CandidateAvatar } from '../elections/CandidateAvatar'
import { Logo } from '../Logo'

const mainLinks = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/elections', label: 'Elections', icon: Vote, end: true },
  { to: '/admin/elections/create', label: 'Create Election', icon: Plus },
  { to: '/admin/candidates', label: 'Candidates', icon: UserRound },
  { to: '/admin/results', label: 'Results', icon: Trophy },
  { to: '/admin/transactions', label: 'Transactions', icon: Receipt },
] as const

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-accent text-white'
      : 'text-slate-300 hover:bg-white/5 hover:text-white'
  }`

type AdminSidebarProps = {
  onNavigate?: () => void
}

export function AdminSidebar({ onNavigate }: AdminSidebarProps) {
  const { user, logout } = useDemoAuth()
  const navigate = useNavigate()

  const displayName = user?.name || 'Election Conductor'
  const displayRole = user?.role === 'admin' ? 'Election Conductor' : 'Administrator'

  const handleLogout = () => {
    logout()
    if (onNavigate) onNavigate()
    navigate('/')
  }

  return (
    <div className="flex h-full flex-col bg-navy text-white">
      <div className="border-b border-white/10 px-5 py-5">
        <Logo variant="dark" to="/admin" />
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-4" aria-label="Admin">
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
        <NavLink
          to="/admin/settings"
          className={linkClass}
          onClick={onNavigate}
        >
          <Settings className="size-4" aria-hidden="true" />
          Settings
        </NavLink>
        <NavLink
          to="/admin/help"
          className={linkClass}
          onClick={onNavigate}
        >
          <CircleHelp className="size-4" aria-hidden="true" />
          Help & Support
        </NavLink>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
        >
          <LogOut className="size-4" aria-hidden="true" />
          Logout
        </button>
      </div>

      <div className="border-t border-white/10 p-4">
        <Link
          to="/admin/profile"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-3 hover:bg-white/10 transition-colors"
        >
          <CandidateAvatar name={displayName} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {displayName}
            </p>
            <p className="text-xs text-slate-400">{displayRole}</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
