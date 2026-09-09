import { createClient, SupabaseClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { config } from '../config/env';

// ── Core Types ──────────────────────────────────────────────────────────────

export interface Election {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'completed';
  createdAt: string;
  // Election type & eligibility fields
  type?: 'Society Election' | 'College Election' | 'University Election';
  societyName?: string;
  collegeName?: string;
  collegeId?: string;
  universityName?: string;
  secretCodeHash?: string;
  conductorId?: string;
  maxVoters?: number;
}

export interface CreateElectionInput {
  id?: string;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: 'upcoming' | 'active' | 'live' | 'completed' | 'ended';
  type?: Election['type'];
  societyName?: string;
  collegeName?: string;
  collegeId?: string;
  universityName?: string;
  secretCode?: string; // plaintext — will be hashed before storage
  conductorId?: string;
  maxVoters?: number;
  candidates?: CreateCandidateInput[];
}

export interface Candidate {
  id: string;
  electionId: string;
  name: string;
  department?: string;
  position?: string;
  party?: string;
  manifesto?: string;
  createdAt: string;
}

export interface CreateCandidateInput {
  name: string;
  department?: string;
  position?: string;
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
  countryState?: string;
  walletAddress?: string;
  role: 'voter' | 'admin';
  isVerified: boolean;
  createdAt: string;
  // Eligibility fields
  collegeName?: string;
  collegeId?: string;
  enrollmentNumber?: string;
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
  countryState?: string;
  walletAddress?: string;
  role?: 'voter' | 'admin';
  collegeName?: string;
  collegeId?: string;
  enrollmentNumber?: string;
}

// ── Participation record (who voted, NOT who they voted for) ─────────────────

export interface Participation {
  id: string;
  electionId: string;
  voterId: string;
  voterName?: string;
  voterEmail?: string;
  timestamp: string;
  status: 'participated';
}

export interface CreateParticipationInput {
  electionId: string;
  voterId: string;
  voterName?: string;
  voterEmail?: string;
}

// ── Discarded vote audit record ──────────────────────────────────────────────

export interface DiscardedVote {
  id: string;
  electionId: string;
  voteId?: string;
  txHash?: string;
  voterId?: string;
  voterName?: string;
  voterEmail?: string;
  reason: string;
  discardedBy: string; // conductorId
  discardedByName?: string;
  discardedAt: string;
  status: 'discarded';
}

export interface CreateDiscardedVoteInput {
  electionId: string;
  voteId?: string;
  txHash?: string;
  voterId?: string;
  voterName?: string;
  voterEmail?: string;
  reason: string;
  discardedBy: string;
  discardedByName?: string;
}

// ── College ID upload record ─────────────────────────────────────────────────

export interface CollegeIdUpload {
  id: string;
  voterId: string;
  electionId?: string;
  filePath: string;       // server-side path (never exposed publicly)
  originalName: string;
  mimeType: string;
  verificationStatus: 'pending';
  uploadedAt: string;
}

// ── DB Schema ─────────────────────────────────────────────────────────────────

interface LocalDatabaseSchema {
  users: User[];
  elections: Election[];
  candidates: Candidate[];
  participations: Participation[];
  discardedVotes: DiscardedVote[];
  collegeIdUploads: CollegeIdUpload[];
}

export interface ISupabaseService {
  getElections(): Promise<Election[]>;
  getElectionById(id: string): Promise<Election | null>;
  createElection(data: CreateElectionInput): Promise<Election>;
  updateElection(id: string, data: Partial<Election>): Promise<Election | null>;
  getCandidatesByElectionId(electionId: string): Promise<Candidate[]>;
  createCandidate(electionId: string, data: CreateCandidateInput): Promise<Candidate>;
  getUserById(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  getUserByUsername(username: string): Promise<User | null>;
  createUser(data: CreateUserInput): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | null>;
  verifyPassword(password: string, hash: string): Promise<boolean>;
  verifyElectionSecretCode(electionId: string, code: string): Promise<boolean>;
  // Participation
  createParticipation(data: CreateParticipationInput): Promise<Participation>;
  getParticipationsByElection(electionId: string): Promise<Participation[]>;
  hasVoterParticipated(electionId: string, voterId: string): Promise<boolean>;
  getElectionsVoterParticipatedIn(voterId: string): Promise<string[]>;
  // Discarded votes
  createDiscardedVote(data: CreateDiscardedVoteInput): Promise<DiscardedVote>;
  getDiscardedVotesByElection(electionId: string): Promise<DiscardedVote[]>;
  // College ID uploads
  createCollegeIdUpload(data: Omit<CollegeIdUpload, 'id'>): Promise<CollegeIdUpload>;
  getCollegeIdUploadsByVoter(voterId: string): Promise<CollegeIdUpload[]>;
}

function getDbPath(): string {
  const envPath = process.env.DB_PATH;
  if (envPath && envPath.trim().length > 0) {
    return path.resolve(envPath.trim());
  }
  return config.dbPath || path.join(__dirname, '../../data/db.json');
}

export class SupabaseService implements ISupabaseService {
  private supabase: SupabaseClient | null = null;
  private localDb: LocalDatabaseSchema = {
    users: [],
    elections: [],
    candidates: [],
    participations: [],
    discardedVotes: [],
    collegeIdUploads: [],
  };

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
    const dbFilePath = getDbPath();
    const dir = path.dirname(dbFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (fs.existsSync(dbFilePath)) {
      try {
        const raw = fs.readFileSync(dbFilePath, 'utf-8');
        const parsed = JSON.parse(raw);
        // Merge parsed data, ensuring new arrays exist
        this.localDb = {
          users: parsed.users || [],
          elections: parsed.elections || [],
          candidates: parsed.candidates || [],
          participations: parsed.participations || [],
          discardedVotes: parsed.discardedVotes || [],
          collegeIdUploads: parsed.collegeIdUploads || [],
        };
      } catch (err) {
        console.error(`Failed to read database at ${dbFilePath}:`, err);
        this.localDb = {
          users: [],
          elections: [],
          candidates: [],
          participations: [],
          discardedVotes: [],
          collegeIdUploads: [],
        };
      }
    } else {
      // Default seed data
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
            createdAt: new Date().toISOString(),
          },
        ],
        elections: [],
        candidates: [],
        participations: [],
        discardedVotes: [],
        collegeIdUploads: [],
      };
      this.saveLocalDb();
    }
  }

  private saveLocalDb() {
    const dbFilePath = getDbPath();
    try {
      const dir = path.dirname(dbFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(dbFilePath, JSON.stringify(this.localDb, null, 2));
    } catch (err) {
      console.error(`Failed to save local db at ${dbFilePath}:`, err);
    }
  }

  // ── Elections ──────────────────────────────────────────────────────────────

  async getElections(): Promise<Election[]> {
    if (this.supabase) {
      try {
        const { data, error } = await this.supabase.from('elections').select('*');
        if (!error && data && data.length > 0) return data as Election[];
      } catch { /* fallback */ }
    }
    return this.localDb.elections;
  }

  async getElectionById(id: string): Promise<Election | null> {
    if (this.supabase) {
      try {
        const { data, error } = await this.supabase.from('elections').select('*').eq('id', id).single();
        if (!error && data) return data as Election;
      } catch { /* fallback */ }
    }
    return this.localDb.elections.find(e => e.id === id) || null;
  }

  async createElection(data: CreateElectionInput): Promise<Election> {
    const now = new Date().toISOString();
    let secretCodeHash: string | undefined;
    if (data.secretCode && data.secretCode.trim()) {
      secretCodeHash = await bcrypt.hash(data.secretCode.trim(), 10);
    }

    const newElection: Election = {
      id: data.id || `elec-${Date.now()}`,
      title: data.title,
      description: data.description || '',
      startDate: data.startDate || now,
      endDate: data.endDate || now,
      status: (data.status as any) || 'upcoming',
      createdAt: now,
      type: data.type,
      societyName: data.societyName,
      collegeName: data.collegeName,
      collegeId: data.collegeId,
      universityName: data.universityName,
      secretCodeHash,
      conductorId: data.conductorId,
      maxVoters: data.maxVoters,
    };

    this.localDb.elections.push(newElection);

    if (Array.isArray(data.candidates) && data.candidates.length > 0) {
      for (const candInput of data.candidates) {
        const candidate: Candidate = {
          id: `cand-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          electionId: newElection.id,
          name: candInput.name,
          department: candInput.department || '',
          position: candInput.position || '',
          party: candInput.party || 'Independent',
          manifesto: candInput.manifesto || '',
          createdAt: now,
        };
        this.localDb.candidates.push(candidate);
      }
    }

    this.saveLocalDb();
    return newElection;
  }

  async updateElection(id: string, data: Partial<Election>): Promise<Election | null> {
    const idx = this.localDb.elections.findIndex(e => e.id === id);
    if (idx === -1) return null;
    // Never overwrite secretCodeHash directly from raw data
    const { secretCodeHash: _ignored, ...safeData } = data;
    this.localDb.elections[idx] = { ...this.localDb.elections[idx], ...safeData };
    this.saveLocalDb();
    return this.localDb.elections[idx];
  }

  async verifyElectionSecretCode(electionId: string, code: string): Promise<boolean> {
    const election = await this.getElectionById(electionId);
    if (!election || !election.secretCodeHash) return false;
    return bcrypt.compare(code, election.secretCodeHash);
  }

  // ── Candidates ─────────────────────────────────────────────────────────────

  async getCandidatesByElectionId(electionId: string): Promise<Candidate[]> {
    if (this.supabase) {
      try {
        const { data, error } = await this.supabase.from('candidates').select('*').eq('election_id', electionId);
        if (!error && data && data.length > 0) return data as Candidate[];
      } catch { /* fallback */ }
    }
    return this.localDb.candidates.filter(c => c.electionId === electionId);
  }

  async createCandidate(electionId: string, data: CreateCandidateInput): Promise<Candidate> {
    const now = new Date().toISOString();
    const candidate: Candidate = {
      id: `cand-${Date.now()}`,
      electionId,
      name: data.name,
      department: data.department || '',
      position: data.position || '',
      party: data.party || 'Independent',
      manifesto: data.manifesto || '',
      createdAt: now,
    };
    this.localDb.candidates.push(candidate);
    this.saveLocalDb();
    return candidate;
  }

  // ── Users ──────────────────────────────────────────────────────────────────

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
            createdAt: data.created_at || new Date().toISOString(),
            collegeName: data.college_name,
            collegeId: data.college_id,
            enrollmentNumber: data.enrollment_number,
          };
        }
      } catch { /* fallback */ }
    }
    return this.localDb.users.find(u => u.id === id) || null;
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
            createdAt: data.created_at || new Date().toISOString(),
            collegeName: data.college_name,
            collegeId: data.college_id,
            enrollmentNumber: data.enrollment_number,
          };
        }
      } catch { /* fallback */ }
    }
    return this.localDb.users.find(u => u.email.toLowerCase() === cleanEmail) || null;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const cleanUsername = username.trim().toLowerCase();
    return this.localDb.users.find(u => u.username.toLowerCase() === cleanUsername) || null;
  }

  async createUser(data: CreateUserInput): Promise<User> {
    const now = new Date().toISOString();
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanUsername = (data.username || cleanEmail.split('@')[0]).trim().toLowerCase();

    const existingUser = await this.getUserByUsername(cleanUsername);
    if (existingUser) {
      throw new Error(`Username '@${cleanUsername}' is already taken. Please choose a different username.`);
    }

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
      countryState: data.countryState,
      walletAddress: data.walletAddress || '',
      role: data.role || 'voter',
      isVerified: true,
      createdAt: now,
      collegeName: data.collegeName,
      collegeId: data.collegeId,
      enrollmentNumber: data.enrollmentNumber,
    };

    this.localDb.users.push(newUser);
    this.saveLocalDb();
    return newUser;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | null> {
    const index = this.localDb.users.findIndex(u => u.id === id);
    if (index === -1) return null;

    const existing = this.localDb.users[index];

    if (data.username && data.username.trim().toLowerCase() !== existing.username.toLowerCase()) {
      const cleanUsername = data.username.trim().toLowerCase();
      const conflict = this.localDb.users.find(u => u.id !== id && u.username.toLowerCase() === cleanUsername);
      if (conflict) throw new Error(`Username '@${cleanUsername}' is already taken.`);
    }

    // If password change is requested, hash it
    let updatedPasswordHash = existing.passwordHash;
    if ((data as any).newPassword) {
      updatedPasswordHash = await bcrypt.hash((data as any).newPassword, 10);
    }

    const updated: User = {
      ...existing,
      ...data,
      email: data.email ? data.email.trim().toLowerCase() : existing.email,
      username: data.username ? data.username.trim().toLowerCase() : existing.username,
      name: data.name ? data.name.trim() : existing.name,
      passwordHash: updatedPasswordHash,
    };
    // Never allow passwordHash to be overwritten from outside via plain data
    delete (updated as any).newPassword;

    this.localDb.users[index] = updated;
    this.saveLocalDb();
    return updated;
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    if (!password || !hash) return false;
    return bcrypt.compare(password, hash);
  }

  // ── Participation ──────────────────────────────────────────────────────────

  async createParticipation(data: CreateParticipationInput): Promise<Participation> {
    // Idempotent — only one record per (voter, election)
    const existing = this.localDb.participations.find(
      p => p.electionId === data.electionId && p.voterId === data.voterId
    );
    if (existing) return existing;

    const record: Participation = {
      id: `part-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      electionId: data.electionId,
      voterId: data.voterId,
      voterName: data.voterName,
      voterEmail: data.voterEmail,
      timestamp: new Date().toISOString(),
      status: 'participated',
    };

    this.localDb.participations.push(record);
    this.saveLocalDb();
    return record;
  }

  async getParticipationsByElection(electionId: string): Promise<Participation[]> {
    return this.localDb.participations.filter(p => p.electionId === electionId);
  }

  async hasVoterParticipated(electionId: string, voterId: string): Promise<boolean> {
    return this.localDb.participations.some(
      p => p.electionId === electionId && p.voterId === voterId
    );
  }

  async getElectionsVoterParticipatedIn(voterId: string): Promise<string[]> {
    return this.localDb.participations
      .filter(p => p.voterId === voterId)
      .map(p => p.electionId);
  }

  // ── Discarded Votes ────────────────────────────────────────────────────────

  async createDiscardedVote(data: CreateDiscardedVoteInput): Promise<DiscardedVote> {
    const record: DiscardedVote = {
      id: `disc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      electionId: data.electionId,
      voteId: data.voteId,
      txHash: data.txHash,
      voterId: data.voterId,
      voterName: data.voterName,
      voterEmail: data.voterEmail,
      reason: data.reason,
      discardedBy: data.discardedBy,
      discardedByName: data.discardedByName,
      discardedAt: new Date().toISOString(),
      status: 'discarded',
    };

    this.localDb.discardedVotes.push(record);
    this.saveLocalDb();
    return record;
  }

  async getDiscardedVotesByElection(electionId: string): Promise<DiscardedVote[]> {
    return this.localDb.discardedVotes.filter(d => d.electionId === electionId);
  }

  // ── College ID Uploads ─────────────────────────────────────────────────────

  async createCollegeIdUpload(data: Omit<CollegeIdUpload, 'id'>): Promise<CollegeIdUpload> {
    const record: CollegeIdUpload = {
      id: `upload-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      ...data,
    };
    this.localDb.collegeIdUploads.push(record);
    this.saveLocalDb();
    return record;
  }

  async getCollegeIdUploadsByVoter(voterId: string): Promise<CollegeIdUpload[]> {
    return this.localDb.collegeIdUploads.filter(u => u.voterId === voterId);
  }
}

export const supabaseService = new SupabaseService();
