export interface VoteTransactionResult {
  transactionId: string;
  transactionHash: string;
  blockNumber: number;
  status: 'pending' | 'confirmed' | 'failed';
  electionId: string;
  candidateId: string;
  voterId: string;
  timestamp: string;
}

export interface TransactionStatusResult {
  transactionId: string;
  status: 'pending' | 'confirmed' | 'failed';
  confirmations: number;
  timestamp: string;
}

export interface IBlockchainService {
  castVote(electionId: string, candidateId: string, voterId: string): Promise<VoteTransactionResult>;
  getTransactionStatus(transactionId: string): Promise<TransactionStatusResult>;
}

export class BlockchainService implements IBlockchainService {
  async castVote(electionId: string, candidateId: string, voterId: string): Promise<VoteTransactionResult> {
    const mockTxId = `tx-${Date.now()}`;
    const mockTxHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

    return {
      transactionId: mockTxId,
      transactionHash: mockTxHash,
      blockNumber: 1048291,
      status: 'confirmed',
      electionId,
      candidateId,
      voterId,
      timestamp: new Date().toISOString()
    };
  }

  async getTransactionStatus(transactionId: string): Promise<TransactionStatusResult> {
    return {
      transactionId,
      status: 'confirmed',
      confirmations: 12,
      timestamp: new Date().toISOString()
    };
  }
}

export const blockchainService = new BlockchainService();
