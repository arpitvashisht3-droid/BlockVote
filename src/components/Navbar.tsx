import { Menu, Wallet, X } from 'lucide-react'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Button } from './Button'
import { Logo } from './Logo'
import { connectWallet } from '../services/wallet'

type NavItem =
  | { kind: 'route'; to: string; label: string; end?: boolean }
  | { kind: 'hash'; href: string; label: string }

const navItems: NavItem[] = [
  { kind: 'route', to: '/', label: 'Home', end: true },
  { kind: 'route', to: '/elections', label: 'Elections' },
  { kind: 'hash', href: '/#features', label: 'Features' },
  { kind: 'hash', href: '/#about', label: 'About' },
  { kind: 'hash', href: '/#contact', label: 'Contact' },
]

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `relative rounded-md px-3 py-2 text-sm font-medium transition-colors md:flex md:h-16 md:items-center md:rounded-none md:py-0 ${
    isActive
      ? "text-accent md:after:absolute md:after:inset-x-3 md:after:bottom-0 md:after:h-0.5 md:after:bg-accent md:after:content-['']"
      : 'text-navy-muted hover:text-navy'
  }`

const hashLinkClass =
  'rounded-md px-3 py-2 text-sm font-medium text-navy-muted transition-colors hover:text-navy md:flex md:h-16 md:items-center md:rounded-none md:py-0'

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  async function handleConnectWallet() {
    setIsConnecting(true)
    try {
      const address = await connectWallet()
      if (address) {
        setWalletAddress(address)
      }
    } catch (err) {
      console.warn('[Navbar] Failed to connect wallet:', err)
    } finally {
      setIsConnecting(false)
    }
  }

  const walletButtonLabel = isConnecting
    ? 'Connecting...'
    : walletAddress
      ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`
      : 'Connect Wallet'

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />

        <nav className="hidden items-center md:flex" aria-label="Primary">
          {navItems.map((item) =>
            item.kind === 'route' ? (
              <NavLink
                key={item.label}
                to={item.to}
                end={item.end}
                className={navLinkClass}
              >
                {item.label}
              </NavLink>
            ) : (
              <a key={item.label} href={item.href} className={hashLinkClass}>
                {item.label}
              </a>
            ),
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <NavLink
            to="/signin"
            className="rounded-lg border border-border px-3.5 py-2 text-sm font-medium text-navy transition-colors hover:bg-slate-50"
          >
            Sign In
          </NavLink>
          <Button onClick={handleConnectWallet} disabled={isConnecting}>
            <Wallet className="size-4" aria-hidden="true" />
            {walletButtonLabel}
          </Button>
        </div>

        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-lg text-navy md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
          <span className="sr-only">Toggle navigation</span>
        </button>
      </div>

      {open ? (
        <div
          id="mobile-nav"
          className="border-t border-border bg-white px-4 py-4 md:hidden"
        >
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {navItems.map((item) =>
              item.kind === 'route' ? (
                <NavLink
                  key={item.label}
                  to={item.to}
                  end={item.end}
                  className={navLinkClass}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </NavLink>
              ) : (
                <a
                  key={item.label}
                  href={item.href}
                  className={hashLinkClass}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </a>
              ),
            )}
          </nav>
          <Button onClick={handleConnectWallet} disabled={isConnecting} className="mt-4 w-full">
            <Wallet className="size-4" aria-hidden="true" />
            {walletButtonLabel}
          </Button>
        </div>
      ) : null}
    </header>
  )
}
