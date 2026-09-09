import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail, Shield, Vote, ArrowRight } from 'lucide-react'
import { useDemoAuth, type DemoUserRole } from '../context/DemoAuthContext'
import { Logo } from '../components/Logo'
import { Button } from '../components/Button'

export function SignInPage() {
  const navigate = useNavigate()
  const { signIn } = useDemoAuth()

  const [selectedRole, setSelectedRole] = useState<DemoUserRole>('voter')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const user = await signIn(email, password, selectedRole)
      if (user.role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/dashboard')
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col justify-center bg-gradient-to-b from-navy to-navy-dark px-4 py-12 text-white sm:px-6 lg:px-8">
      {/* Background Decorative Blur */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 size-96 rounded-full bg-accent/15 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 size-96 rounded-full bg-teal-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-md">
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center">
          <Logo variant="dark" />
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            Sign in to continue to BlockVote
          </p>
        </div>

        {/* Form Card */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-navy-light/80 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
          {/* Role Selection Tabs */}
          <div className="mb-6">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Select Sign In Role
            </label>
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-white/5 p-1 border border-white/10">
              <button
                type="button"
                id="role-voter-button"
                onClick={() => setSelectedRole('voter')}
                className={`flex items-center justify-center gap-2 rounded-lg py-2.5 px-3 text-xs sm:text-sm font-semibold transition-all ${
                  selectedRole === 'voter'
                    ? 'bg-accent text-white shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Vote className="size-4" />
                <span>Voter</span>
              </button>
              <button
                type="button"
                id="role-conductor-button"
                onClick={() => setSelectedRole('admin')}
                className={`flex items-center justify-center gap-2 rounded-lg py-2.5 px-3 text-xs sm:text-sm font-semibold transition-all ${
                  selectedRole === 'admin'
                    ? 'bg-accent text-white shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Shield className="size-4" />
                <span>Election Conductor</span>
              </button>
            </div>
          </div>

          {error ? (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-sm text-red-200"
            >
              {error}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
              >
                {selectedRole === 'admin' ? 'Conductor Email' : 'Voter Email'}
              </label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Mail className="size-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    selectedRole === 'admin'
                      ? 'conductor@example.com'
                      : 'voter@example.com'
                  }
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
              <div className="relative mt-2">
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

            <Button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 py-3 text-sm font-semibold"
            >
              {loading
                ? 'Signing in...'
                : selectedRole === 'admin'
                ? 'Sign In as Election Conductor'
                : 'Sign In as Voter'}
              {!loading && <ArrowRight className="size-4" />}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-300">
            Don't have an account?{' '}
            <Link
              to="/create-account"
              className="font-semibold text-accent transition-colors hover:text-accent-hover underline"
            >
              Create Account
            </Link>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">
          BlockVote Cryptographic Democratic Voting System &bull; Sepolia Testnet
        </p>
      </div>
    </div>
  )
}
