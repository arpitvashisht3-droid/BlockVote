import { CircleHelp, Mail, ShieldCheck, FileText, ExternalLink } from 'lucide-react'

export function HelpPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy sm:text-3xl">
          Help & Support Center
        </h1>
        <p className="mt-1 text-sm text-navy-muted sm:text-base">
          Frequently asked questions, blockchain voting guides, and contact channels.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="card p-6 space-y-3">
          <ShieldCheck className="size-8 text-accent" />
          <h3 className="text-base font-bold text-navy">How is my vote secured?</h3>
          <p className="text-xs text-navy-muted leading-relaxed">
            BlockVote signs your vote using your Web3 wallet address and records it on the Ethereum Sepolia blockchain. Once confirmed, zero-knowledge principles ensure ballot secrecy while keeping election tallies publicly verifiable.
          </p>
        </div>

        <div className="card p-6 space-y-3">
          <CircleHelp className="size-8 text-accent" />
          <h3 className="text-base font-bold text-navy">Need Sepolia ETH for gas?</h3>
          <p className="text-xs text-navy-muted leading-relaxed">
            Voting transactions use the Sepolia testnet. You can claim free testnet ETH from authorized Sepolia faucets using your wallet address.
          </p>
        </div>
      </div>

      <div className="card p-6 border-l-4 border-l-accent">
        <h3 className="text-base font-bold text-navy flex items-center gap-2">
          <Mail className="size-5 text-accent" /> Contact Technical Support
        </h3>
        <p className="mt-2 text-xs text-navy-muted">
          For voter assistance or technical queries regarding smart contract deployment:
        </p>
        <p className="mt-1 text-sm font-semibold text-navy">
          Support Email: <a href="mailto:support@blockvote.app" className="text-accent underline">support@blockvote.app</a>
        </p>
      </div>
    </div>
  )
}
