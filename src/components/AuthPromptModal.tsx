import { Shield, X } from 'lucide-react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { Button } from './Button'

interface AuthPromptModalProps {
  isOpen: boolean
  onClose: () => void
  redirectPath?: string
}

export function AuthPromptModal({
  isOpen,
  onClose,
  redirectPath = '/dashboard/elections',
}: AuthPromptModalProps) {
  const navigate = useNavigate()

  if (!isOpen || typeof document === 'undefined') return null

  const handleSignIn = () => {
    onClose()
    navigate(`/signin?redirect=${encodeURIComponent(redirectPath)}`)
  }

  const handleCreateAccount = () => {
    onClose()
    navigate(`/create-account?redirect=${encodeURIComponent(redirectPath)}`)
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-navy/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0B1528] p-6 text-white shadow-2xl transition-all sm:p-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="size-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-accent/15 text-accent border border-accent/20">
            <Shield className="size-7" />
          </div>

          <h3 className="mt-5 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Sign in required
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            You need an account to view and participate in elections.
          </p>

          <div className="mt-8 flex w-full flex-col gap-3">
            <Button
              type="button"
              onClick={handleSignIn}
              size="lg"
              className="w-full justify-center bg-accent text-navy font-bold hover:bg-accent-hover"
            >
              Sign In
            </Button>
            <Button
              type="button"
              onClick={handleCreateAccount}
              variant="secondary"
              size="lg"
              className="w-full justify-center border-slate-700 bg-white/5 text-white hover:bg-white/10"
            >
              Create Account
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="mt-2 text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-white transition-colors py-1"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
