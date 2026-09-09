import { BarChart3, Plus, Receipt, Vote } from 'lucide-react'
import { Link } from 'react-router-dom'

const actions = [
  { to: '/admin/elections/create', label: 'Create New Election', icon: Plus },
  { to: '/admin/elections', label: 'Manage Elections', icon: Vote },
  { to: '/admin/results', label: 'View Results', icon: BarChart3 },
  { to: '/admin/transactions', label: 'View Transactions', icon: Receipt },
] as const

export function AdminQuickActions() {
  return (
    <section>
      <h2 className="text-lg font-bold text-navy">Quick Actions</h2>
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {actions.map(({ to, label, icon: Icon }) => (
          <Link
            key={label}
            to={to}
            className="card flex items-center gap-3 p-4 transition-shadow hover:shadow-md"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <span className="text-sm font-semibold text-navy">{label}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
