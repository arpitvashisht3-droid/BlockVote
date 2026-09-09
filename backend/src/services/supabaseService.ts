import { createClient, SupabaseClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { config } from '../config/env';

export interface Election {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'completed';
  createdAt: string;
}

export interface CreateElectionInput {
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: 'upcoming' | 'active' | 'completed';
}

export interface Candidate {
  id: string;
  electionId: string;
  name: string;
  party?: string;
  manifesto?: string;
  createdAt: string;
}

export interface CreateCandidateInput {
  name: string;
  party?: string;
  manifesto?: string;
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  passwordHash?: string;
  phone?: string;
  dateOfBirth?: string;
  country?: string;
  state?: string;
  city?: string;
  walletAddress?: string;
  role: 'voter' | 'admin';
  isVerified: boolean;
  createdAt: string;
}

export interface CreateUserInput {
  name: string;
  username?: string;
  email: string;
  password?: string;
  phone?: string;
  dateOfBirth?: string;
  country?: string;
  state?: string;
  city?: string;
  walletAddress?: string;
  role?: 'voter' | 'admin';
}

export interface ISupabaseService {
  getElections(): Promise<Election[]>;
  getElectionById(id: string): Promise<Election | null>;
  createElection(data: CreateElectionInput): Promise<Election>;
  getCandidatesByElectionId(electionId: string): Promise<Candidate[]>;
  createCandidate(electionId: string, data: CreateCandidateInput): Promise<Candidate>;
  getUserById(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  getUserByUsername(username: string): Promise<User | null>;
  createUser(data: CreateUserInput): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | null>;
  verifyPassword(password: string, hash: string): Promise<boolean>;
}

const DB_FILE_PATH = path.join(__dirname, '../../data/db.json');

interface LocalDatabaseSchema {
  users: User[];
  elections: Election[];
  candidates: Candidate[];
}

export class SupabaseService implements ISupabaseService {
  private supabase: SupabaseClient | null = null;
  private localDb: LocalDatabaseSchema = { users: [], elections: [], candidates: [] };

  constructor() {
    if (config.supabase.url && config.supabase.key) {
      try {
        this.supabase = createClient(config.supabase.url, config.supabase.key);
      } catch (err) {
        console.warn('Could not initialize Supabase client:', err);
      }
    }
    this.initLocalDb();
  }

  private initLocalDb() {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (fs.existsSync(DB_FILE_PATH)) {
      try {
        const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        this.localDb = JSON.parse(raw);
      } catch {
        this.localDb = { users: [], elections: [], candidates: [] };
      }
    } else {
      this.localDb = {
        users: [
          {
            id: 'usr-default',
            name: 'Manan Sharma',
            username: 'manan123',
            email: 'manan123@gmail.com',
            passwordHash: bcrypt.hashSync('password123', 10),
            phone: '+91 98765 43210',
            country: 'India',
            state: 'Maharashtra',
            city: 'Mumbai',
            walletAddress: '0xd6ac...f51d',
            role: 'voter',
            isVerified: true,
            createdAt: new Date().toISOString()
          }
        ],
        elections: [
          {
            id: 'elec-1',
            title: 'Presidential Election 2026',
            description: 'National General Election',
            startDate: '2026-10-01T00:00:00Z',
            endDate: '2026-10-02T00:00:00Z',
            status: 'upcoming',
            createdAt: '2026-09-01T00:00:00Z'
          },
          {
            id: 'elec-2',
            title: 'Student Council Representative',
            description: 'University Student Body Election',
            startDate: '2026-09-01T00:00:00Z',
            endDate: '2026-09-15T00:00:00Z',
            status: 'active',
            createdAt: '2026-09-01T00:00:00Z'
          }
        ],
        candidates: [
          {
            id: 'cand-1',
            electionId: 'elec-2',
            name: 'Alice Johnson',
            party: 'Progressive Party',
            manifesto: 'Decentralized transparency for all.',
            createdAt: '2026-09-01T00:00:00Z'
          },
          {
            id: 'cand-2',
            electionId: 'elec-2',
            name: 'Bob Smith',
            party: 'Innovation Party',
            manifesto: 'Building secure future voting.',
            createdAt: '2026-09-01T00:00:00Z'
          }
        ]
      };
      this.saveLocalDb();
    }
  }

  private saveLocalDb() {
    try {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(this.localDb, null, 2));
    } catch (err) {
      console.error('Failed to save local db:', err);
    }
  }

  async getElections(): Promise<Election[]> {
    if (this.supabase) {
      try {
        const { data, error } = await this.supabase.from('elections').select('*');
        if (!error && data && data.length > 0) {
          return data as Election[];
        }
      } catch {
        // Fallback to local
      }
    }
    return this.localDb.elections;
  }

  async getElectionById(id: string): Promise<Election | null> {
    if (this.supabase) {
      try {
        const { data, error } = await this.supabase.from('elections').select('*').eq('id', id).single();
        if (!error && data) return data as Election;
      } catch {
        // Fallback
      }
    }
    return this.localDb.elections.find(e => e.id === id) || null;
  }

  async createElection(data: CreateElectionInput): Promise<Election> {
    const now = new Date().toISOString();
    const newElection: Election = {
      id: `elec-${Date.now()}`,
      title: data.title,
      description: data.description || '',
      startDate: data.startDate || now,
      endDate: data.endDate || now,
      status: data.status || 'upcoming',
      createdAt: now
    };
    if (this.supabase) {
      try {
        await this.supabase.from('elections').insert([newElection]);
      } catch {
        // fallback
      }
    }
    this.localDb.elections.push(newElection);
    this.saveLocalDb();
    return newElection;
  }

  async getCandidatesByElectionId(electionId: string): Promise<Candidate[]> {
    if (this.supabase) {
      try {
        const { data, error } = await this.supabase.from('candidates').select('*').eq('election_id', electionId);
        if (!error && data && data.length > 0) return data as Candidate[];
      } catch {
        // fallback
      }
    }
    return this.localDb.candidates.filter(c => c.electionId === electionId);
  }

  async createCandidate(electionId: string, data: CreateCandidateInput): Promise<Candidate> {
    const now = new Date().toISOString();
    const candidate: Candidate = {
      id: `cand-${Date.now()}`,
      electionId,
      name: data.name,
      party: data.party || 'Independent',
      manifesto: data.manifesto || '',
      createdAt: now
    };
    this.localDb.candidates.push(candidate);
    this.saveLocalDb();
    return candidate;
  }

  async getUserById(id: string): Promise<User | null> {
    if (this.supabase) {
      try {
        const { data, error } = await this.supabase.from('users').select('*').eq('id', id).single();
        if (!error && data) {
          return {
            id: data.id,
            name: data.full_name || data.name,
            username: data.username || data.email.split('@')[0],
            email: data.email,
            phone: data.phone,
            dateOfBirth: data.date_of_birth,
            country: data.country,
            state: data.state,
            city: data.city,
            walletAddress: data.wallet_address,
            role: data.role || 'voter',
            isVerified: data.is_verified ?? true,
            createdAt: data.created_at || new Date().toISOString()
          };
        }
      } catch {
        // fallback
      }
    }
    const localUser = this.localDb.users.find(u => u.id === id);
    return localUser || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const cleanEmail = email.trim().toLowerCase();
    if (this.supabase) {
      try {
        const { data, error } = await this.supabase.from('users').select('*').eq('email', cleanEmail).single();
        if (!error && data) {
          return {
            id: data.id,
            name: data.full_name || data.name,
            username: data.username || cleanEmail.split('@')[0],
            email: data.email,
            passwordHash: data.password_hash,
            phone: data.phone,
            dateOfBirth: data.date_of_birth,
            country: data.country,
            state: data.state,
            city: data.city,
            walletAddress: data.wallet_address,
            role: data.role || 'voter',
            isVerified: data.is_verified ?? true,
            createdAt: data.created_at || new Date().toISOString()
          };
        }
      } catch {
        // fallback
      }
    }
    const localUser = this.localDb.users.find(u => u.email.toLowerCase() === cleanEmail);
    return localUser || null;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const cleanUsername = username.trim().toLowerCase();
    const localUser = this.localDb.users.find(u => u.username.toLowerCase() === cleanUsername);
    return localUser || null;
  }

  async createUser(data: CreateUserInput): Promise<User> {
    const now = new Date().toISOString();
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanUsername = (data.username || cleanEmail.split('@')[0]).trim().toLowerCase();

    // Check unique username
    const existingUser = await this.getUserByUsername(cleanUsername);
    if (existingUser) {
      throw new Error(`Username '@${cleanUsername}' is already taken. Please choose a different username.`);
    }

    // Password hashing (salt rounds = 10)
    let passwordHash: string | undefined;
    if (data.password) {
      passwordHash = await bcrypt.hash(data.password, 10);
    }

    const newUser: User = {
      id: `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: data.name.trim(),
      username: cleanUsername,
      email: cleanEmail,
      passwordHash,
      phone: data.phone,
      dateOfBirth: data.dateOfBirth,
      country: data.country,
      state: data.state,
      city: data.city,
      walletAddress: data.walletAddress || '',
      role: data.role || 'voter',
      isVerified: true,
      createdAt: now
    };

    if (this.supabase) {
      try {
        await this.supabase.from('users').insert([
          {
            id: newUser.id,
            email: newUser.email,
            full_name: newUser.name,
            wallet_address: newUser.walletAddress,
            created_at: newUser.createdAt
          }
        ]);
      } catch {
        // fallback
      }
    }

    this.localDb.users.push(newUser);
    this.saveLocalDb();
    return newUser;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | null> {
    const index = this.localDb.users.findIndex(u => u.id === id);
    if (index === -1) return null;

    const existing = this.localDb.users[index];

    // If username is being changed, verify uniqueness
    if (data.username && data.username.trim().toLowerCase() !== existing.username.toLowerCase()) {
      const cleanUsername = data.username.trim().toLowerCase();
      const userWithSameUsername = this.localDb.users.find(
        u => u.id !== id && u.username.toLowerCase() === cleanUsername
      );
      if (userWithSameUsername) {
        throw new Error(`Username '@${cleanUsername}' is already taken.`);
      }
    }

    const updated: User = {
      ...existing,
      ...data,
      email: data.email ? data.email.trim().toLowerCase() : existing.email,
      username: data.username ? data.username.trim().toLowerCase() : existing.username,
      name: data.name ? data.name.trim() : existing.name
    };

    this.localDb.users[index] = updated;
    this.saveLocalDb();

    if (this.supabase) {
      try {
        await this.supabase.from('users').update({
          full_name: updated.name,
          wallet_address: updated.walletAddress
        }).eq('id', id);
      } catch {
        // fallback
      }
    }

    return updated;
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    if (!password || !hash) return false;
    return bcrypt.compare(password, hash);
  }
}

export const supabaseService = new SupabaseService();
