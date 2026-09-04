const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:3000/api';
export const DEFAULT_AUTH_TOKEN = 'Bearer dev-voter-token';
export const DEFAULT_ADMIN_TOKEN = 'Bearer dev-admin-token';

export interface ApiCandidate {
  id: string;
  electionId?: string;
  name: string;
  department: string;
  position?: string;
  about?: string;
  achievements?: string[];
  party?: string;
  onchainId?: number | null;
}

export interface ApiElection {
  id: string;
  slug: string;
  electionCode: string;
  title: string;
  description: string;
  detailsDescription?: string;
  organization?: string;
  electionType?: string;
  status: 'upcoming' | 'live' | 'ended';
  startDate: string;
  endDate: string;
  published: boolean;
  /**
   * Mirrors elections.paused in Supabase.
   * True when the on-chain election is paused (status remains 'live').
   */
  paused?: boolean;
  onchainId?: number | null;
  candidates?: ApiCandidate[];
}

export interface VotePayload {
  electionId: string;
  candidateId: string;
  transactionHash: string;
  voterId?: string;
}

export interface VoteResponse {
  success: boolean;
  data: {
    transactionHash: string;
    blockNumber: number;
    status: string;
    electionId: string;
    candidateId: string;
    timestamp: string;
  };
  message?: string;
}

/**
 * Lifecycle status values accepted by PATCH /api/elections/:id/status
 */
export type LifecycleStatus = 'paused' | 'live' | 'ended';

/**
 * Shape returned by a successful HTTP 200 lifecycle response.
 */
export interface LifecycleStatusResponse {
  /** HTTP status code — 200 for full success, 207 for blockchain-ok/DB-fail partial */
  httpStatus: number;
  /** true only when httpStatus === 200 and both blockchain + DB succeeded */
  success: boolean;
  /** true when blockchain tx confirmed but DB update failed (HTTP 207) */
  partialSuccess: boolean;
  election?: ApiElection;
  transactionHash?: string;
  blockNumber?: number;
  message?: string;
}

export async function fetchApiElections(token: string = DEFAULT_ADMIN_TOKEN): Promise<ApiElection[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/elections`, {
      headers: {
        Authorization: token,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    const resJson = await response.json();
    return resJson.data || [];
  } catch (error) {
    console.warn('[API] Could not fetch elections from Backend API:', (error as Error).message);
    throw error;
  }
}

export async function fetchApiElectionById(id: string, token: string = DEFAULT_ADMIN_TOKEN): Promise<ApiElection | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/elections/${id}`, {
      headers: {
        Authorization: token,
      },
    });

    if (!response.ok) {
      return null;
    }

    const resJson = await response.json();
    return resJson.data || null;
  } catch (error) {
    console.warn(`[API] Could not fetch election ${id} from Backend API:`, (error as Error).message);
    throw error;
  }
}

export async function fetchApiCandidates(electionId: string, token: string = DEFAULT_ADMIN_TOKEN): Promise<ApiCandidate[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/elections/${electionId}/candidates`, {
      headers: {
        Authorization: token,
      },
    });

    if (!response.ok) {
      return [];
    }

    const resJson = await response.json();
    return resJson.data || [];
  } catch (error) {
    console.warn(`[API] Could not fetch candidates for election ${electionId}:`, (error as Error).message);
    throw error;
  }
}

export async function createApiElection(payload: Partial<ApiElection>, token: string = DEFAULT_ADMIN_TOKEN): Promise<ApiElection> {
  const response = await fetch(`${API_BASE_URL}/elections`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
    },
    body: JSON.stringify(payload),
  });

  const resJson = await response.json();
  if (!response.ok || !resJson.success) {
    throw new Error(resJson.message || 'Failed to create election.');
  }

  return resJson.data;
}

export async function createApiCandidate(electionId: string, payload: Partial<ApiCandidate>, token: string = DEFAULT_ADMIN_TOKEN): Promise<ApiCandidate> {
  const response = await fetch(`${API_BASE_URL}/elections/${electionId}/candidates`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
    },
    body: JSON.stringify(payload),
  });

  const resJson = await response.json();
  if (!response.ok || !resJson.success) {
    throw new Error(resJson.message || 'Failed to create candidate.');
  }

  return resJson.data;
}

export async function castVoteApi(payload: VotePayload): Promise<VoteResponse> {
  const response = await fetch(`${API_BASE_URL}/transactions/vote`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: DEFAULT_AUTH_TOKEN,
    },
    body: JSON.stringify(payload),
  });

  const resJson = await response.json();

  if (!response.ok || !resJson.success) {
    throw new Error(resJson.message || 'Vote casting failed.');
  }

  return resJson;
}

/**
 * Sends PATCH /api/elections/:id/status with admin credentials.
 *
 * Returns a LifecycleStatusResponse regardless of HTTP status:
 *   - 200 → success=true, partialSuccess=false
 *   - 207 → success=false, partialSuccess=true  (blockchain ok, DB failed)
 *   - 4xx/5xx → throws an Error with the backend message
 */
export async function updateApiElectionStatus(
  electionId: string,
  status: LifecycleStatus,
  token: string = DEFAULT_ADMIN_TOKEN,
): Promise<LifecycleStatusResponse> {
  const response = await fetch(`${API_BASE_URL}/elections/${electionId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
    },
    body: JSON.stringify({ status }),
  });

  let resJson: any;
  try {
    resJson = await response.json();
  } catch {
    throw new Error(`Lifecycle API returned non-JSON response (HTTP ${response.status}).`);
  }

  // HTTP 207: blockchain committed but DB update failed — partial success
  if (response.status === 207) {
    return {
      httpStatus: 207,
      success: false,
      partialSuccess: true,
      transactionHash: resJson.data?.transactionHash,
      blockNumber: resJson.data?.blockNumber,
      message: resJson.message || 'Blockchain transaction succeeded but database update failed.',
    };
  }

  // 4xx / 5xx — surface backend error message, never treat as success
  if (!response.ok) {
    throw new Error(
      resJson.message || `Lifecycle API error (HTTP ${response.status}): ${response.statusText}`,
    );
  }

  // HTTP 200 — full success
  const data = resJson.data || {};
  return {
    httpStatus: 200,
    success: true,
    partialSuccess: false,
    election: data.election as ApiElection | undefined,
    transactionHash: data.transactionHash,
    blockNumber: data.blockNumber,
    message: resJson.message,
  };
}
