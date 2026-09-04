import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail, User, ArrowRight, ArrowLeft } from 'lucide-react'
import { useDemoAuth } from '../context/DemoAuthContext'
import { Logo } from '../components/Logo'
import { Button } from '../components/Button'

/**
 * FRONTEND-ONLY DEMO CREATE ACCOUNT PAGE
 * Note: This page operates exclusively in frontend demo mode.
 * It creates a presentation demo session and does NOT query or mutate backend/Supabase databases.
 */

export function CreateAccountPage() {
  const navigate = useNavigate()
  const { createAccount } = useDemoAuth()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!fullName.trim()) {
      setError('Please enter your full name.')
      return
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      await createAccount(fullName, email, password)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to create demo account.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col justify-center bg-gradient-to-b from-navy to-navy-dark px-4 py-12 text-white sm:px-6 lg:px-8">
      {/* Background Blur */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 size-96 rounded-full bg-teal-500/15 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 size-96 rounded-full bg-accent/15 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-md">
        {/* Top Back Link */}
        <Link
          to="/signin"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300 transition-colors hover:text-accent"
        >
          <ArrowLeft className="size-4" />
          Back to Sign In
        </Link>

        {/* Header */}
        <div className="mt-4 flex flex-col items-center text-center">
          <Logo variant="dark" />
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Create Demo Account
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            Join BlockVote for presentation & testing
          </p>
        </div>

        {/* Form Card */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-navy-light/80 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
          {error ? (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-sm text-red-200"
            >
              {error}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="fullName"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
              >
                Full Name
              </label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <User className="size-4" />
                </div>
                <input
                  id="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alex Morgan"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3.5 text-sm text-white placeholder-slate-400 transition-colors focus:border-accent focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
              >
                Email Address
              </label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Mail className="size-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3.5 text-sm text-white placeholder-slate-400 transition-colors focus:border-accent focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
              >
                Password
              </label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock className="size-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-400 transition-colors focus:border-accent focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-accent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 transition-colors hover:text-white"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
              >
                Confirm Password
              </label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock className="size-4" />
                </div>
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3.5 text-sm text-white placeholder-slate-400 transition-colors focus:border-accent focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="mt-4 flex w-full items-center justify-center gap-2 py-3 text-sm font-semibold"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
              {!loading && <ArrowRight className="size-4" />}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-300">
            Already have an account?{' '}
            <Link
              to="/signin"
              className="font-semibold text-accent transition-colors hover:text-accent-hover underline"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
