import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail, User, Shield, Vote, ArrowRight, ArrowLeft, Phone, Calendar, MapPin, AtSign, Globe } from 'lucide-react'
import { useDemoAuth, type DemoUserRole } from '../context/DemoAuthContext'
import { Logo } from '../components/Logo'
import { Button } from '../components/Button'

export function CreateAccountPage() {
  const navigate = useNavigate()
  const { createAccount } = useDemoAuth()

  const [selectedRole, setSelectedRole] = useState<DemoUserRole>('voter')
  
  // Account Details
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Personal Details
  const [phone, setPhone] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [country, setCountry] = useState('')
  const [state, setState] = useState('')
  const [city, setCity] = useState('')

  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!fullName.trim()) {
      setError('Please enter your full name.')
      return
    }

    if (!username.trim() || username.trim().length < 3) {
      setError('Username must be at least 3 characters.')
      return
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const user = await createAccount({
        name: fullName,
        username: username.trim().toLowerCase(),
        email,
        password,
        phone,
        dateOfBirth,
        country,
        state,
        city,
        role: selectedRole
      })

      // Save credentials if Remember Me is checked
      if (rememberMe) {
        localStorage.setItem('blockvote_remembered_email', email.trim())
        localStorage.setItem('blockvote_remembered_role', selectedRole)
      } else {
        localStorage.removeItem('blockvote_remembered_email')
        localStorage.removeItem('blockvote_remembered_role')
      }

      const redirectParam = new URLSearchParams(window.location.search).get('redirect')
      if (redirectParam) {
        navigate(redirectParam)
      } else if (user.role === 'admin') {
        navigate('/admin/elections')
      } else {
        navigate('/dashboard/elections')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please check if username or email is already taken.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col justify-center bg-gradient-to-br from-[#060D1A] via-[#0A1428] to-[#0D1B36] px-4 py-12 text-white sm:px-6 lg:px-8">
      {/* Decorative Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 size-96 rounded-full bg-teal-500/15 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 size-96 rounded-full bg-accent/15 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-2xl">
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
            Create Account
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            Join BlockVote secure decentralized voting platform
          </p>
        </div>

        {/* Form Card */}
        <div className="mt-6 rounded-2xl border border-slate-700/80 bg-[#0B1528] p-6 shadow-2xl sm:p-8">
          {/* Role Selection Tabs */}
          <div className="mb-6">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Register As
            </label>
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-white/5 p-1 border border-white/10">
              <button
                type="button"
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
              className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200"
            >
              {error}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ACCOUNT DETAILS SECTION */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-accent border-b border-white/10 pb-2">
                1. Account Details
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="fullName" className="block text-xs font-semibold text-slate-300">
                    Full Name *
                  </label>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <User className="size-4" />
                    </div>
                    <input
                      id="fullName"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Manan Sharma"
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-3 text-sm text-white placeholder-slate-400 focus:border-accent focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="username" className="block text-xs font-semibold text-slate-300">
                    Username (Unique) *
                  </label>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <AtSign className="size-4" />
                    </div>
                    <input
                      id="username"
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                      placeholder="manan123"
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-3 text-sm text-white placeholder-slate-400 focus:border-accent focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-slate-300">
                  Email Address *
                </label>
                <div className="relative mt-1.5">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Mail className="size-4" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="manan123@gmail.com"
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-3 text-sm text-white placeholder-slate-400 focus:border-accent focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="password" className="block text-xs font-semibold text-slate-300">
                    Password (min 8 chars) *
                  </label>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Lock className="size-4" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-9 text-sm text-white placeholder-slate-400 focus:border-accent focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-xs font-semibold text-slate-300">
                    Confirm Password *
                  </label>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Lock className="size-4" />
                    </div>
                    <input
                      id="confirmPassword"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-3 text-sm text-white placeholder-slate-400 focus:border-accent focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* PERSONAL DETAILS SECTION */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-accent border-b border-white/10 pb-2">
                2. Personal Details (Optional)
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="phone" className="block text-xs font-semibold text-slate-300">
                    Phone Number (e.g. +91 98765 43210)
                  </label>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Phone className="size-4" />
                    </div>
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-3 text-sm text-white placeholder-slate-400 focus:border-accent focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="dateOfBirth" className="block text-xs font-semibold text-slate-300">
                    Date of Birth
                  </label>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Calendar className="size-4" />
                    </div>
                    <input
                      id="dateOfBirth"
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-3 text-sm text-white placeholder-slate-400 focus:border-accent focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>
                </div>
              </div>

              {/* SEPARATE COUNTRY, STATE, AND CITY COLUMNS */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="country" className="block text-xs font-semibold text-slate-300">
                    Country
                  </label>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Globe className="size-4" />
                    </div>
                    <input
                      id="country"
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="India"
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-3 text-sm text-white placeholder-slate-400 focus:border-accent focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="state" className="block text-xs font-semibold text-slate-300">
                    State
                  </label>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <MapPin className="size-4" />
                    </div>
                    <input
                      id="state"
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="Maharashtra"
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-3 text-sm text-white placeholder-slate-400 focus:border-accent focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="city" className="block text-xs font-semibold text-slate-300">
                    City
                  </label>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <MapPin className="size-4" />
                    </div>
                    <input
                      id="city"
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Mumbai"
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-3 text-sm text-white placeholder-slate-400 focus:border-accent focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2.5 pt-1">
              <input
                id="signup-remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="size-4 rounded border-slate-600 bg-slate-900 accent-accent cursor-pointer"
              />
              <label
                htmlFor="signup-remember-me"
                className="text-sm font-medium text-slate-200 cursor-pointer select-none hover:text-white transition-colors"
              >
                Remember me on this device
              </label>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="mt-4 flex w-full items-center justify-center gap-2 py-3.5 text-sm font-bold shadow-lg shadow-accent/20"
            >
              {loading
                ? 'Creating Account...'
                : selectedRole === 'admin'
                ? 'Create Conductor Account'
                : 'Create Voter Account'}
              {!loading && <ArrowRight className="size-4" />}
            </Button>
          </form>

          <div className="mt-6 border-t border-slate-700 pt-5 text-center text-sm font-semibold text-slate-100">
            Already have an account?{' '}
            <Link
              to="/signin"
              className="font-bold text-accent transition-colors hover:text-emerald-300 underline underline-offset-2 ml-1"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
