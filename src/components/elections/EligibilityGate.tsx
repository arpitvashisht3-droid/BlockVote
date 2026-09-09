import { useState, type ReactNode } from 'react'
import { AlertCircle, CheckCircle2, KeyRound, Lock, ShieldAlert, Upload } from 'lucide-react'
import { type Election } from '../../data/elections'
import { Button } from '../Button'
import { useDemoAuth } from '../../context/DemoAuthContext'
import { getApiBaseUrl } from '../../data/apiConfig'

type EligibilityGateProps = {
  election: Election
  children: ReactNode
  onVerified?: () => void
}

export function EligibilityGate({ election, children, onVerified }: EligibilityGateProps) {
  const { user } = useDemoAuth()
  const [isVerified, setIsVerified] = useState(false)
  const [secretCode, setSecretCode] = useState('')
  const [enrollmentNumber, setEnrollmentNumber] = useState('')
  const [collegeId, setCollegeId] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadStatus, setUploadStatus] = useState<'none' | 'pending' | 'success'>('none')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // If voter already verified in this session
  if (isVerified) {
    return <>{children}</>
  }

  const needsCollegeFields = election.electionType === 'College Election' || election.electionType === 'University Election'
  const needsIdUpload = election.electionType === 'University Election'

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!secretCode.trim()) {
      setError('Secret code is required to access this ballot.')
      return
    }

    if (needsCollegeFields && (!enrollmentNumber.trim() || !collegeId.trim())) {
      setError('Enrollment number and College ID code are required.')
      return
    }

    if (needsIdUpload && !selectedFile && uploadStatus !== 'success') {
      setError('Upload of your official College ID document is required.')
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('blockvote_auth_token')
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`${getApiBaseUrl()}/elections/${election.id}/verify-eligibility`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          secretCode: secretCode.trim(),
          enrollmentNumber: enrollmentNumber.trim() || undefined,
          collegeId: collegeId.trim() || undefined,
          voterId: user?.id,
        }),
      })

      const resData = await response.json()

      if (!response.ok || !resData.eligible) {
        setError(resData.message || 'Eligibility verification failed.')
        setLoading(false)
        return
      }

      // Handle ID file upload if present
      if (needsIdUpload && selectedFile) {
        const formData = new FormData()
        formData.append('collegeId', selectedFile)

        const uploadRes = await fetch(`${getApiBaseUrl()}/elections/${election.id}/upload-college-id`, {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        })

        if (uploadRes.ok) {
          setUploadStatus('success')
        }
      }

      setIsVerified(true)
      if (onVerified) onVerified()
    } catch (err: any) {
      setError(err.message || 'Error communicating with verification server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card mx-auto max-w-xl p-6 sm:p-8">
      <div className="flex items-center gap-3 border-b border-border pb-5">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-accent-soft text-accent">
          <Lock className="size-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-navy">Election Eligibility Gate</h2>
          <p className="text-xs text-navy-muted">
            {election.title} — Access verification required
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {election.maxVoters && (
          <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-900 border border-amber-200">
            <ShieldAlert className="size-4 text-amber-600 shrink-0" />
            <span>This election has a maximum voter capacity cap of {election.maxVoters} voters.</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700 border border-rose-200" role="alert">
            <AlertCircle className="size-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label htmlFor="secret-code-voter" className="field-label flex items-center gap-2">
              <KeyRound className="size-4 text-accent" />
              Secret Election Code <span className="text-rose-600">*</span>
            </label>
            <input
              id="secret-code-voter"
              type="password"
              className="field-input"
              value={secretCode}
              placeholder="Enter secret code provided by conductor"
              onChange={(e) => setSecretCode(e.target.value)}
              required
            />
          </div>

          {needsCollegeFields && (
            <>
              <div>
                <label htmlFor="voter-enrollment" className="field-label">
                  Enrollment / Student Roll Number <span className="text-rose-600">*</span>
                </label>
                <input
                  id="voter-enrollment"
                  type="text"
                  className="field-input"
                  value={enrollmentNumber}
                  placeholder="e.g. 2024-CS-1092"
                  onChange={(e) => setEnrollmentNumber(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="voter-college-id" className="field-label">
                  College Code / Identifier <span className="text-rose-600">*</span>
                </label>
                <input
                  id="voter-college-id"
                  type="text"
                  className="field-input"
                  value={collegeId}
                  placeholder="e.g. SXC-2026"
                  onChange={(e) => setCollegeId(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          {needsIdUpload && (
            <div>
              <label htmlFor="college-id-file" className="field-label flex items-center gap-2">
                <Upload className="size-4 text-accent" />
                College ID Card Image <span className="text-rose-600">*</span>
              </label>
              <input
                id="college-id-file"
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                className="field-input py-2 text-xs"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                required
              />
              <p className="field-help">
                Upload image or PDF. Required for University Elections (Stored securely under Pending Verification).
              </p>
              {uploadStatus === 'success' && (
                <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                  <CheckCircle2 className="size-4" /> ID uploaded — Status: Pending Verification
                </p>
              )}
            </div>
          )}

          <Button
            type="submit"
            className="w-full mt-2"
            disabled={loading}
          >
            {loading ? 'Verifying Credentials...' : 'Verify Eligibility & Enter Ballot'}
          </Button>
        </form>
      </div>
    </div>
  )
}
