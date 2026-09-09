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
  email: string;
  walletAddress?: string;
  role: 'voter' | 'admin';
  createdAt: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
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
  createUser(data: CreateUserInput): Promise<User>;
}

export class SupabaseService implements ISupabaseService {
  async getElections(): Promise<Election[]> {
    return [
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
    ];
  }

  async getElectionById(id: string): Promise<Election | null> {
    return {
      id,
      title: 'Sample Election',
      description: `Details for election ${id}`,
      startDate: '2026-09-01T00:00:00Z',
      endDate: '2026-09-15T00:00:00Z',
      status: 'active',
      createdAt: '2026-09-01T00:00:00Z'
    };
  }

  async createElection(data: CreateElectionInput): Promise<Election> {
    const now = new Date().toISOString();
    return {
      id: `elec-${Date.now()}`,
      title: data.title,
      description: data.description || '',
      startDate: data.startDate || now,
      endDate: data.endDate || now,
      status: data.status || 'upcoming',
      createdAt: now
    };
  }

  async getCandidatesByElectionId(electionId: string): Promise<Candidate[]> {
    return [
      {
        id: 'cand-1',
        electionId,
        name: 'Alice Johnson',
        party: 'Progressive Party',
        manifesto: 'Decentralized transparency for all.',
        createdAt: '2026-09-01T00:00:00Z'
      },
      {
        id: 'cand-2',
        electionId,
        name: 'Bob Smith',
        party: 'Innovation Party',
        manifesto: 'Building secure future voting.',
        createdAt: '2026-09-01T00:00:00Z'
      }
    ];
  }

  async createCandidate(electionId: string, data: CreateCandidateInput): Promise<Candidate> {
    const now = new Date().toISOString();
    return {
      id: `cand-${Date.now()}`,
      electionId,
      name: data.name,
      party: data.party || 'Independent',
      manifesto: data.manifesto || '',
      createdAt: now
    };
  }

  async getUserById(id: string): Promise<User | null> {
    return {
      id,
      name: 'John Doe',
      email: 'johndoe@example.com',
      walletAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      role: 'voter',
      createdAt: '2026-09-01T00:00:00Z'
    };
  }

  async createUser(data: CreateUserInput): Promise<User> {
    const now = new Date().toISOString();
    return {
      id: `usr-${Date.now()}`,
      name: data.name,
      email: data.email,
      walletAddress: data.walletAddress || '0x0000000000000000000000000000000000000000',
      role: data.role || 'voter',
      createdAt: now
    };
  }
}

export const supabaseService = new SupabaseService();
