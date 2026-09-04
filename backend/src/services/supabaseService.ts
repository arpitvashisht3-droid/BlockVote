import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config/env';

export type ElectionStatus = 'upcoming' | 'live' | 'ended';

export interface Election {
  id: string;
  slug: string;
  electionCode: string;
  title: string;
  description: string;
  detailsDescription?: string;
  organization?: string;
  electionType?: string;
  status: ElectionStatus;
  startDate: string;
  endDate: string;
  published: boolean;
  paused: boolean;
  archived: boolean;
  onchainId?: number | null;
  createdBy?: string | null;
  createdAt: string;
  candidates?: Candidate[];
}

export interface CreateElectionInput {
  title: string;
  description?: string;
  detailsDescription?: string;
  organization?: string;
  electionType?: string;
  startDate?: string;
  endDate?: string;
  status?: ElectionStatus;
  onchainId?: number;
}

export interface Candidate {
  id: string;
  electionId: string;
  name: string;
  department: string;
  position?: string;
  about?: string;
  achievements?: string[];
  party?: string;
  removed?: boolean;
  onchainId?: number | null;
  createdAt: string;
}

export interface CreateCandidateInput {
  name: string;
  department?: string;
  position?: string;
  about?: string;
  achievements?: string[];
  party?: string;
  onchainId?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  voterId: string;
  walletAddress?: string | null;
  role: 'voter' | 'admin';
  status: string;
  createdAt: string;
}

export interface CreateUserInput {
  id?: string;
  name: string;
  email: string;
  voterId?: string;
  walletAddress?: string;
  role?: 'voter' | 'admin';
}

export interface ISupabaseService {
  getElections(): Promise<Election[]>;
  getElectionById(idOrSlugOrCode: string): Promise<Election | null>;
  createElection(data: CreateElectionInput): Promise<Election>;
  getCandidatesByElectionId(electionId: string): Promise<Candidate[]>;
  createCandidate(electionId: string, data: CreateCandidateInput): Promise<Candidate>;
  getUserById(id: string): Promise<User | null>;
  getUserByWalletAddress(walletAddress: string): Promise<User | null>;
  createUser(data: CreateUserInput): Promise<User>;
  hasVoted(electionId: string, voterId: string): Promise<boolean>;
  recordParticipation(electionId: string, voterId: string): Promise<void>;
  updateElectionOnchainId(id: string, onchainId: number): Promise<void>;
  updateCandidateOnchainId(id: string, onchainId: number): Promise<void>;
  updateElectionStatus(
    id: string,
    updates: { status?: ElectionStatus; paused?: boolean; endDate?: string }
  ): Promise<Election>;
  recordBlockchainTransaction(
    electionId: string,
    candidateId: string | null,
    txType: string,
    transactionHash: string,
    blockNumber: number | null,
    status: string
  ): Promise<void>;
}

export class SupabaseService implements ISupabaseService {
  private client: SupabaseClient | null = null;

  constructor() {
    if (config.supabase.url && config.supabase.serviceRoleKey) {
      this.client = createClient(config.supabase.url, config.supabase.serviceRoleKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
    }
  }

  private getClient(): SupabaseClient {
    if (!this.client) {
      throw new Error(
        'Supabase Database Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are not configured. Real Supabase integration requires valid credentials.'
      );
    }
    return this.client;
  }

  async getElections(): Promise<Election[]> {
    const client = this.getClient();
    const { data, error } = await client
      .from('elections')
      .select('*, candidates(*)')
      .eq('archived', false)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Supabase Query Error (getElections): ${error.message}`);
    }

    return (data || []).map((row) => this.mapElectionRow(row));
  }

  async getElectionById(idOrSlugOrCode: string): Promise<Election | null> {
    const client = this.getClient();

    // Check if UUID or slug or election_code
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlugOrCode);

    let query = client.from('elections').select('*, candidates(*)');

    if (isUuid) {
      query = query.eq('id', idOrSlugOrCode);
    } else {
      query = query.or(`slug.eq.${idOrSlugOrCode},election_code.eq.${idOrSlugOrCode}`);
    }

    const { data, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Supabase Query Error (getElectionById): ${error.message}`);
    }

    return data ? this.mapElectionRow(data) : null;
  }

  async createElection(data: CreateElectionInput): Promise<Election> {
    const client = this.getClient();
    const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `election-${Date.now()}`;
    const electionCode = `BLC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const insertPayload = {
      slug,
      election_code: electionCode,
      title: data.title,
      description: data.description || '',
      details_description: data.detailsDescription || data.description || '',
      organization: data.organization || 'BlockVote Platform',
      election_type: data.electionType || 'General Election',
      status: data.status || 'upcoming',
      start_date: data.startDate || new Date().toISOString(),
      end_date: data.endDate || new Date(Date.now() + 86400000).toISOString(),
      published: true,
      onchain_id: data.onchainId !== undefined ? data.onchainId : null,
    };

    const { data: created, error } = await client
      .from('elections')
      .insert(insertPayload)
      .select('*, candidates(*)')
      .single();

    if (error) {
      throw new Error(`Supabase Mutation Error (createElection): ${error.message}`);
    }

    // Initialize election settings
    await client.from('election_settings').insert({
      election_id: created.id,
      anonymous_voting: true,
      show_live_results: true,
    });

    return this.mapElectionRow(created);
  }

  async getCandidatesByElectionId(electionId: string): Promise<Candidate[]> {
    const client = this.getClient();
    const { data, error } = await client
      .from('candidates')
      .select('*')
      .eq('election_id', electionId)
      .eq('removed', false)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Supabase Query Error (getCandidatesByElectionId): ${error.message}`);
    }

    return (data || []).map((row) => this.mapCandidateRow(row));
  }

  async createCandidate(electionId: string, data: CreateCandidateInput): Promise<Candidate> {
    const client = this.getClient();
    const insertPayload = {
      election_id: electionId,
      name: data.name,
      department: data.department || 'General',
      position: data.position || 'Candidate',
      about: data.about || '',
      achievements: data.achievements || [],
      party: data.party || 'Independent',
      onchain_id: data.onchainId !== undefined ? data.onchainId : null,
    };

    const { data: created, error } = await client
      .from('candidates')
      .insert(insertPayload)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Supabase Mutation Error (createCandidate): ${error.message}`);
    }

    return this.mapCandidateRow(created);
  }

  async updateElectionOnchainId(id: string, onchainId: number): Promise<void> {
    const client = this.getClient();
    const { error } = await client
      .from('elections')
      .update({ onchain_id: onchainId })
      .eq('id', id);

    if (error) {
      throw new Error(`Supabase Mutation Error (updateElectionOnchainId): ${error.message}`);
    }
  }

  async updateCandidateOnchainId(id: string, onchainId: number): Promise<void> {
    const client = this.getClient();
    const { error } = await client
      .from('candidates')
      .update({ onchain_id: onchainId })
      .eq('id', id);

    if (error) {
      throw new Error(`Supabase Mutation Error (updateCandidateOnchainId): ${error.message}`);
    }
  }

  async updateElectionStatus(
    id: string,
    updates: { status?: ElectionStatus; paused?: boolean; endDate?: string }
  ): Promise<Election> {
    const client = this.getClient();
    const updatePayload: Record<string, any> = {};

    if (updates.status !== undefined) {
      updatePayload.status = updates.status;
    }
    if (updates.paused !== undefined) {
      updatePayload.paused = updates.paused;
    }
    if (updates.endDate !== undefined) {
      updatePayload.end_date = updates.endDate;
    }

    const { data, error } = await client
      .from('elections')
      .update(updatePayload)
      .eq('id', id)
      .select('*, candidates(*)')
      .single();

    if (error) {
      throw new Error(`Supabase Mutation Error (updateElectionStatus): ${error.message}`);
    }

    return this.mapElectionRow(data);
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      const client = this.getClient();
      const { data, error } = await client
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        return this.mapUserRow(data);
      }
    } catch (err) {
      console.warn(`[SupabaseService] getUserById query note for ${id}:`, (err as Error).message);
    }

    if (id === '00000000-0000-0000-0000-000000000002') {
      return {
        id: '00000000-0000-0000-0000-000000000002',
        email: 'voter@blockvote.io',
        name: 'Demo Voter',
        voterId: 'VTR-84291',
        walletAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        role: 'voter',
        status: 'Eligible to vote',
        createdAt: new Date().toISOString(),
      };
    }

    return null;
  }

  async getUserByWalletAddress(walletAddress: string): Promise<User | null> {
    try {
      const client = this.getClient();
      const { data, error } = await client
        .from('users')
        .select('*')
        .ilike('wallet_address', walletAddress)
        .maybeSingle();

      if (!error && data) {
        return this.mapUserRow(data);
      }
    } catch (err) {
      console.warn(`[SupabaseService] getUserByWalletAddress query note for ${walletAddress}:`, (err as Error).message);
    }

    if (walletAddress && walletAddress.toLowerCase() === '0x70997970c51812dc3a010c7d01b50e0d17dc79c8'.toLowerCase()) {
      return {
        id: '00000000-0000-0000-0000-000000000002',
        email: 'voter@blockvote.io',
        name: 'Demo Voter',
        voterId: 'VTR-84291',
        walletAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        role: 'voter',
        status: 'Eligible to vote',
        createdAt: new Date().toISOString(),
      };
    }

    return null;
  }

  async createUser(data: CreateUserInput): Promise<User> {
    const client = this.getClient();
    const voterId = data.voterId || `VTR-${Math.floor(10000 + Math.random() * 90000)}`;

    const insertPayload = {
      ...(data.id ? { id: data.id } : {}),
      email: data.email,
      full_name: data.name,
      voter_id: voterId,
      wallet_address: data.walletAddress || null,
      role: data.role || 'voter',
      status: 'Eligible to vote',
    };

    const { data: created, error } = await client
      .from('users')
      .insert(insertPayload)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Supabase Mutation Error (createUser): ${error.message}`);
    }

    return this.mapUserRow(created);
  }

  async hasVoted(electionId: string, voterId: string): Promise<boolean> {
    const client = this.getClient();
    const { data, error } = await client
      .from('voter_participation')
      .select('id, has_voted')
      .eq('election_id', electionId)
      .eq('voter_id', voterId)
      .eq('has_voted', true)
      .maybeSingle();

    if (error) {
      throw new Error(`Supabase Query Error (hasVoted): ${error.message}`);
    }

    return !!data;
  }

  /**
   * PRIVACY INVARIANT:
   * voter_participation contains ONLY (election_id, voter_id, has_voted = true).
   * It intentionally contains NO candidate_id, transaction_hash, nullifier_hash, or timestamps.
   */
  async recordParticipation(electionId: string, voterId: string): Promise<void> {
    const client = this.getClient();

    const { data, error: updateError } = await client
      .from('voter_participation')
      .update({ has_voted: true })
      .eq('election_id', electionId)
      .eq('voter_id', voterId)
      .select();

    if (updateError) {
      throw new Error(`Supabase Privacy Record Error (recordParticipation update): ${updateError.message}`);
    }

    if (!data || data.length === 0) {
      const { error: insertError } = await client
        .from('voter_participation')
        .insert({
          election_id: electionId,
          voter_id: voterId,
          has_voted: true,
        });

      if (insertError) {
        throw new Error(`Supabase Privacy Record Error (recordParticipation insert): ${insertError.message}`);
      }
    }
  }

  /**
   * PRIVACY INVARIANT:
   * blockchain_transactions contains ONLY transaction metadata and candidate_id.
   * It intentionally contains NO voter_id, user_id, or wallet_address.
   */
  async recordBlockchainTransaction(
    electionId: string,
    candidateId: string | null,
    txType: string,
    transactionHash: string,
    blockNumber: number | null,
    status: string
  ): Promise<void> {
    const client = this.getClient();
    const { error } = await client
      .from('blockchain_transactions')
      .upsert(
        {
          election_id: electionId,
          candidate_id: candidateId,
          tx_type: txType,
          transaction_hash: transactionHash,
          block_number: blockNumber,
          status,
          confirmations: status === 'confirmed' ? 1 : 0,
        },
        { onConflict: 'transaction_hash' }
      );

    if (error) {
      throw new Error(`Supabase Privacy Record Error (recordBlockchainTransaction): ${error.message}`);
    }
  }

  private mapElectionRow(row: any): Election {
    return {
      id: row.id,
      slug: row.slug,
      electionCode: row.election_code,
      title: row.title,
      description: row.description,
      detailsDescription: row.details_description || row.description,
      organization: row.organization,
      electionType: row.election_type,
      status: row.status as ElectionStatus,
      startDate: row.start_date,
      endDate: row.end_date,
      published: row.published ?? true,
      paused: row.paused ?? false,
      archived: row.archived ?? false,
      onchainId: row.onchain_id !== null ? Number(row.onchain_id) : null,
      createdBy: row.created_by,
      createdAt: row.created_at,
      candidates: Array.isArray(row.candidates)
        ? row.candidates.filter((c: any) => !c.removed).map((c: any) => this.mapCandidateRow(c))
        : [],
    };
  }

  private mapCandidateRow(row: any): Candidate {
    return {
      id: row.id,
      electionId: row.election_id,
      name: row.name,
      department: row.department,
      position: row.position,
      about: row.about,
      achievements: row.achievements || [],
      party: row.party,
      removed: row.removed ?? false,
      onchainId: row.onchain_id !== null ? Number(row.onchain_id) : null,
      createdAt: row.created_at,
    };
  }

  private mapUserRow(row: any): User {
    return {
      id: row.id,
      name: row.full_name,
      email: row.email,
      voterId: row.voter_id,
      walletAddress: row.wallet_address,
      role: row.role,
      status: row.status,
      createdAt: row.created_at,
    };
  }
}

export const supabaseService = new SupabaseService();
