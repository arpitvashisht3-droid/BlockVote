import { useState, FormEvent, useEffect } from 'react'
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
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Load remembered credentials on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('blockvote_remembered_email')
    const savedRole = localStorage.getItem('blockvote_remembered_role') as DemoUserRole | null
    if (savedEmail) {
      setEmail(savedEmail)
      setRememberMe(true)
    }
    if (savedRole === 'admin' || savedRole === 'voter') {
      setSelectedRole(savedRole)
    }
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (rememberMe) {
        localStorage.setItem('blockvote_remembered_email', email.trim())
        localStorage.setItem('blockvote_remembered_role', selectedRole)
      } else {
        localStorage.removeItem('blockvote_remembered_email')
        localStorage.removeItem('blockvote_remembered_role')
      }

      const user = await signIn(email, password, selectedRole)
      const redirectParam = new URLSearchParams(window.location.search).get('redirect')
      if (redirectParam) {
        navigate(redirectParam)
      } else if (user.role === 'admin') {
        navigate('/admin/elections')
      } else {
        navigate('/dashboard/elections')
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col justify-center bg-gradient-to-br from-[#060D1A] via-[#0A1428] to-[#0D1B36] px-4 py-12 text-white sm:px-6 lg:px-8">
      {/* Background Decorative Blur */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 size-96 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 size-96 rounded-full bg-teal-500/15 blur-3xl" />
        {/* Extra bottom darkening overlay */}
        <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <div className="relative mx-auto w-full max-w-md">
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center">
          <Logo variant="dark" />
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm font-medium text-slate-200">
            Sign in to continue to BlockVote
          </p>
        </div>

        {/* Form Card — darker solid background */}
        <div className="mt-6 rounded-2xl border border-slate-700/80 bg-[#0B1528] p-6 shadow-2xl sm:p-8">
          {/* Role Selection Tabs */}
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-2">
              Select Sign In Role
            </label>
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-900 p-1 border border-slate-700">
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
              className="mb-5 rounded-xl border border-red-500/40 bg-red-950/60 p-3.5 text-sm font-semibold text-red-200"
            >
              {error}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label
                htmlFor="signin-email"
                className="block text-xs font-bold uppercase tracking-wider text-slate-200"
              >
                {selectedRole === 'admin' ? 'Conductor Email' : 'Voter Email'}
              </label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-300">
                  <Mail className="size-4" />
                </div>
                <input
                  id="signin-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    selectedRole === 'admin'
                      ? 'conductor@example.com'
                      : 'voter@example.com'
                  }
                  className="w-full rounded-xl border border-slate-600 bg-slate-900 py-2.5 pl-10 pr-3.5 text-sm text-white placeholder-slate-500 transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="signin-password"
                className="block text-xs font-bold uppercase tracking-wider text-slate-200"
              >
                Password
              </label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-300">
                  <Lock className="size-4" />
                </div>
                <input
                  id="signin-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-600 bg-slate-900 py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-500 transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 transition-colors hover:text-white"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2.5 pt-1">
              <input
                id="signin-remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="size-4 rounded border-slate-600 bg-slate-900 accent-accent cursor-pointer"
              />
              <label
                htmlFor="signin-remember-me"
                className="text-sm font-medium text-slate-200 cursor-pointer select-none hover:text-white transition-colors"
              >
                Remember me
              </label>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 py-3 text-sm font-bold shadow-lg shadow-accent/20"
            >
              {loading
                ? 'Signing in...'
                : selectedRole === 'admin'
                ? 'Sign In as Election Conductor'
                : 'Sign In as Voter'}
              {!loading && <ArrowRight className="size-4" />}
            </Button>
          </form>

          {/* Footer — high contrast, visible against dark card */}
          <div className="mt-6 border-t border-slate-700 pt-5 text-center text-sm font-semibold text-slate-100">
            Don&apos;t have an account?{' '}
            <Link
              to="/create-account"
              className="font-bold text-accent transition-colors hover:text-emerald-300 underline underline-offset-2 ml-1"
            >
              Create Account
            </Link>
          </div>
        </div>

        <p className="mt-8 text-center text-xs font-medium text-slate-400">
          BlockVote Cryptographic Democratic Voting System &bull; Sepolia Testnet
        </p>
      </div>
    </div>
  )
}
