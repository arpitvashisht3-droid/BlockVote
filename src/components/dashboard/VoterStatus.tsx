import { BadgeCheck, Mail, Wallet } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useDemoAuth } from '../../context/DemoAuthContext'
import { getConnectedAccount } from '../../services/wallet'

export function VoterStatus() {
  const { user } = useDemoAuth()
  const [wallet, setWallet] = useState<string | null>(null)

  useEffect(() => {
    getConnectedAccount().then((acc) => {
      if (acc) setWallet(acc)
    })
  }, [])

  const displayWallet = wallet
    ? `${wallet.substring(0, 6)}...${wallet.substring(wallet.length - 4)}`
    : 'Not connected'

  return (
    <section className="card p-5 sm:p-6">
      <h2 className="text-lg font-bold text-navy">Voter Status</h2>
      <dl className="mt-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <dt className="inline-flex items-center gap-2 text-sm text-navy-muted">
            <BadgeCheck className="size-4 text-accent" aria-hidden="true" />
            Status
          </dt>
          <dd className="text-sm font-semibold text-accent">
            {user ? 'Verified Voter' : 'Guest'}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="inline-flex items-center gap-2 text-sm text-navy-muted">
            <Mail className="size-4 text-navy-muted" aria-hidden="true" />
            Account
          </dt>
          <dd className="truncate text-sm font-semibold text-navy">
            {user?.email || '—'}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="inline-flex items-center gap-2 text-sm text-navy-muted">
            <Wallet className="size-4 text-navy-muted" aria-hidden="true" />
            Wallet
          </dt>
          <dd className="font-mono text-sm font-semibold text-navy">
            {displayWallet}
          </dd>
        </div>
      </dl>
    </section>
  )
}
