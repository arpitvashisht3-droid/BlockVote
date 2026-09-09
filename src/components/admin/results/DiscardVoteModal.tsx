import { useState } from 'react'
import { AlertTriangle, Trash2, X } from 'lucide-react'
import { Button } from '../../Button'
import { Modal } from '../../Modal'

type DiscardVoteModalProps = {
  open: boolean
  electionId: string
  onClose: () => void
  onSuccess: () => void
}

export function DiscardVoteModal({ open, electionId, onClose, onSuccess }: DiscardVoteModalProps) {
  const [reason, setReason] = useState('')
  const [voterName, setVoterName] = useState('')
  const [voterEmail, setVoterEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!reason.trim() || reason.trim().length < 10) {
      setError('A detailed reason (at least 10 characters) is required to discard a vote.')
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('blockvote_auth_token')
      const response = await fetch(`/api/elections/${electionId}/votes/new/discard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reason: reason.trim(),
          voterName: voterName.trim() || undefined,
          voterEmail: voterEmail.trim() || undefined,
        }),
      })

      const data = await response.json()
      if (!response.ok || !data.success) {
        setError(data.message || 'Failed to record discarded vote.')
        setLoading(false)
        return
      }

      setReason('')
      setVoterName('')
      setVoterEmail('')
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Server error recording discarded vote.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} title="Discard Invalid Vote" onClose={onClose} className="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-3 rounded-xl bg-amber-50 p-4 border border-amber-200">
          <AlertTriangle className="size-6 text-amber-600 shrink-0" />
          <p className="text-xs text-amber-900 leading-relaxed">
            Discarding a vote registers an audit entry in the backend JSON database. It does not delete on-chain transactions but marks the vote invalid for aggregation.
          </p>
        </div>

        {error && (
          <p className="text-xs font-semibold text-rose-600" role="alert">
            {error}
          </p>
        )}

        <div>
          <label htmlFor="discard-reason" className="field-label">
            Discard Reason <span className="text-rose-600">*</span>
          </label>
          <textarea
            id="discard-reason"
            rows={3}
            className="field-input resize-y"
            placeholder="Provide a detailed audit reason (e.g. Identity mismatch, duplicate registration, or policy violation)..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="discard-voter-name" className="field-label text-xs">
              Voter Name (Optional)
            </label>
            <input
              id="discard-voter-name"
              type="text"
              className="field-input"
              placeholder="e.g. John Doe"
              value={voterName}
              onChange={(e) => setVoterName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="discard-voter-email" className="field-label text-xs">
              Voter Email (Optional)
            </label>
            <input
              id="discard-voter-email"
              type="email"
              className="field-input"
              placeholder="john@example.com"
              value={voterEmail}
              onChange={(e) => setVoterEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="danger" disabled={loading}>
            {loading ? 'Processing...' : 'Confirm Discard Vote'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
