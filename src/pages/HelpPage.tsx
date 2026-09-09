import { CircleHelp, Mail, ShieldCheck, FileText, KeyRound, Users, AlertTriangle } from 'lucide-react'
import { useDemoAuth } from '../context/DemoAuthContext'

export function HelpPage() {
  const { user } = useDemoAuth()
  const isConductor = user?.role === 'admin'

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy sm:text-3xl">
          {isConductor ? 'Election Conductor Knowledge Base' : 'Help & Support Center'}
        </h1>
        <p className="mt-1 text-sm text-navy-muted sm:text-base">
          {isConductor
            ? 'Complete guide on configuring elections, secret codes, voter caps, and discarded vote management.'
            : 'Frequently asked questions, eligibility guidelines, and blockchain security information.'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="card p-6 space-y-3">
          <KeyRound className="size-8 text-accent" />
          <h3 className="text-base font-bold text-navy">Secret Codes & Eligibility</h3>
          <p className="text-xs text-navy-muted leading-relaxed">
            Secret codes are required for all elections to prevent unauthorized voting. Conductor secret codes are hashed with bcrypt server-side. For College and University elections, voters must also provide their Enrollment Number and College ID code.
          </p>
        </div>

        <div className="card p-6 space-y-3">
          <Users className="size-8 text-accent" />
          <h3 className="text-base font-bold text-navy">Voter Capacity Caps</h3>
          <p className="text-xs text-navy-muted leading-relaxed">
            Conductors can configure a Maximum Voter Capacity Cap during election creation. Once the total participation count reaches the cap, eligibility verification blocks any further vote casting.
          </p>
        </div>

        <div className="card p-6 space-y-3">
          <AlertTriangle className="size-8 text-amber-500" />
          <h3 className="text-base font-bold text-navy">Discarded Vote Management</h3>
          <p className="text-xs text-navy-muted leading-relaxed">
            If an invalid or non-compliant ballot occurs, conductors can mark a vote as discarded with a mandatory detailed reason. Discarded votes are recorded in an audit trail without revealing the voter's choice.
          </p>
        </div>

        <div className="card p-6 space-y-3">
          <ShieldCheck className="size-8 text-accent" />
          <h3 className="text-base font-bold text-navy">Ballot Anonymity</h3>
          <p className="text-xs text-navy-muted leading-relaxed">
            BlockVote strictly separates participation records (who voted) from vote tallies (how candidates fared). Individual ballot choices are never stored alongside voter identities.
          </p>
        </div>
      </div>

      <div className="card p-6 border-l-4 border-l-accent">
        <h3 className="text-base font-bold text-navy flex items-center gap-2">
          <Mail className="size-5 text-accent" /> Technical & Conductor Support
        </h3>
        <p className="mt-2 text-xs text-navy-muted">
          Need assistance with smart contract verification or election setup? Contact our support team:
        </p>
        <p className="mt-1 text-sm font-semibold text-navy">
          Support Email: <a href="mailto:support@blockvote.app" className="text-accent underline">support@blockvote.app</a>
        </p>
      </div>
    </div>
  )
}
