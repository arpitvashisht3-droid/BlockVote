import { createWalletClient, custom } from 'viem';
import { sepolia } from 'viem/chains';

/**
 * Contract address sourced dynamically from VITE_CONTRACT_ADDRESS env variable.
 * Set VITE_CONTRACT_ADDRESS in the root .env file for local testing or deployment.
 */
const getContractAddress = (): `0x${string}` => {
  const address = import.meta.env.VITE_CONTRACT_ADDRESS as string;
  if (!address) {
    console.warn('[Wallet] VITE_CONTRACT_ADDRESS is not set in environment variables.');
  }
  return (address || '') as `0x${string}`;
};

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
 * Module-level in-flight guard.
 * Ensures only one wallet_requestPermissions call is in progress at any time,
 * preventing the viem/MetaMask "request already pending" error.
 */
let connectingPromise: Promise<string | null> | null = null;

/**
 * connectWallet — robust browser wallet connection with duplicate-request guard.
 * Targets Ethereum Sepolia Testnet (Chain ID: 11155111).
 */
export async function connectWallet(): Promise<string | null> {
  if (typeof window === 'undefined' || !(window as any).ethereum) {
    return null;
  }

  const ethereum = (window as any).ethereum;

  // Step 1: check already-connected accounts (no popup)
  try {
    const existing: string[] = await ethereum.request({ method: 'eth_accounts' });
    if (existing && existing.length > 0) {
      return existing[0];
    }
  } catch {
    // eth_accounts is always available; ignore unexpected errors and continue
  }

  // Step 2: deduplicate – return the in-flight promise if one exists
  if (connectingPromise) {
    return connectingPromise;
  }

  // Step 3: initiate a new connection request
  connectingPromise = (async (): Promise<string | null> => {
    try {
      const walletClient = createWalletClient({
        chain: sepolia,
        transport: custom(ethereum),
      });

      const [account] = await walletClient.requestAddresses();
      return account || null;
    } catch (err: any) {
      const msg: string = err?.message ?? '';
      if (msg.includes('already pending')) {
        // Surface a clean message; the caller (e.g. Navbar) should display it
        throw new Error(
          'A MetaMask connection request is already pending. Please complete it in MetaMask.',
        );
      }
      console.warn('[Wallet] Wallet connection failed or was rejected:', msg);
      return null;
    } finally {
      connectingPromise = null;
    }
  })();

  return connectingPromise;
}

/**
 * sendOnChainVote — submits a castVote transaction on Sepolia testnet from voter's wallet.
 */
export async function sendOnChainVote(
  onchainElectionId: number,
  onchainCandidateId: number,
): Promise<string> {
  if (typeof window === 'undefined' || !(window as any).ethereum) {
    throw new Error('Ethereum wallet provider unavailable. Please install or connect MetaMask.');
  }

  const contractAddress = getContractAddress();
  if (!contractAddress) {
    throw new Error('Sepolia contract address not configured. Please set VITE_CONTRACT_ADDRESS in .env.');
  }

  const ethereum = (window as any).ethereum;

  const walletClient = createWalletClient({
    chain: sepolia,
    transport: custom(ethereum),
  });

  // Prefer already-connected account to avoid a second permission popup
  let account: `0x${string}` | undefined;
  try {
    const existing: string[] = await ethereum.request({ method: 'eth_accounts' });
    account = existing?.[0] as `0x${string}` | undefined;
  } catch {
    // fall through to requestAddresses below
  }

  if (!account) {
    const [requested] = await walletClient.requestAddresses();
    account = requested;
  }

  if (!account) {
    throw new Error('No wallet account available. Please connect MetaMask first.');
  }

  const hash = await (walletClient as any).writeContract({
    address: contractAddress,
    abi: BLOCKVOTE_ABI,
    functionName: 'castVote',
    args: [BigInt(onchainElectionId), BigInt(onchainCandidateId)],
    account,
  });

  return hash;
}
