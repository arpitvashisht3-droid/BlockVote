import path from 'path';
import dotenv from 'dotenv';

// Load environment variables reliably from backend/.env regardless of CWD
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

export interface AppConfig {
  port: number;
  supabase: {
    url: string;
    serviceRoleKey: string;
  };
  blockchain: {
    rpcUrl: string;
    contractAddress: string;
    privateKey?: string;
  };
}

export const config: AppConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  supabase: {
    url: process.env.SUPABASE_URL || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  },
  blockchain: {
    rpcUrl: process.env.BLOCKCHAIN_RPC_URL || 'http://127.0.0.1:8545',
    // Fallback is the active local Hardhat deployment.
    // Set BLOCKCHAIN_CONTRACT_ADDRESS in backend/.env to override for Sepolia or other networks.
    contractAddress: process.env.BLOCKCHAIN_CONTRACT_ADDRESS || '0xe7f1725e7734ce288f8367e1bb143e90bb3f0512',
    privateKey: process.env.BLOCKCHAIN_PRIVATE_KEY || ''
  }
};
