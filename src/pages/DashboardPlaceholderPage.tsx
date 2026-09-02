import { useLocation } from 'react-router-dom'

const copy: Record<string, { title: string; description: string }> = {
  '/dashboard/votes': {
    title: 'My Votes',
    description:
      'A full history of your ballots will appear here in the next update.',
  },
  '/dashboard/transactions': {
    title: 'Transactions',
    description:
      'Your on-chain vote transactions will appear here in the next update.',
  },
  '/dashboard/profile': {
    title: 'Profile',
    description:
      'Voter profile and eligibility settings will appear here in the next update.',
  },
}

export function DashboardPlaceholderPage() {
  const { pathname } = useLocation()
  const page = copy[pathname] ?? {
    title: 'Dashboard',
    description: 'This section will appear here in the next update.',
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="text-2xl font-bold tracking-tight text-navy">{page.title}</h2>
      <div className="card mt-6 px-6 py-12 text-center">
        <p className="text-navy-muted">{page.description}</p>
      </div>
    </div>
  )
}
