import { createWalletClient, custom } from 'viem';
import { hardhat } from 'viem/chains';

const CONTRACT_ADDRESS = (import.meta.env.VITE_CONTRACT_ADDRESS as string) || '0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1';

const BLOCKVOTE_ABI = [
  {
    name: 'castVote',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: '_electionId', type: 'uint256' },
      { name: '_candidateId', type: 'uint256' },
    ],
    outputs: [],
  },
] as const;

/**
 * Connect wallet helper to trigger MetaMask/EVM browser wallet connection and return the active account address.
 */
export async function connectWallet(): Promise<string | null> {
  if (typeof window !== 'undefined' && (window as any).ethereum) {
    try {
      const walletClient = createWalletClient({
        chain: hardhat,
        transport: custom((window as any).ethereum),
      });

      const [account] = await walletClient.requestAddresses();
      return account || null;
    } catch (err) {
      console.warn('[Wallet] Browser wallet connection request failed or rejected:', (err as Error).message);
      return null;
    }
  }
  return null;
}

/**
 * Wallet client helper to submit an on-chain transaction directly from the voter's browser wallet / local client account.
 */
export async function sendOnChainVote(onchainElectionId: number, onchainCandidateId: number): Promise<string> {
  const electionIdBig = BigInt(onchainElectionId);
  const candidateIdBig = BigInt(onchainCandidateId);

  if (typeof window === 'undefined' || !(window as any).ethereum) {
    throw new Error('Ethereum wallet provider unavailable. Please install or connect MetaMask.');
  }

  const walletClient = createWalletClient({
    chain: hardhat,
    transport: custom((window as any).ethereum),
  });

  const [account] = await walletClient.requestAddresses();

  const hash = await (walletClient as any).writeContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: BLOCKVOTE_ABI,
    functionName: 'castVote',
    args: [electionIdBig, candidateIdBig],
    account,
  });

  return hash;
}
