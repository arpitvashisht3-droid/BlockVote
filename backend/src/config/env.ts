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
    contractAddress: process.env.BLOCKCHAIN_CONTRACT_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    privateKey: process.env.BLOCKCHAIN_PRIVATE_KEY || ''
  }
};
