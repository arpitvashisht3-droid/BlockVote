import {
  visibilityOptions,
  votingMethods,
  type VotingSettings,
} from '../../../data/createElection'

type VotingSettingsFormProps = {
  value: VotingSettings
  onChange: (patch: Partial<VotingSettings>) => void
}

function ToggleField({
  id,
  label,
  description,
  checked,
  onChange,
}: {
  id: string
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-surface/70 px-4 py-4">
      <div className="min-w-0">
        <p id={`${id}-label`} className="text-sm font-semibold text-navy">
          {label}
        </p>
        <p id={`${id}-description`} className="mt-1 text-sm text-navy-muted">
          {description}
        </p>
      </div>
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        aria-describedby={`${id}-description`}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
          checked ? 'bg-accent' : 'bg-slate-300'
        }`}
      >
        <span
          className={`inline-block size-5 rounded-full bg-white shadow-sm transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  )
}

export function VotingSettingsForm({
  value,
  onChange,
}: VotingSettingsFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="voting-method" className="field-label">
            Voting Method
          </label>
          <select
            id="voting-method"
            className="field-input"
            value={value.method}
            onChange={(event) =>
              onChange({
                method: event.target.value as VotingSettings['method'],
              })
            }
          >
            {votingMethods.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
          <p className="field-help">
            Choose how many candidates a voter can select on the ballot.
          </p>
        </div>
        <div>
          <label htmlFor="votes-per-voter" className="field-label">
            Votes Per Voter
          </label>
          <input
            id="votes-per-voter"
            type="number"
            min={1}
            max={20}
            className="field-input"
            value={value.votesPerVoter}
            onChange={(event) =>
              onChange({
                votesPerVoter: Math.max(1, Number(event.target.value) || 1),
              })
            }
          />
          <p className="field-help">
            The maximum number of votes each eligible voter can cast.
          </p>
        </div>
      </div>

      <div>
        <label htmlFor="election-visibility" className="field-label">
          Election Visibility
        </label>
        <select
          id="election-visibility"
          className="field-input"
          value={value.visibility}
          onChange={(event) =>
            onChange({
              visibility: event.target.value as VotingSettings['visibility'],
            })
          }
        >
          {visibilityOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <p className="field-help">
          Public elections can be discovered by anyone. Private elections stay
          unlisted.
        </p>
      </div>

      <ToggleField
        id="anonymous-voting"
        label="Anonymous Voting"
        description="Hide voter identity from public election records."
        checked={value.anonymousVoting}
        onChange={(checked) => onChange({ anonymousVoting: checked })}
      />
      <ToggleField
        id="require-wallet"
        label="Require Wallet"
        description="Voters must connect a wallet before they can cast a ballot."
        checked={value.requireWallet}
        onChange={(checked) => onChange({ requireWallet: checked })}
      />
      <ToggleField
        id="allow-vote-changes"
        label="Allow Vote Changes"
        description="Allow a voter to update their choice before the election ends."
        checked={value.allowVoteChanges}
        onChange={(checked) => onChange({ allowVoteChanges: checked })}
      />
      <ToggleField
        id="show-live-results"
        label="Show Live Results"
        description="Display running totals while voting is still open."
        checked={value.showLiveResults}
        onChange={(checked) => onChange({ showLiveResults: checked })}
      />
      <ToggleField
        id="require-verification"
        label="Require voter verification"
        description="Confirm voter eligibility before a ballot is accepted."
        checked={value.requireVoterVerification}
        onChange={(checked) => onChange({ requireVoterVerification: checked })}
      />
      <ToggleField
        id="blockchain-verification"
        label="Enable blockchain verification"
        description="Record vote hashes so results can be independently verified."
        checked={value.enableBlockchainVerification}
        onChange={(checked) =>
          onChange({ enableBlockchainVerification: checked })
        }
      />
    </div>
  )
}
