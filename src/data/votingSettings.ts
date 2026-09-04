export const votingMethods = ['Single Choice', 'Multiple Choice'] as const

export type VotingMethod = (typeof votingMethods)[number]

export const visibilityOptions = ['Public', 'Private'] as const

export type ElectionVisibility = (typeof visibilityOptions)[number]

export type VotingSettings = {
  method: VotingMethod
  votesPerVoter: number
  anonymousVoting: boolean
  requireWallet: boolean
  allowVoteChanges: boolean
  showLiveResults: boolean
  visibility: ElectionVisibility
  requireVoterVerification: boolean
  enableBlockchainVerification: boolean
}

export const defaultSettings: VotingSettings = {
  method: 'Single Choice',
  votesPerVoter: 1,
  anonymousVoting: true,
  requireWallet: false,
  allowVoteChanges: false,
  showLiveResults: false,
  visibility: 'Public',
  requireVoterVerification: true,
  enableBlockchainVerification: true,
}

export function enabledLabel(value: boolean) {
  return value ? 'Enabled' : 'Disabled'
}
