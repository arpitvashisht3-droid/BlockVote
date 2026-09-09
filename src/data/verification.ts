/**
 * verification.ts — Type definitions and utilities for blockchain verification.
 *
 * All hardcoded demo verification records have been removed:
 *   - electionVerifications[] (fake block hashes, Merkle roots, tx hashes for
 *     BLC-2024-001, BLC-2024-003, BLC-2024-004)
 *
 * Real verification data would require querying the Sepolia chain or an
 * indexing service. Currently no verification records are available from
 * the deployed contract's ABI. The BlockchainVerificationPage will show
 * a "Verification not available yet" state for all elections.
 *
 * verificationChecks and verificationFlowSteps are educational/UI content
 * that describe how the verification process works — they are NOT fake data.
 */

import type { Election } from './elections'

export type VoteTransaction = {
  hash: string
  blockNumber: number
  timestamp: string
  confirmations: number
}

export type BlockchainRecordData = {
  blockHash: string
  previousBlockHash: string
  merkleRoot: string
  transactionCount: number
}

export type ElectionVerification = {
  electionCode: string
  network: string
  record: BlockchainRecordData
  transactions: VoteTransaction[]
}

export type VerificationCheck = {
  title: string
  explanation: string
}

/**
 * Describes the steps BlockVote uses to verify election integrity.
 * These are factual descriptions of the verification process — not demo data.
 */
export const verificationChecks: VerificationCheck[] = [
  {
    title: 'Election identity verified',
    explanation: 'The election ID matches the finalized on-chain record.',
  },
  {
    title: 'Block hash verified',
    explanation: 'The block hash is intact and has not been rewritten.',
  },
  {
    title: 'Previous block verified',
    explanation: 'This block correctly links to the previous confirmed block.',
  },
  {
    title: 'Merkle root verified',
    explanation: 'All recorded ballots roll up to the published Merkle root.',
  },
  {
    title: 'Vote count verified',
    explanation: 'The on-chain transaction count matches the published tally.',
  },
  {
    title: 'Results integrity verified',
    explanation: 'Final results match the sealed blockchain record.',
  },
]

export const verificationFlowSteps = [
  'Vote Cast',
  'Transaction Created',
  'Block Confirmed',
  'Merkle Root Generated',
  'Election Finalized',
  'Results Verified',
] as const

/**
 * Looks up a verification record by election code.
 * Returns undefined — no verification records are available without an
 * on-chain indexer or backend service.
 */
export function getVerificationByCode(
  _electionCode: string | undefined,
): ElectionVerification | undefined {
  return undefined
}

export function getResultsPath(election: Election) {
  return `/elections/${election.id}/results`
}

export function truncateHash(hash: string, start = 10, end = 8) {
  if (hash.length <= start + end) {
    return hash
  }

  return `${hash.slice(0, start)}...${hash.slice(-end)}`
}

export function truncateTxHash(hash: string) {
  return truncateHash(hash, 6, 4)
}
