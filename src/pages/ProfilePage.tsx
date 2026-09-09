import { useState, FormEvent, useEffect } from 'react'
import { User, Mail, Phone, Calendar, MapPin, Wallet, Shield, CheckCircle2, Edit3, X, Save, AtSign } from 'lucide-react'
import { useDemoAuth } from '../context/DemoAuthContext'
import { getConnectedAccount } from '../services/wallet'
import { CandidateAvatar } from '../components/elections/CandidateAvatar'
import { Button } from '../components/Button'

export function ProfilePage() {
  const { user, updateProfile } = useDemoAuth()
  const [wallet, setWallet] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Edit form fields
  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [dateOfBirth, setDateOfBirth] = useState(user?.dateOfBirth || '')
  const [countryState, setCountryState] = useState(user?.countryState || '')
  const [city, setCity] = useState(user?.city || '')

  useEffect(() => {
    getConnectedAccount().then((acc) => {
      if (acc) setWallet(acc)
    })
  }, [])

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setPhone(user.phone || '')
      setDateOfBirth(user.dateOfBirth || '')
      setCountryState(user.countryState || '')
      setCity(user.city || '')
    }
  }, [user])

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccessMessage(null)

    try {
      await updateProfile({
        name,
        phone,
        dateOfBirth,
        countryState,
        city
      })
      setSuccessMessage('Profile updated successfully!')
      setIsEditing(false)
    } catch (err: any) {
      console.error('Profile update error:', err)
    } finally {
      setLoading(false)
    }
  }

  const activeWallet = wallet || user?.walletAddress || null
  const formattedWallet = activeWallet
    ? `${activeWallet.substring(0, 8)}...${activeWallet.substring(activeWallet.length - 6)}`
    : 'Not connected'

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-navy to-navy-dark p-6 text-white shadow-lg sm:p-8">
        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <CandidateAvatar name={user?.name || 'Voter'} size="lg" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {user?.name || 'Voter Profile'}
              </h1>
              <p className="mt-1 flex items-center gap-2 text-sm text-slate-300">
                <AtSign className="size-3.5 text-accent" />
                {user?.username || user?.email?.split('@')[0] || 'voter'}
                <span className="text-slate-500">&bull;</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-accent/20 px-2.5 py-0.5 text-xs font-semibold text-accent">
                  <CheckCircle2 className="size-3" />
                  {user?.role === 'admin' ? 'Election Conductor' : 'Verified Voter'}
                </span>
              </p>
            </div>
          </div>

          <Button
            onClick={() => setIsEditing(true)}
            className="flex items-center justify-center gap-2 self-start sm:self-center"
          >
            <Edit3 className="size-4" />
            <span>Edit Profile</span>
          </Button>
        </div>
      </div>

      {successMessage ? (
        <div className="rounded-xl border border-teal-500/30 bg-teal-500/10 p-4 text-sm font-medium text-teal-700">
          {successMessage}
        </div>
      ) : null}

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Personal Information */}
        <section className="card p-6">
          <h2 className="text-base font-bold text-navy flex items-center gap-2 border-b border-border pb-3">
            <User className="size-4 text-accent" /> Personal Information
          </h2>
          <dl className="mt-4 space-y-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-navy-muted">Full Name</dt>
              <dd className="font-semibold text-navy">{user?.name || 'Not provided'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-navy-muted">Username</dt>
              <dd className="font-mono font-semibold text-navy">@{user?.username || user?.email?.split('@')[0] || 'voter'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-navy-muted">Email</dt>
              <dd className="font-semibold text-navy">{user?.email || 'Not provided'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-navy-muted">Phone Number</dt>
              <dd className="font-semibold text-navy">{user?.phone || 'Not provided'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-navy-muted">Date of Birth</dt>
              <dd className="font-semibold text-navy">{user?.dateOfBirth || 'Not provided'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-navy-muted">Country / State</dt>
              <dd className="font-semibold text-navy">{user?.countryState || 'Not provided'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-navy-muted">City</dt>
              <dd className="font-semibold text-navy">{user?.city || 'Not provided'}</dd>
            </div>
          </dl>
        </section>

        {/* Voter & Blockchain Info */}
        <div className="space-y-6">
          {/* Voter Information */}
          <section className="card p-6">
            <h2 className="text-base font-bold text-navy flex items-center gap-2 border-b border-border pb-3">
              <Shield className="size-4 text-accent" /> Voter Eligibility & Status
            </h2>
            <dl className="mt-4 space-y-4 text-sm">
              <div className="flex justify-between items-center">
                <dt className="text-navy-muted">Verification Status</dt>
                <dd className="inline-flex items-center gap-1.5 font-semibold text-accent">
                  <CheckCircle2 className="size-4" /> Verified Voter
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-navy-muted">Account Role</dt>
                <dd className="font-semibold capitalize text-navy">{user?.role || 'voter'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-navy-muted">Voting Eligibility</dt>
                <dd className="font-semibold text-accent">Eligible for all ballots</dd>
              </div>
            </dl>
          </section>

          {/* Blockchain Wallet Info */}
          <section className="card p-6">
            <h2 className="text-base font-bold text-navy flex items-center gap-2 border-b border-border pb-3">
              <Wallet className="size-4 text-accent" /> Blockchain & Web3 Account
            </h2>
            <dl className="mt-4 space-y-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-navy-muted">Wallet Address</dt>
                <dd className="font-mono font-semibold text-navy">{formattedWallet}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-navy-muted">Network</dt>
                <dd className="font-semibold text-navy">Sepolia Testnet (Ethereum)</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-navy-muted">Cryptographic Keys</dt>
                <dd className="text-xs text-navy-muted">Protected via Browser Extension / Provider</dd>
              </div>
            </dl>
          </section>
        </div>
      </div>

      {/* Edit Profile Modal Overlay */}
      {isEditing ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="fixed inset-0 bg-navy/60 backdrop-blur-sm"
            onClick={() => setIsEditing(false)}
          />
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl z-10 space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-lg font-bold text-navy">Edit Profile Details</h3>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded-lg p-1 text-navy-muted hover:bg-slate-100 hover:text-navy"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-sm">
              <div>
                <label className="block font-semibold text-navy">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border p-2.5 text-navy focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-navy">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="mt-1 w-full rounded-xl border border-border p-2.5 text-navy focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-navy">Date of Birth</label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border p-2.5 text-navy focus:border-accent focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-navy">Country / State</label>
                  <input
                    type="text"
                    value={countryState}
                    onChange={(e) => setCountryState(e.target.value)}
                    placeholder="USA, CA"
                    className="mt-1 w-full rounded-xl border border-border p-2.5 text-navy focus:border-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-navy">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="San Francisco"
                    className="mt-1 w-full rounded-xl border border-border p-2.5 text-navy focus:border-accent focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="rounded-xl border border-border px-4 py-2 font-medium text-navy-muted hover:bg-slate-100"
                >
                  Cancel
                </button>
                <Button type="submit" disabled={loading} className="flex items-center gap-2">
                  <Save className="size-4" />
                  <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}
