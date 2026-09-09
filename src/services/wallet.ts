import { createWalletClient, custom } from 'viem';
import { sepolia } from 'viem/chains';

// Sepolia chain identifiers
const SEPOLIA_CHAIN_ID_DEC = 11155111;
const SEPOLIA_CHAIN_ID_HEX = '0xaa36a7';

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
 * ensureSepoliaChain — reads the real chain ID from the injected provider
 * and requests a switch to Sepolia if needed.
 *
 * This resolves the viem v2 + MetaMask "stale chain" mismatch where MetaMask
 * may cache a previous chain (e.g. Mainnet id:1) in the injected provider
 * even when the MetaMask UI displays Sepolia.
 *
 * @throws if the user rejects the chain-switch request.
 */
async function ensureSepoliaChain(ethereum: any): Promise<void> {
  // Read the actual current chain ID directly from the provider
  const rawChainId: string = await ethereum.request({ method: 'eth_chainId' });
  const currentChainId = parseInt(rawChainId, 16);

  console.log(`[Wallet] Provider chain ID: ${currentChainId} (0x${currentChainId.toString(16)})`);

  if (currentChainId === SEPOLIA_CHAIN_ID_DEC) {
    // Already on Sepolia — nothing to do
    return;
  }

  console.log(`[Wallet] Chain mismatch (got ${currentChainId}, need ${SEPOLIA_CHAIN_ID_DEC}). Requesting switch to Sepolia…`);

  try {
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: SEPOLIA_CHAIN_ID_HEX }],
    });
  } catch (switchErr: any) {
    // Error code 4902 = chain not added to MetaMask yet
    if (switchErr?.code === 4902) {
      throw new Error(
        'Sepolia network is not configured in your MetaMask. ' +
        'Please add it manually: Settings → Networks → Add Network → Sepolia.',
      );
    }
    // User rejected the switch request
    throw new Error(
      `Please switch MetaMask to the Sepolia network (chain ID ${SEPOLIA_CHAIN_ID_DEC}) to cast your vote.`,
    );
  }

  // Re-verify after the switch
  const verifyRaw: string = await ethereum.request({ method: 'eth_chainId' });
  const verifiedChainId = parseInt(verifyRaw, 16);
  if (verifiedChainId !== SEPOLIA_CHAIN_ID_DEC) {
    throw new Error(
      `Chain switch failed. Provider reports chain ${verifiedChainId} after switch attempt. ` +
      `Expected Sepolia (${SEPOLIA_CHAIN_ID_DEC}).`,
    );
  }

  console.log('[Wallet] Successfully switched to Sepolia.');
}

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
export async function getConnectedAccount(): Promise<string | null> {
  if (typeof window === 'undefined' || !(window as any).ethereum) {
    return null;
  }
  try {
    const existing: string[] = await (window as any).ethereum.request({ method: 'eth_accounts' });
    if (existing && existing.length > 0) {
      return existing[0];
    }
  } catch {
    // Ignore
  }
  return null;
}

export async function connectWallet(): Promise<string | null> {
  if (typeof window === 'undefined' || !(window as any).ethereum) {
    return null;
  }

  const ethereum = (window as any).ethereum;

  // Step 1: check already-connected accounts (no popup)
  try {
    const existing = await getConnectedAccount();
    if (existing) {
      return existing;
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
 *
 * Before sending the transaction this function verifies — and if necessary requests
 * a switch to — the Sepolia chain, resolving the viem v2 + MetaMask stale-chain
 * mismatch that surfaces as:
 *   "The current chain of the wallet (id: 1) does not match the target chain (id: 11155111)"
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

  // ── Chain guard ──────────────────────────────────────────────────────────
  // Must run BEFORE creating the walletClient so that when viem checks the
  // provider's chain it sees 11155111, not a stale cached value.
  await ensureSepoliaChain(ethereum);
  // ─────────────────────────────────────────────────────────────────────────

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
