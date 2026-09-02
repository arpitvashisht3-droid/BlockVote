import { useLocation } from 'react-router-dom'

const copy: Record<string, { title: string; description: string }> = {
  '/admin/transactions': {
    title: 'Transactions',
    description:
      'On-chain transaction monitoring will appear here in the next update.',
  },
}

export function AdminPlaceholderPage() {
  const { pathname } = useLocation()
  const page = copy[pathname] ?? {
    title: 'Admin',
    description: 'This admin section will appear here in the next update.',
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
