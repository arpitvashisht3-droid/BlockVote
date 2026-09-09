import { enabledLabel, type VotingSettings } from '../../../data/votingSettings'
import { Button } from '../../Button'

type ElectionSettingsProps = {
  settings: VotingSettings
  onEdit: () => void
}

const rows: { key: keyof VotingSettings; label: string }[] = [
  { key: 'method', label: 'Voting Method' },
  { key: 'votesPerVoter', label: 'Votes Per Voter' },
  { key: 'anonymousVoting', label: 'Anonymous Voting' },
  { key: 'requireWallet', label: 'Require Wallet' },
  { key: 'allowVoteChanges', label: 'Allow Vote Changes' },
  { key: 'showLiveResults', label: 'Live Results' },
  { key: 'visibility', label: 'Visibility' },
  { key: 'requireVoterVerification', label: 'Voter Verification' },
  { key: 'enableBlockchainVerification', label: 'Blockchain Verification' },
]

function displayValue(settings: VotingSettings, key: keyof VotingSettings) {
  const value = settings[key]
  if (typeof value === 'boolean') {
    return enabledLabel(value)
  }
  return String(value)
}

export function ElectionSettings({ settings, onEdit }: ElectionSettingsProps) {
  return (
    <section className="card p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-bold text-navy">Election Settings</h2>
        <Button variant="secondary" onClick={onEdit}>
          Edit Settings
        </Button>
      </div>
      <dl className="mt-4 divide-y divide-border">
        {rows.map((row) => (
          <div
            key={row.key}
            className="flex items-start justify-between gap-3 py-3"
          >
            <dt className="text-sm text-navy-muted">{row.label}</dt>
            <dd className="text-sm font-semibold text-navy">
              {displayValue(settings, row.key)}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
