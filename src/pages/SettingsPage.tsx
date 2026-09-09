import { useState } from 'react'
import { Bell, Check, KeyRound, Lock, Shield, Sliders } from 'lucide-react'
import { Button } from '../components/Button'
import { useDemoAuth } from '../context/DemoAuthContext'
import { getApiBaseUrl } from '../data/apiConfig'

export function SettingsPage() {
  const { user } = useDemoAuth()
  const isConductor = user?.role === 'admin'

  const [notifications, setNotifications] = useState(true)
  const [requireSecretCode, setRequireSecretCode] = useState(true)
  const [defaultVoterCap, setDefaultVoterCap] = useState('500')
  const [anonymousDefault, setAnonymousDefault] = useState(true)

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [passwordLoading, setPasswordLoading] = useState(false)

  const [saved, setSaved] = useState(false)

  const handleSavePreferences = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordMsg(null)

    if (!currentPassword) {
      setPasswordMsg({ type: 'error', text: 'Current password is required.' })
      return
    }

    if (newPassword.length < 8) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 8 characters long.' })
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New password and confirmation do not match.' })
      return
    }

    setPasswordLoading(true)
    try {
      const token = localStorage.getItem('blockvote_auth_token')
      const res = await fetch(`${getApiBaseUrl()}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setPasswordMsg({ type: 'error', text: data.message || 'Failed to update password.' })
      } else {
        setPasswordMsg({ type: 'success', text: 'Password changed successfully!' })
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      }
    } catch (err: any) {
      setPasswordMsg({ type: 'error', text: err.message || 'Error updating password.' })
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy sm:text-3xl">
          {isConductor ? 'Election Conductor Settings' : 'Account & App Settings'}
        </h1>
        <p className="mt-1 text-sm text-navy-muted sm:text-base">
          {isConductor
            ? 'Configure security, default election rules, voter caps, and password preferences.'
            : 'Configure security, notifications, and voting preferences.'}
        </p>
      </div>

      {saved && (
        <div className="flex items-center gap-2 rounded-xl bg-teal-500/10 border border-teal-500/30 p-4 text-sm font-medium text-teal-700">
          <Check className="size-4" /> Preferences saved successfully!
        </div>
      )}

      <div className="space-y-6">
        {/* Change Password */}
        <section className="card p-6">
          <h2 className="text-base font-bold text-navy flex items-center gap-2 border-b border-border pb-3">
            <KeyRound className="size-4 text-accent" /> Change Password
          </h2>

          {passwordMsg && (
            <div
              className={`mt-4 flex items-center gap-2 rounded-xl p-3.5 text-xs font-semibold border ${
                passwordMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              <span>{passwordMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="current-pass" className="field-label text-xs">
                Current Password
              </label>
              <input
                id="current-pass"
                type="password"
                className="field-input"
                value={currentPassword}
                placeholder="••••••••"
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="new-pass" className="field-label text-xs">
                New Password
              </label>
              <input
                id="new-pass"
                type="password"
                className="field-input"
                value={newPassword}
                placeholder="At least 8 characters"
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="confirm-pass" className="field-label text-xs">
                Confirm New Password
              </label>
              <input
                id="confirm-pass"
                type="password"
                className="field-input"
                value={confirmPassword}
                placeholder="••••••••"
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <div className="sm:col-span-3 flex justify-end">
              <Button type="submit" variant="secondary" disabled={passwordLoading}>
                {passwordLoading ? 'Updating Password...' : 'Update Password'}
              </Button>
            </div>
          </form>
        </section>

        {/* Conductor Election Defaults */}
        {isConductor && (
          <section className="card p-6">
            <h2 className="text-base font-bold text-navy flex items-center gap-2 border-b border-border pb-3">
              <Sliders className="size-4 text-accent" /> Default Election Controls
            </h2>
            <div className="mt-4 space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-navy">Mandatory Secret Code</p>
                  <p className="text-xs text-navy-muted">Require secret access passcode for all new elections by default.</p>
                </div>
                <input
                  type="checkbox"
                  checked={requireSecretCode}
                  onChange={(e) => setRequireSecretCode(e.target.checked)}
                  className="size-5 rounded border-border text-accent focus:ring-accent"
                />
              </div>

              <div className="flex items-center justify-between border-t border-border pt-4">
                <div>
                  <p className="font-semibold text-navy">Default Anonymous Ballot Aggregation</p>
                  <p className="text-xs text-navy-muted">Strictly isolate voter identities from candidate selection tally.</p>
                </div>
                <input
                  type="checkbox"
                  checked={anonymousDefault}
                  onChange={(e) => setAnonymousDefault(e.target.checked)}
                  className="size-5 rounded border-border text-accent focus:ring-accent"
                />
              </div>

              <div className="flex items-center justify-between border-t border-border pt-4">
                <div>
                  <p className="font-semibold text-navy">Default Voter Capacity Cap</p>
                  <p className="text-xs text-navy-muted">Suggested default maximum voter limit per election.</p>
                </div>
                <input
                  type="number"
                  className="field-input w-28 text-xs py-1.5"
                  value={defaultVoterCap}
                  onChange={(e) => setDefaultVoterCap(e.target.value)}
                />
              </div>
            </div>
          </section>
        )}

        {/* Security & Privacy */}
        <section className="card p-6">
          <h2 className="text-base font-bold text-navy flex items-center gap-2 border-b border-border pb-3">
            <Lock className="size-4 text-accent" /> Security & Privacy
          </h2>
          <div className="mt-4 space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-navy">Two-Factor Authentication (2FA)</p>
                <p className="text-xs text-navy-muted">Add an extra layer of security to your conductor account.</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                Optional
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-4">
              <div>
                <p className="font-semibold text-navy">Public Key Anonymization</p>
                <p className="text-xs text-navy-muted">Hide personal identifiers when creating or inspecting on-chain transactions.</p>
              </div>
              <span className="rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold text-accent">
                Enabled
              </span>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="card p-6">
          <h2 className="text-base font-bold text-navy flex items-center gap-2 border-b border-border pb-3">
            <Bell className="size-4 text-accent" /> Notifications
          </h2>
          <div className="mt-4 space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-navy">Election Activity Alerts</p>
                <p className="text-xs text-navy-muted">Receive alerts when elections start, end, or reach voter capacity limit.</p>
              </div>
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className="size-5 rounded border-border text-accent focus:ring-accent"
              />
            </div>
          </div>
        </section>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSavePreferences}>Save Preferences</Button>
      </div>
    </div>
  )
}
