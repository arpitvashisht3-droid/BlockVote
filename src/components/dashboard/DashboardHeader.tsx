import { Bell, Menu, Wallet } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useDemoAuth } from '../../context/DemoAuthContext'
import { connectWallet, getConnectedAccount } from '../../services/wallet'
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
  const { user } = useDemoAuth()
  const [wallet, setWallet] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  const title = titles[pathname] ?? 'Dashboard'
  const name = user?.name || 'Voter'
  const firstName = name.split(' ')[0]

  useEffect(() => {
    getConnectedAccount().then((acc) => {
      if (acc) setWallet(acc)
    })
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
        <Button
          onClick={handleConnect}
          className="hidden sm:inline-flex"
        >
          <Wallet className="size-4" aria-hidden="true" />
          {walletLabel}
        </Button>
        <div className="hidden items-center gap-2 sm:flex">
          <CandidateAvatar name={name} size="sm" />
          <span className="hidden text-sm font-medium text-navy lg:inline">
            {firstName}
          </span>
        </div>
      </div>
    </header>
  )
}
