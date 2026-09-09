import { Receipt, ExternalLink, ShieldCheck, ArrowUpRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getConnectedAccount } from '../services/wallet'

export function TransactionsPage() {
  const [wallet, setWallet] = useState<string | null>(null)

  useEffect(() => {
    getConnectedAccount().then((acc) => {
      if (acc) setWallet(acc)
    })
  }, [])

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy sm:text-3xl">
          Blockchain Transactions
        </h1>
        <p className="mt-1 text-sm text-navy-muted sm:text-base">
          Track transaction hashes, gas usage, and Sepolia testnet execution records.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="text-xs font-semibold text-navy-muted uppercase tracking-wider">Network</p>
          <p className="mt-2 text-xl font-bold text-navy">Sepolia Testnet</p>
          <p className="text-xs text-accent mt-1">Chain ID: 11155111</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-semibold text-navy-muted uppercase tracking-wider">Connected Wallet</p>
          <p className="mt-2 font-mono text-sm font-bold text-navy truncate">
            {wallet || 'Not connected'}
          </p>
          <p className="text-xs text-navy-muted mt-1">MetaMask / Web3 Provider</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-semibold text-navy-muted uppercase tracking-wider">Smart Contract</p>
          <p className="mt-2 font-mono text-sm font-bold text-navy truncate">
            0x69f9...A247
          </p>
          <p className="text-xs text-accent mt-1">BlockVote Main Contract</p>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-base font-bold text-navy flex items-center gap-2 border-b border-border pb-4">
          <Receipt className="size-5 text-accent" /> On-Chain Activity Log
        </h2>

        <div className="mt-6 flex flex-col items-center justify-center p-8 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Receipt className="size-6" />
          </div>
          <p className="mt-3 text-sm font-bold text-navy">No recent blockchain transactions</p>
          <p className="mt-1 text-xs text-navy-muted max-w-sm">
            When you cast votes or perform administrative actions, your Sepolia transaction logs will appear here.
          </p>
          {wallet ? (
            <a
              href={`https://sepolia.etherscan.io/address/${wallet}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-accent-hover"
            >
              <span>View Address on Sepolia Etherscan</span>
              <ArrowUpRight className="size-3.5" />
            </a>
          ) : null}
        </div>
      </div>
    </div>
  )
}
