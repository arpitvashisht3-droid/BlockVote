import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file if available
dotenv.config();

export interface AppConfig {
  port: number;
  dbPath: string;
  frontendUrl: string;
  supabase: {
    url: string;
    key: string;
  };
  blockchain: {
    rpcUrl: string;
    contractAddress: string;
  };
}

export const config: AppConfig = {
  port: parseInt(process.env.PORT || '5000', 10),
  dbPath: process.env.DB_PATH || path.join(__dirname, '../../data/db.json'),
  frontendUrl: process.env.FRONTEND_URL || '',
  supabase: {
    url: process.env.SUPABASE_URL || '',
    key: process.env.SUPABASE_KEY || ''
  },
  blockchain: {
    rpcUrl: process.env.BLOCKCHAIN_RPC_URL || '',
    contractAddress: process.env.BLOCKCHAIN_CONTRACT_ADDRESS || ''
  }
};
