import { Request, Response, NextFunction } from 'express';
import { supabaseService } from '../services/supabaseService';
import { blockchainService } from '../services/blockchainService';
import { AuthenticatedRequest } from '../middleware/auth';

export class ElectionController {
  async getElections(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const elections = await supabaseService.getElections();
      res.json({ success: true, data: elections });
    } catch (error) {
      next(error);
    }
  }

  async getElectionById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const election = await supabaseService.getElectionById(id);

      if (!election) {
        res.status(404).json({ success: false, message: 'Election not found' });
        return;
      }

      res.json({ success: true, data: election });
    } catch (error) {
      next(error);
    }
  }

  async createElection(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const electionData = req.body;
      const newElection = await supabaseService.createElection(electionData);

      // Provision election on-chain using server-side admin signer
      try {
        const now = Math.floor(Date.now() / 1000);
        let startSec = newElection.startDate ? Math.floor(new Date(newElection.startDate).getTime() / 1000) : now;
        let endSec = newElection.endDate ? Math.floor(new Date(newElection.endDate).getTime() / 1000) : now + 86400 * 30;

        if (isNaN(startSec)) startSec = now;
        if (isNaN(endSec) || endSec <= now) endSec = now + 86400 * 30;
        if (startSec >= endSec) startSec = endSec - 3600;

        const onchainResult = await blockchainService.createOnchainElection(
          newElection.title,
          newElection.description || newElection.title,
          startSec,
          endSec
        );

        // Update Supabase with real onchain_id
        await supabaseService.updateElectionOnchainId(newElection.id, onchainResult.onchainElectionId);
        newElection.onchainId = onchainResult.onchainElectionId;

        // Record transaction in blockchain_transactions
        await supabaseService.recordBlockchainTransaction(
          newElection.id,
          null,
          'election_created',
          onchainResult.transactionHash,
          onchainResult.blockNumber,
          'confirmed'
        );
      } catch (bcError) {
        console.error(`[ElectionController] Blockchain provisioning warning for election ${newElection.id}:`, (bcError as Error).message);
        // Do NOT assign a fake onchainId if blockchain creation failed
      }

      res.status(201).json({ success: true, data: newElection });
    } catch (error) {
      next(error);
    }
  }

  async getCandidates(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const candidates = await supabaseService.getCandidatesByElectionId(id);
      res.json({ success: true, data: candidates });
    } catch (error) {
      next(error);
    }
  }

  async addCandidate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const candidateData = req.body;
      const newCandidate = await supabaseService.createCandidate(id, candidateData);

      const election = await supabaseService.getElectionById(id);
      if (election && election.onchainId !== null && election.onchainId !== undefined) {
        try {
          const onchainCandResult = await blockchainService.addOnchainCandidate(
            election.onchainId,
            newCandidate.name,
            newCandidate.position || newCandidate.department || 'Candidate'
          );

          // Update Supabase with real onchain_id
          await supabaseService.updateCandidateOnchainId(newCandidate.id, onchainCandResult.onchainCandidateId);
          newCandidate.onchainId = onchainCandResult.onchainCandidateId;

          // Record transaction in blockchain_transactions
          await supabaseService.recordBlockchainTransaction(
            election.id,
            newCandidate.id,
            'candidate_added',
            onchainCandResult.transactionHash,
            onchainCandResult.blockNumber,
            'confirmed'
          );
        } catch (bcError) {
          console.error(`[ElectionController] Blockchain candidate provisioning warning for candidate ${newCandidate.id}:`, (bcError as Error).message);
          // Do NOT assign a fake onchainId if blockchain candidate creation failed
        }
      }

      res.status(201).json({ success: true, data: newCandidate });
    } catch (error) {
      next(error);
    }
  }

  async castVote(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { electionId, candidateId, transactionHash } = req.body;

      if (!electionId || !candidateId || !transactionHash) {
        res.status(400).json({
          success: false,
          message: 'electionId, candidateId, and transactionHash are required.',
        });
        return;
      }

      // Fetch election record from Supabase
      const election = await supabaseService.getElectionById(electionId);
      if (!election) {
        res.status(404).json({ success: false, message: 'Election not found in database.' });
        return;
      }

      // Fetch transaction receipt from blockchain RPC
      const receipt = await blockchainService.getTransactionReceipt(transactionHash);

      // Determine database voter identity:
      // 1. Try to resolve database user via the transaction's sender wallet address (receipt.from)
      // 2. Fall back to the authenticated request user (req.user?.id)
      let voterUser = receipt.from ? await supabaseService.getUserByWalletAddress(receipt.from) : null;
      if (!voterUser && req.user?.id) {
        voterUser = await supabaseService.getUserById(req.user.id);
      }

      if (!voterUser) {
        res.status(401).json({
          success: false,
          message: 'Authentication Error: Could not resolve database voter identity.',
        });
        return;
      }

      const voterId = voterUser.id;

      // Check for double voting in voter_participation
      const alreadyVoted = await supabaseService.hasVoted(election.id, voterId);
      if (alreadyVoted) {
        res.status(400).json({
          success: false,
          message: 'Voter has already cast a vote in this election.',
        });
        return;
      }

      // PRIVACY INVARIANT 1: Record in blockchain_transactions WITHOUT voter ID / user ID
      await supabaseService.recordBlockchainTransaction(
        election.id,
        candidateId,
        'vote_cast',
        receipt.transactionHash,
        receipt.blockNumber,
        receipt.status
      );

      // PRIVACY INVARIANT 2: Record in voter_participation WITHOUT candidate ID / transaction hash
      await supabaseService.recordParticipation(election.id, voterId);

      res.status(200).json({
        success: true,
        data: {
          transactionHash: receipt.transactionHash,
          blockNumber: receipt.blockNumber,
          status: receipt.status,
          electionId: election.id,
          candidateId,
          timestamp: receipt.timestamp,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateElectionStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // ── Admin guard ─────────────────────────────────────────────────────────
      if (!req.user || req.user.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'Access denied: Admin privileges required.',
        });
        return;
      }

      const { id } = req.params;
      const { status } = req.body;

      // ── Input validation ────────────────────────────────────────────────────
      if (!status || !['paused', 'live', 'ended'].includes(status)) {
        res.status(400).json({
          success: false,
          message: 'Invalid or missing status. Allowed values: "paused", "live", "ended".',
        });
        return;
      }

      // ── Resolve DB election by UUID ─────────────────────────────────────────
      const election = await supabaseService.getElectionById(id);
      if (!election) {
        res.status(404).json({
          success: false,
          message: 'Election not found.',
        });
        return;
      }

      // ── Require a valid onchain_id before any on-chain operation ────────────
      if (election.onchainId === null || election.onchainId === undefined) {
        res.status(400).json({
          success: false,
          message: 'Election does not have a valid on-chain ID. On-chain lifecycle operations require the election to have been provisioned on-chain first.',
        });
        return;
      }

      // ── Execute on-chain lifecycle transaction ──────────────────────────────
      // blockchainService methods internally wait for the receipt and throw if
      // the transaction reverts. No DB write happens before this resolves.
      let txResult: { transactionHash: string; blockNumber: number };

      if (status === 'paused') {
        txResult = await blockchainService.pauseOnchainElection(election.onchainId);
      } else if (status === 'live') {
        txResult = await blockchainService.resumeOnchainElection(election.onchainId);
      } else {
        // status === 'ended'
        txResult = await blockchainService.endOnchainElection(election.onchainId);
      }

      // ── On-chain tx confirmed. Now update the database. ─────────────────────
      //
      // STATUS MAPPING (per schema):
      //   elections.status CHECK constraint allows only: 'upcoming' | 'live' | 'ended'
      //   There is no 'paused' status. Paused elections remain status='live' with
      //   elections.paused=true to signal the suspension without violating the constraint.
      //
      // BLOCKCHAIN TRANSACTION RECORDING:
      //   The blockchain_transactions table has a CHECK constraint on tx_type that
      //   ONLY permits: 'vote_cast' | 'election_created' | 'candidate_added' | 'voter_registered'.
      //   Lifecycle operations (pause/resume/end) have no matching tx_type value.
      //   Recording these transactions would violate the existing DB constraint.
      //   Therefore, blockchain_transactions recording is intentionally OMITTED for
      //   lifecycle operations. The real on-chain tx hash is returned in the response
      //   for external audit. Schema must be extended to support lifecycle tx_types
      //   before DB recording can be enabled.

      let dbUpdatePayload: { status?: 'upcoming' | 'live' | 'ended'; paused?: boolean; endDate?: string };

      if (status === 'paused') {
        // Pause: keep status='live', set paused=true
        dbUpdatePayload = { status: 'live', paused: true };
      } else if (status === 'live') {
        // Resume: keep status='live', set paused=false
        dbUpdatePayload = { status: 'live', paused: false };
      } else {
        // End: set status='ended', paused=false, update end_date to now
        dbUpdatePayload = { status: 'ended', paused: false, endDate: new Date().toISOString() };
      }

      let updatedElection;
      let dbError: string | null = null;

      try {
        updatedElection = await supabaseService.updateElectionStatus(election.id, dbUpdatePayload);
      } catch (dbErr) {
        // On-chain tx succeeded but DB update failed.
        // Surface the partial failure clearly — do NOT pretend the DB was updated.
        dbError = (dbErr as Error).message;
        console.error(
          `[ElectionController] PARTIAL FAILURE: On-chain tx ${txResult.transactionHash} succeeded ` +
          `(block ${txResult.blockNumber}) but DB update for election ${election.id} failed: ${dbError}`
        );
      }

      if (dbError) {
        // Return 207 Multi-Status: blockchain committed but DB is inconsistent
        res.status(207).json({
          success: false,
          partialSuccess: true,
          message: [
            `On-chain ${status} transaction succeeded (tx: ${txResult.transactionHash}, block: ${txResult.blockNumber}),`,
            `but the database update failed and requires manual remediation.`,
            `DB error: ${dbError}`,
          ].join(' '),
          data: {
            transactionHash: txResult.transactionHash,
            blockNumber: txResult.blockNumber,
            onchainId: election.onchainId,
            electionId: election.id,
            intendedStatus: status,
          },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          election: updatedElection,
          transactionHash: txResult.transactionHash,
          blockNumber: txResult.blockNumber,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const electionController = new ElectionController();
