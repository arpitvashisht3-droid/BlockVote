import { useState } from 'react'
import { Settings, Shield, Bell, Moon, Lock, Check } from 'lucide-react'
import { Button } from '../components/Button'

export function SettingsPage() {
  const [notifications, setNotifications] = useState(true)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy sm:text-3xl">
          Account & App Settings
        </h1>
        <p className="mt-1 text-sm text-navy-muted sm:text-base">
          Configure security, notifications, and voting preferences.
        </p>
      </div>

      {saved ? (
        <div className="flex items-center gap-2 rounded-xl bg-teal-500/10 border border-teal-500/30 p-4 text-sm font-medium text-teal-700">
          <Check className="size-4" /> Preferences saved successfully!
        </div>
      ) : null}

      <div className="space-y-6">
        {/* Security & Privacy */}
        <section className="card p-6">
          <h2 className="text-base font-bold text-navy flex items-center gap-2 border-b border-border pb-3">
            <Lock className="size-4 text-accent" /> Security & Privacy
          </h2>
          <div className="mt-4 space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-navy">Two-Factor Authentication (2FA)</p>
                <p className="text-xs text-navy-muted">Add an extra layer of security to your voter account.</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                Optional
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-4">
              <div>
                <p className="font-semibold text-navy">Public Key Anonymization</p>
                <p className="text-xs text-navy-muted">Hide personal identifiers when casting votes on-chain.</p>
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
                <p className="font-semibold text-navy">Election Announcements</p>
                <p className="text-xs text-navy-muted">Receive alerts when new ballots open or close.</p>
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
        <Button onClick={handleSave}>Save Preferences</Button>
      </div>
    </div>
  )
}
