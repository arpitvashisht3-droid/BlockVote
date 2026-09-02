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

export const electionVerifications: ElectionVerification[] = [
  {
    electionCode: 'BLC-2024-001',
    network: 'BlockVote Testnet',
    record: {
      blockHash: '0x8f42c1d7a92b6e4fa91c30e5b7d14c2891d83a7c',
      previousBlockHash: '0x1a92e84c7f31d2b94c08a17e6d3b90f25e92c41f',
      merkleRoot: '0x7bc4e91a2d8f61c34e09b5a17c2d84f0a821f90d',
      transactionCount: 5253,
    },
    transactions: [
      {
        hash: '0x7a9c4e21b8d03f91c4b8f',
        blockNumber: 18492731,
        timestamp: '25 May 2024, 08:43 PM',
        confirmations: 214,
      },
      {
        hash: '0x31fe90ab62c17d4482ac',
        blockNumber: 18492731,
        timestamp: '25 May 2024, 08:44 PM',
        confirmations: 214,
      },
      {
        hash: '0x9d21c8e04a77b19e771e',
        blockNumber: 18492730,
        timestamp: '25 May 2024, 08:41 PM',
        confirmations: 215,
      },
      {
        hash: '0xb481a2f09c33d71cc90f',
        blockNumber: 18492729,
        timestamp: '25 May 2024, 08:39 PM',
        confirmations: 216,
      },
    ],
  },
  {
    electionCode: 'BLC-2024-003',
    network: 'BlockVote Testnet',
    record: {
      blockHash: '0x4c91d2a8e7b03f16a52e90c1d8b47e3319c40a2f',
      previousBlockHash: '0x2e84b91c0d57a3f8e12c64b90a7d31f84b21e90c',
      merkleRoot: '0x6a18f4c29d07e5b3c91a20d8f4e73b12c90d81a4',
      transactionCount: 956,
    },
    transactions: [
      {
        hash: '0xa91c3e77d20b4f18c21d',
        blockNumber: 18481200,
        timestamp: '10 May 2024, 08:52 PM',
        confirmations: 402,
      },
      {
        hash: '0x5e20b91a4c33d80f19ab',
        blockNumber: 18481199,
        timestamp: '10 May 2024, 08:50 PM',
        confirmations: 403,
      },
      {
        hash: '0xc17d84e09a2b5f31d04e',
        blockNumber: 18481198,
        timestamp: '10 May 2024, 08:47 PM',
        confirmations: 404,
      },
    ],
  },
  {
    electionCode: 'BLC-2024-004',
    network: 'BlockVote Testnet',
    record: {
      blockHash: '0x9e31c84b2a70d15f8c24e90a1b63d47e28f90c1d',
      previousBlockHash: '0x3b17e90c4d28a5f1c84b20d9e7a31f62c40d81b9',
      merkleRoot: '0x1f84c29a7e03d5b2c91a40e8f7d13b20a90c51e4',
      transactionCount: 2184,
    },
    transactions: [
      {
        hash: '0x14c9e8a0b73d21f59a10',
        blockNumber: 18470112,
        timestamp: '2 Apr 2024, 08:58 PM',
        confirmations: 890,
      },
      {
        hash: '0x8a20d91c4e37b05f12cd',
        blockNumber: 18470111,
        timestamp: '2 Apr 2024, 08:55 PM',
        confirmations: 891,
      },
      {
        hash: '0xd40b18e29c51a73f80e2',
        blockNumber: 18470110,
        timestamp: '2 Apr 2024, 08:51 PM',
        confirmations: 892,
      },
    ],
  },
]

export function getVerificationByCode(electionCode: string | undefined) {
  if (!electionCode) {
    return undefined
  }

  return electionVerifications.find((item) => item.electionCode === electionCode)
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
