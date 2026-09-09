import { Bell, Menu, Wallet, UserRound, LogOut, ChevronDown, BadgeCheck, Shield } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDemoAuth } from '../../context/DemoAuthContext'
import { connectWallet, getConnectedAccount } from '../../services/wallet'
import { Button } from '../Button'
import { CandidateAvatar } from '../elections/CandidateAvatar'

const titles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/elections': 'Elections',
  '/dashboard/votes': 'My Votes',
  '/dashboard/transactions': 'Transactions',
  '/dashboard/profile': 'Profile',
  '/dashboard/settings': 'Settings',
  '/dashboard/help': 'Help & Support',
}

type DashboardHeaderProps = {
  onMenuClick: () => void
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useDemoAuth()
  const [wallet, setWallet] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const title = titles[pathname] ?? 'Dashboard'
  const name = user?.name || 'Voter'
  const email = user?.email || 'voter@blockvote.app'
  const firstName = name.split(' ')[0]
  const isVerified = user?.isVerified !== false
  const roleLabel = user?.role === 'admin' ? 'Election Conductor' : 'Verified Voter'

  useEffect(() => {
    getConnectedAccount().then((acc) => {
      if (acc) setWallet(acc)
    })
  }, [])

  // Close dropdown on click outside & Escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  async function handleConnect() {
    setIsConnecting(true)
    try {
      const acc = await connectWallet()
      if (acc) setWallet(acc)
    } finally {
      setIsConnecting(false)
    }
  }

  const walletLabel = isConnecting
    ? 'Connecting...'
    : wallet
    ? `${wallet.substring(0, 6)}...${wallet.substring(wallet.length - 4)}`
    : 'Connect Wallet'

  const formattedWallet = wallet
    ? `${wallet.substring(0, 6)}...${wallet.substring(wallet.length - 4)}`
    : (user?.walletAddress ? `${user.walletAddress.substring(0, 6)}...${user.walletAddress.substring(user.walletAddress.length - 4)}` : 'Not Connected')

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

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Notifications Button */}
        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-lg text-navy-muted transition-colors hover:bg-slate-100 hover:text-navy"
          aria-label="Notifications"
        >
          <Bell className="size-5" />
        </button>

        {/* Connect Wallet Button */}
        <Button
          onClick={handleConnect}
          className="hidden sm:inline-flex"
        >
          <Wallet className="size-4" aria-hidden="true" />
          {walletLabel}
        </Button>

        {/* User Profile Button & Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 rounded-full p-1 transition-all hover:bg-slate-100 sm:rounded-xl sm:px-2.5 sm:py-1.5 focus:outline-none focus:ring-2 focus:ring-accent/40"
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
          >
            <CandidateAvatar name={name} size="sm" />
            <span className="hidden text-sm font-semibold text-navy lg:inline">
              {firstName}
            </span>
            <ChevronDown className={`hidden size-4 text-navy-muted transition-transform sm:inline ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Profile Dropdown Popover */}
          {dropdownOpen ? (
            <div className="absolute right-0 mt-2 w-72 origin-top-right rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl ring-1 ring-black/5 z-50 animate-in fade-in zoom-in-95 duration-100">
              {/* Header Info */}
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <CandidateAvatar name={name} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-navy">{name}</p>
                  <p className="truncate text-xs text-slate-500">{email}</p>
                </div>
              </div>

              {/* Status & Wallet Details */}
              <div className="my-3 space-y-2.5 rounded-xl bg-slate-50 p-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Wallet className="size-3.5 text-accent" /> Wallet
                  </span>
                  <span className="font-mono font-semibold text-navy">{formattedWallet}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    {user?.role === 'admin' ? <Shield className="size-3.5 text-accent" /> : <BadgeCheck className="size-3.5 text-accent" />} Status
                  </span>
                  <span className="font-semibold text-accent">{roleLabel}</span>
                </div>
              </div>

              {/* Dropdown Options */}
              <div className="space-y-1 pt-1">
                <Link
                  to="/dashboard/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-navy transition-colors hover:bg-slate-100"
                >
                  <UserRound className="size-4 text-slate-500" />
                  <span>View Profile</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false)
                    logout()
                    navigate('/signin')
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                >
                  <LogOut className="size-4 text-red-500" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}
