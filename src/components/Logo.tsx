import { Vote } from 'lucide-react'
import { Link } from 'react-router-dom'

type LogoProps = {
  variant?: 'light' | 'dark'
  to?: string
}

export function Logo({ variant = 'light', to = '/' }: LogoProps) {
  const isDark = variant === 'dark'

  return (
    <Link to={to} className="inline-flex items-center gap-2.5">
      <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-white">
        <Vote className="size-5" aria-hidden="true" />
      </span>
      <span
        className={`text-lg font-bold tracking-tight ${
          isDark ? 'text-white' : 'text-navy'
        }`}
      >
        BlockVote
      </span>
    </Link>
  )
}
