import { CheckCircle2, Receipt, UserRound, Vote } from 'lucide-react'
import { Link } from 'react-router-dom'

const actions = [
  { to: '/elections', label: 'Explore Elections', icon: Vote },
  { to: '/dashboard/votes', label: 'My Votes', icon: CheckCircle2 },
  { to: '/dashboard/transactions', label: 'Transactions', icon: Receipt },
  { to: '/dashboard/profile', label: 'Profile', icon: UserRound },
] as const

export function QuickActions() {
  return (
    <section>
      <h2 className="text-lg font-bold text-navy">Quick actions</h2>
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {actions.map(({ to, label, icon: Icon }) => (
          <Link
            key={label}
            to={to}
            className="card flex items-center gap-3 p-4 transition-shadow hover:shadow-md"
          >
            <span className="flex size-9 items-center justify-center rounded-lg bg-accent-soft text-accent">
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <span className="text-sm font-semibold text-navy">{label}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
