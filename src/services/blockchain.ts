/**
 * blockchain.ts — Read-only Sepolia contract interactions for the BlockVote frontend.
 *
 * Uses viem publicClient to query the deployed contract at VITE_CONTRACT_ADDRESS.
 *
 * IMPORTANT: The deployed contract at 0xcfb2e6fb3b53bad6bde74c10a4d171dfe4776e18
 * is the OLDER version of BlockVote where:
 *   - elections() returns `exists` as uint256 (NOT bool)
 *   - There is NO isPaused field
 *
 * This ABI matches the deployed bytecode exactly — do NOT replace it with
 * the Hardhat artifact ABI which targets the newer contract struct.
 */

import { createPublicClient, http } from 'viem'
import { sepolia } from 'viem/chains'

// ── Deployed contract ABI (matches on-chain bytecode, NOT local blockvote.sol) ──

const DEPLOYED_ABI = [
  {
    name: 'elections',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'uint256' }],
    outputs: [
      { name: 'id',          type: 'uint256' },
      { name: 'title',       type: 'string'  },
      { name: 'description', type: 'string'  },
      { name: 'startTime',   type: 'uint256' },
      { name: 'endTime',     type: 'uint256' },
      { name: 'exists',      type: 'uint256' }, // uint256 on-chain, NOT bool
    ],
  },
  {
    name: 'getCandidates',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_electionId', type: 'uint256' }],
    outputs: [
      {
        name: '',
        type: 'tuple[]',
        components: [
          { name: 'id',          type: 'uint256' },
          { name: 'name',        type: 'string'  },
          { name: 'description', type: 'string'  },
          { name: 'voteCount',   type: 'uint256' },
        ],
      },
    ],
  },
  {
    name: 'hasVoted',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: '', type: 'uint256' },
      { name: '', type: 'address' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const

// ── Types ──────────────────────────────────────────────────────────────────────

export type ChainCandidate = {
  /** on-chain uint256 candidate ID */
  onchainId: number
  name: string
  description: string
  voteCount: number
}

export type ChainElection = {
  /** on-chain uint256 election ID */
  onchainId: number
  title: string
  description: string
  startTime: number   // Unix seconds
  endTime: number     // Unix seconds
  candidates: ChainCandidate[]
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function getContractAddress(): `0x${string}` {
  const address = import.meta.env.VITE_CONTRACT_ADDRESS as string
  if (!address) {
    console.warn('[Blockchain] VITE_CONTRACT_ADDRESS is not set.')
  }
  return (address || '') as `0x${string}`
}

function createClient() {
  return createPublicClient({
    chain: sepolia,
    transport: http(),
  })
}

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * Fetches all elections from the deployed Sepolia contract.
 * Scans election IDs 0, 1, 2, ... until exists === 0n (sentinel for end of list).
 * Also fetches candidates for each election.
 *
 * Returns an empty array if the contract address is not configured or any
 * network error occurs.
 */
export async function fetchElectionsFromChain(): Promise<ChainElection[]> {
  const contractAddress = getContractAddress()
  if (!contractAddress) {
    return []
  }

  const client = createClient()
  const elections: ChainElection[] = []

  try {
    let id = 0n

    while (true) {
      // eslint-disable-next-line no-await-in-loop
      const raw = (await (client.readContract as any)({
        address: contractAddress,
        abi: DEPLOYED_ABI,
        functionName: 'elections',
        args: [id],
      })) as readonly [bigint, string, string, bigint, bigint, bigint]

      // Destructure tuple (named outputs may or may not be available)
      const [rawId, title, description, startTime, endTime, exists] = raw

      // exists === 0n means the election does not exist — end of list
      if (exists === 0n) {
        break
      }

      // eslint-disable-next-line no-await-in-loop
      const rawCandidates = (await (client.readContract as any)({
        address: contractAddress,
        abi: DEPLOYED_ABI,
        functionName: 'getCandidates',
        args: [id],
      })) as ReadonlyArray<{
        id: bigint
        name: string
        description: string
        voteCount: bigint
      }>

      const candidates: ChainCandidate[] = rawCandidates.map((c) => ({
        onchainId: Number(c.id),
        name: c.name,
        description: c.description,
        voteCount: Number(c.voteCount),
      }))

      elections.push({
        onchainId: Number(rawId),
        title,
        description,
        startTime: Number(startTime),
        endTime: Number(endTime),
        candidates,
      })

      id += 1n
    }
  } catch (err) {
    console.error('[Blockchain] Failed to fetch elections from chain:', err)
  }

  return elections
}

/**
 * Checks whether a wallet address has already voted in a given election.
 * Returns false on any error (safe default: allow UI to proceed).
 */
export async function checkHasVoted(
  electionOnchainId: number,
  voterAddress: string,
): Promise<boolean> {
  const contractAddress = getContractAddress()
  if (!contractAddress || !voterAddress) {
    return false
  }

  const client = createClient()

  try {
    const voted = await (client.readContract as any)({
      address: contractAddress,
      abi: DEPLOYED_ABI,
      functionName: 'hasVoted',
      args: [BigInt(electionOnchainId), voterAddress as `0x${string}`],
    })
    return voted as boolean
  } catch {
    return false
  }
}

import type { Election } from '../data/elections'

/**
 * Derives a human-readable status from on-chain start/end timestamps.
 */
export function deriveElectionStatus(
  startTime: number,
  endTime: number,
): 'live' | 'upcoming' | 'ended' {
  const nowSec = Math.floor(Date.now() / 1000)
  if (nowSec < startTime) return 'upcoming'
  if (nowSec > endTime) return 'ended'
  return 'live'
}

/**
 * Formats a Unix timestamp (seconds) into a human-readable date/time string.
 */
export function formatUnixTimestamp(unixSec: number): string {
  if (!unixSec) return '—'
  return new Date(unixSec * 1000).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Converts a ChainElection into the standard frontend Election type.
 */
export function chainElectionToElection(ce: ChainElection): Election {
  const status = deriveElectionStatus(ce.startTime, ce.endTime)
  const totalVotes = ce.candidates.reduce((sum, c) => sum + c.voteCount, 0)
  return {
    id: `chain-${ce.onchainId}`,
    onchainId: ce.onchainId,
    title: ce.title,
    description: ce.description,
    detailsDescription: ce.description,
    status,
    electionCode: `SEP-${ce.onchainId}`,
    startDate: formatUnixTimestamp(ce.startTime),
    endDate: formatUnixTimestamp(ce.endTime),
    voterStatus: status === 'live' ? 'Voting is live' : status === 'upcoming' ? 'Starts soon' : 'Completed',
    timeLabel:
      status === 'live'
        ? `Ends ${formatUnixTimestamp(ce.endTime)}`
        : status === 'upcoming'
        ? `Starts ${formatUnixTimestamp(ce.startTime)}`
        : `Ended ${formatUnixTimestamp(ce.endTime)}`,
    voteCount: totalVotes,
    turnoutPercent: 0,
    candidates: ce.candidates.map((c) => ({
      id: `c-${ce.onchainId}-${c.onchainId}`,
      onchainId: c.onchainId,
      name: c.name,
      department: 'Candidate',
      about: c.description,
      achievements: [],
    })),
    thumbnail: {
      icon: 'landmark',
      tone: 'navy',
    },
  }
}
