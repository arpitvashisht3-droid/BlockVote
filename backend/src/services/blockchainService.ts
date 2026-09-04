import { createPublicClient, createWalletClient, http, PublicClient, WalletClient, parseAbi, parseEventLogs } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { hardhat } from 'viem/chains';
import { config } from '../config/env';

export interface VoteTransactionResult {
  transactionId: string;
  transactionHash: string;
  blockNumber: number;
  status: 'pending' | 'confirmed' | 'failed';
  electionId: string;
  candidateId: string;
  timestamp: string;
}

export interface TransactionReceiptResult {
  transactionHash: string;
  blockNumber: number;
  status: 'pending' | 'confirmed' | 'failed';
  confirmations: number;
  timestamp: string;
  from?: string;
}

export interface CreateOnchainElectionResult {
  onchainElectionId: number;
  transactionHash: string;
  blockNumber: number;
}

export interface AddOnchainCandidateResult {
  onchainCandidateId: number;
  transactionHash: string;
  blockNumber: number;
}

export interface LifecycleTransactionResult {
  transactionHash: string;
  blockNumber: number;
}

export interface IBlockchainService {
  getTransactionReceipt(transactionHash: string): Promise<TransactionReceiptResult>;
  verifyContractState(onchainElectionId: number): Promise<boolean>;
  createOnchainElection(
    title: string,
    description: string,
    startTimeSeconds: number,
    endTimeSeconds: number
  ): Promise<CreateOnchainElectionResult>;
  addOnchainCandidate(
    onchainElectionId: number,
    name: string,
    description: string
  ): Promise<AddOnchainCandidateResult>;
  pauseOnchainElection(onchainElectionId: number): Promise<LifecycleTransactionResult>;
  resumeOnchainElection(onchainElectionId: number): Promise<LifecycleTransactionResult>;
  endOnchainElection(onchainElectionId: number): Promise<LifecycleTransactionResult>;
}

const BLOCKVOTE_ABI = parseAbi([
  'function createElection(string _title, string _description, uint256 _startTime, uint256 _endTime) external returns (uint256)',
  'function addCandidate(uint256 _electionId, string _name, string _description) external',
  'function pauseElection(uint256 _electionId) external',
  'function resumeElection(uint256 _electionId) external',
  'function endElection(uint256 _electionId) external',
  'function elections(uint256) view returns (uint256 id, string title, string description, uint256 startTime, uint256 endTime, bool isPaused, bool exists)',
  'function isEligible(uint256 _electionId, address _voter) view returns (bool)',
  'function hasVoted(uint256 _electionId, address _voter) view returns (bool)',
  'event ElectionCreated(uint256 indexed electionId, string title, uint256 startTime, uint256 endTime)',
  'event CandidateAdded(uint256 indexed electionId, uint256 indexed candidateId, string name)',
  'event VoteCast(uint256 indexed electionId, uint256 indexed candidateId, address indexed voter)',
  'event ElectionPaused(uint256 indexed electionId)',
  'event ElectionResumed(uint256 indexed electionId)',
  'event ElectionEnded(uint256 indexed electionId, uint256 endTime)',
]);

export class BlockchainService implements IBlockchainService {
  private client: PublicClient;

  constructor() {
    this.client = createPublicClient({
      transport: http(config.blockchain.rpcUrl),
    });
  }

  private getAdminWalletClient(): WalletClient {
    if (!config.blockchain.privateKey) {
      throw new Error('BLOCKCHAIN_PRIVATE_KEY is not configured in backend environment.');
    }
    const formattedKey = config.blockchain.privateKey.startsWith('0x')
      ? (config.blockchain.privateKey as `0x${string}`)
      : (`0x${config.blockchain.privateKey}` as `0x${string}`);
    const account = privateKeyToAccount(formattedKey);
    return createWalletClient({
      account,
      chain: hardhat,
      transport: http(config.blockchain.rpcUrl),
    });
  }

  /**
   * Fetches and verifies an EVM transaction receipt on-chain using viem.
   */
  async getTransactionReceipt(transactionHash: string): Promise<TransactionReceiptResult> {
    const formattedHash = transactionHash.startsWith('0x')
      ? (transactionHash as `0x${string}`)
      : (`0x${transactionHash}` as `0x${string}`);

    try {
      const receipt = await this.client.getTransactionReceipt({ hash: formattedHash });

      const currentBlock = await this.client.getBlockNumber();
      const confirmations = Number(currentBlock - receipt.blockNumber + 1n);

      return {
        transactionHash: receipt.transactionHash,
        blockNumber: Number(receipt.blockNumber),
        status: receipt.status === 'success' ? 'confirmed' : 'failed',
        confirmations: confirmations > 0 ? confirmations : 1,
        timestamp: new Date().toISOString(),
        from: receipt.from,
      };
    } catch (error) {
      console.error(`[BlockchainService] Failed to fetch on-chain transaction receipt for ${transactionHash} from RPC (${config.blockchain.rpcUrl}):`, (error as Error).message);
      throw new Error(`Transaction receipt not found on-chain for hash ${transactionHash}: ${(error as Error).message}`);
    }
  }

  /**
   * Reads smart contract election existence on-chain.
   */
  async verifyContractState(onchainElectionId: number): Promise<boolean> {
    try {
      const election = await this.client.readContract({
        address: config.blockchain.contractAddress as `0x${string}`,
        abi: BLOCKVOTE_ABI,
        functionName: 'elections',
        args: [BigInt(onchainElectionId)],
      });

      return Boolean((election as any)[6]); // exists field (index 6 after isPaused)
    } catch (error) {
      console.error(`[BlockchainService] On-chain election query failed for id ${onchainElectionId}:`, (error as Error).message);
      throw error;
    }
  }

  /**
   * Provisions a new election on-chain using the admin/owner wallet signer.
   */
  async createOnchainElection(
    title: string,
    description: string,
    startTimeSeconds: number,
    endTimeSeconds: number
  ): Promise<CreateOnchainElectionResult> {
    const walletClient = this.getAdminWalletClient();
    const address = config.blockchain.contractAddress as `0x${string}`;

    try {
      const txHash = await (walletClient as any).writeContract({
        address,
        abi: BLOCKVOTE_ABI,
        functionName: 'createElection',
        args: [title, description, BigInt(startTimeSeconds), BigInt(endTimeSeconds)],
      });

      const receipt = await this.client.waitForTransactionReceipt({ hash: txHash });
      const logs = parseEventLogs({
        abi: BLOCKVOTE_ABI,
        eventName: 'ElectionCreated',
        logs: receipt.logs,
      });

      if (!logs || logs.length === 0) {
        throw new Error(`ElectionCreated event not found in receipt for tx ${txHash}`);
      }

      const onchainElectionId = Number((logs[0].args as any).electionId);

      return {
        onchainElectionId,
        transactionHash: receipt.transactionHash,
        blockNumber: Number(receipt.blockNumber),
      };
    } catch (error) {
      console.error(`[BlockchainService] Failed to create election on-chain:`, (error as Error).message);
      throw new Error(`On-chain election creation failed: ${(error as Error).message}`);
    }
  }

  /**
   * Provisions a new candidate for an election on-chain using the admin/owner wallet signer.
   */
  async addOnchainCandidate(
    onchainElectionId: number,
    name: string,
    description: string
  ): Promise<AddOnchainCandidateResult> {
    const walletClient = this.getAdminWalletClient();
    const address = config.blockchain.contractAddress as `0x${string}`;

    try {
      const txHash = await (walletClient as any).writeContract({
        address,
        abi: BLOCKVOTE_ABI,
        functionName: 'addCandidate',
        args: [BigInt(onchainElectionId), name, description],
      });

      const receipt = await this.client.waitForTransactionReceipt({ hash: txHash });
      const logs = parseEventLogs({
        abi: BLOCKVOTE_ABI,
        eventName: 'CandidateAdded',
        logs: receipt.logs,
      });

      if (!logs || logs.length === 0) {
        throw new Error(`CandidateAdded event not found in receipt for tx ${txHash}`);
      }

      const onchainCandidateId = Number((logs[0].args as any).candidateId);

      return {
        onchainCandidateId,
        transactionHash: receipt.transactionHash,
        blockNumber: Number(receipt.blockNumber),
      };
    } catch (error) {
      console.error(`[BlockchainService] Failed to add candidate on-chain:`, (error as Error).message);
      throw new Error(`On-chain candidate creation failed: ${(error as Error).message}`);
    }
  }

  /**
   * Pauses an election on-chain using the admin/owner wallet signer.
   */
  async pauseOnchainElection(onchainElectionId: number): Promise<LifecycleTransactionResult> {
    const walletClient = this.getAdminWalletClient();
    const address = config.blockchain.contractAddress as `0x${string}`;

    try {
      const txHash = await (walletClient as any).writeContract({
        address,
        abi: BLOCKVOTE_ABI,
        functionName: 'pauseElection',
        args: [BigInt(onchainElectionId)],
      });

      const receipt = await this.client.waitForTransactionReceipt({ hash: txHash });

      if (receipt.status !== 'success') {
        throw new Error(`pauseElection transaction reverted on-chain for tx ${txHash}`);
      }

      return {
        transactionHash: receipt.transactionHash,
        blockNumber: Number(receipt.blockNumber),
      };
    } catch (error) {
      console.error(`[BlockchainService] Failed to pause election ${onchainElectionId} on-chain:`, (error as Error).message);
      throw new Error(`On-chain pauseElection failed: ${(error as Error).message}`);
    }
  }

  /**
   * Resumes an election on-chain using the admin/owner wallet signer.
   */
  async resumeOnchainElection(onchainElectionId: number): Promise<LifecycleTransactionResult> {
    const walletClient = this.getAdminWalletClient();
    const address = config.blockchain.contractAddress as `0x${string}`;

    try {
      const txHash = await (walletClient as any).writeContract({
        address,
        abi: BLOCKVOTE_ABI,
        functionName: 'resumeElection',
        args: [BigInt(onchainElectionId)],
      });

      const receipt = await this.client.waitForTransactionReceipt({ hash: txHash });

      if (receipt.status !== 'success') {
        throw new Error(`resumeElection transaction reverted on-chain for tx ${txHash}`);
      }

      return {
        transactionHash: receipt.transactionHash,
        blockNumber: Number(receipt.blockNumber),
      };
    } catch (error) {
      console.error(`[BlockchainService] Failed to resume election ${onchainElectionId} on-chain:`, (error as Error).message);
      throw new Error(`On-chain resumeElection failed: ${(error as Error).message}`);
    }
  }

  /**
   * Ends an election on-chain using the admin/owner wallet signer.
   */
  async endOnchainElection(onchainElectionId: number): Promise<LifecycleTransactionResult> {
    const walletClient = this.getAdminWalletClient();
    const address = config.blockchain.contractAddress as `0x${string}`;

    try {
      const txHash = await (walletClient as any).writeContract({
        address,
        abi: BLOCKVOTE_ABI,
        functionName: 'endElection',
        args: [BigInt(onchainElectionId)],
      });

      const receipt = await this.client.waitForTransactionReceipt({ hash: txHash });

      if (receipt.status !== 'success') {
        throw new Error(`endElection transaction reverted on-chain for tx ${txHash}`);
      }

      return {
        transactionHash: receipt.transactionHash,
        blockNumber: Number(receipt.blockNumber),
      };
    } catch (error) {
      console.error(`[BlockchainService] Failed to end election ${onchainElectionId} on-chain:`, (error as Error).message);
      throw new Error(`On-chain endElection failed: ${(error as Error).message}`);
    }
  }
}

export const blockchainService = new BlockchainService();
