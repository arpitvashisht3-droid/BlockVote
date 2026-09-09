import dotenv from 'dotenv';

// Load environment variables from .env file if available
dotenv.config();

export interface AppConfig {
  port: number;
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
  port: parseInt(process.env.PORT || '3000', 10),
  supabase: {
    url: process.env.SUPABASE_URL || '',
    key: process.env.SUPABASE_KEY || ''
  },
  blockchain: {
    rpcUrl: process.env.BLOCKCHAIN_RPC_URL || '',
    contractAddress: process.env.BLOCKCHAIN_CONTRACT_ADDRESS || ''
  }
};
