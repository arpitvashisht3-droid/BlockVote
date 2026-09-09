import { Response, NextFunction } from 'express';
import { supabaseService } from '../services/supabaseService';
import { blockchainService } from '../services/blockchainService';
import { AuthenticatedRequest } from '../middleware/auth';

export class ElectionController {
  async getElections(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      let elections = await supabaseService.getElections();

      // Backend conductor ownership filtering
      const { conductorOnly, conductorId } = req.query;
      if (conductorOnly === 'true' && req.user && req.user.role === 'admin') {
        elections = elections.filter((e: any) => e.conductorId === req.user!.id);
      } else if (conductorId && typeof conductorId === 'string') {
        elections = elections.filter((e: any) => e.conductorId === conductorId);
      }

      const enriched = await Promise.all(
        elections.map(async (e) => {
          const candidates = await supabaseService.getCandidatesByElectionId(e.id);
          const { secretCodeHash: _, ...safe } = e;
          return {
            ...safe,
            candidates,
          };
        })
      );
      res.json({ success: true, data: enriched });
    } catch (error) {
      next(error);
    }
  }

  async getElectionById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const election = await supabaseService.getElectionById(id);
      if (!election) {
        res.status(404).json({ success: false, message: 'Election not found' });
        return;
      }
      const candidates = await supabaseService.getCandidatesByElectionId(id);
      const { secretCodeHash: _, ...safe } = election;
      res.json({ success: true, data: { ...safe, candidates } });
    } catch (error) {
      next(error);
    }
  }

  async createElection(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      const electionData = {
        ...req.body,
        conductorId: req.user.id,
      };

      const newElection = await supabaseService.createElection(electionData);
      const { secretCodeHash: _, ...safe } = newElection;
      res.status(201).json({ success: true, data: safe });
    } catch (error) {
      next(error);
    }
  }

  async updateElectionStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }
      const { id } = req.params;
      const { status } = req.body;

      const election = await supabaseService.getElectionById(id);
      if (!election) {
        res.status(404).json({ success: false, message: 'Election not found' });
        return;
      }

      // Only the conductor who created the election can update it
      if (election.conductorId && election.conductorId !== req.user.id && req.user.role !== 'admin') {
        res.status(403).json({ success: false, message: 'You are not authorized to modify this election.' });
        return;
      }

      const updated = await supabaseService.updateElection(id, { status });
      if (!updated) {
        res.status(404).json({ success: false, message: 'Election not found' });
        return;
      }
      const { secretCodeHash: _, ...safe } = updated;
      res.json({ success: true, data: safe });
    } catch (error) {
      next(error);
    }
  }

  async getCandidates(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const candidates = await supabaseService.getCandidatesByElectionId(id);
      res.json({ success: true, data: candidates });
    } catch (error) {
      next(error);
    }
  }

  async addCandidate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }
      const { id } = req.params;

      // Verify conductor ownership
      const election = await supabaseService.getElectionById(id);
      if (election?.conductorId && election.conductorId !== req.user.id && req.user.role !== 'admin') {
        res.status(403).json({ success: false, message: 'You are not authorized to modify candidates for this election.' });
        return;
      }

      const candidateData = req.body;
      const newCandidate = await supabaseService.createCandidate(id, candidateData);
      res.status(201).json({ success: true, data: newCandidate });
    } catch (error) {
      next(error);
    }
  }

  async castVote(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { electionId, candidateId, voterId, voterAddress } = req.body;
      const voter = voterId || voterAddress;
      const txResult = await blockchainService.castVote(electionId, candidateId, voter);
      res.status(200).json({ success: true, data: txResult });
    } catch (error) {
      next(error);
    }
  }

  // ── Eligibility Verification ───────────────────────────────────────────────

  async verifyEligibility(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { secretCode, enrollmentNumber, collegeId, voterId } = req.body;

      const election = await supabaseService.getElectionById(id);
      if (!election) {
        res.status(404).json({ success: false, message: 'Election not found' });
        return;
      }

      if (election.status === 'completed') {
        res.status(400).json({ success: false, eligible: false, message: 'This election has ended.' });
        return;
      }

      // Verify voter capacity limit (maxVoters cap)
      if (election.maxVoters && election.maxVoters > 0) {
        const participations = await supabaseService.getParticipationsByElection(id);
        if (participations.length >= election.maxVoters) {
          res.status(400).json({
            success: false,
            eligible: false,
            message: `This election has reached its maximum voter capacity limit (${election.maxVoters} voters). No more votes can be cast.`,
          });
          return;
        }
      }

      // Verify secret code (required for all election types)
      if (election.secretCodeHash) {
        if (!secretCode) {
          res.status(400).json({ success: false, eligible: false, message: 'Secret code is required.' });
          return;
        }
        const codeValid = await supabaseService.verifyElectionSecretCode(id, secretCode);
        if (!codeValid) {
          res.status(403).json({ success: false, eligible: false, message: 'Invalid secret code.' });
          return;
        }
      }

      // College/University additional verification
      if (election.type === 'College Election' || election.type === 'University Election') {
        if (!enrollmentNumber || !collegeId) {
          res.status(400).json({ success: false, eligible: false, message: 'Enrollment number and College ID are required.' });
          return;
        }
        // If we have voter profile data, cross-check
        const resolvedVoterId = voterId || req.user?.id;
        if (resolvedVoterId) {
          const voter = await supabaseService.getUserById(resolvedVoterId);
          if (voter) {
            if (election.type === 'College Election' && election.collegeName) {
              if (voter.collegeName && voter.collegeName.toLowerCase() !== election.collegeName.toLowerCase()) {
                res.status(403).json({ success: false, eligible: false, message: 'You do not belong to the configured college for this election.' });
                return;
              }
            }
          }
        }
      }

      // Check if voter already participated
      const resolvedVoterId = voterId || req.user?.id;
      if (resolvedVoterId) {
        const alreadyVoted = await supabaseService.hasVoterParticipated(id, resolvedVoterId);
        if (alreadyVoted) {
          res.status(400).json({ success: false, eligible: false, message: 'You have already participated in this election.' });
          return;
        }
      }

      res.json({ success: true, eligible: true, message: 'Eligibility verified.' });
    } catch (error) {
      next(error);
    }
  }

  // ── Participation ──────────────────────────────────────────────────────────

  async getParticipations(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }
      const { id } = req.params;

      // Only the conductor who created the election can see participation
      const election = await supabaseService.getElectionById(id);
      if (election?.conductorId && election.conductorId !== req.user.id && req.user.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Not authorized to view participation for this election.' });
        return;
      }

      const participations = await supabaseService.getParticipationsByElection(id);
      res.json({ success: true, data: participations });
    } catch (error) {
      next(error);
    }
  }

  async recordParticipation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }
      const { id } = req.params;
      const { voterId, voterName, voterEmail } = req.body;

      const resolvedVoterId = voterId || req.user.id;

      const record = await supabaseService.createParticipation({
        electionId: id,
        voterId: resolvedVoterId,
        voterName: voterName || req.user.name,
        voterEmail: voterEmail || req.user.email,
      });

      res.status(201).json({ success: true, data: record });
    } catch (error) {
      next(error);
    }
  }

  async getMyParticipations(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }
      const electionIds = await supabaseService.getElectionsVoterParticipatedIn(req.user.id);
      res.json({ success: true, data: electionIds });
    } catch (error) {
      next(error);
    }
  }

  // ── Discarded Votes ────────────────────────────────────────────────────────

  async getDiscardedVotes(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }
      const { id } = req.params;

      const election = await supabaseService.getElectionById(id);
      if (election?.conductorId && election.conductorId !== req.user.id && req.user.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Not authorized to view discarded votes for this election.' });
        return;
      }

      const discarded = await supabaseService.getDiscardedVotesByElection(id);
      res.json({ success: true, data: discarded });
    } catch (error) {
      next(error);
    }
  }

  async discardVote(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }
      const { id, voteId } = req.params;
      const { reason, voterId, voterName, voterEmail, txHash } = req.body;

      // Required reason
      if (!reason || typeof reason !== 'string' || reason.trim().length < 10) {
        res.status(400).json({ success: false, message: 'A detailed reason (minimum 10 characters) is required to discard a vote.' });
        return;
      }

      // Verify conductor ownership
      const election = await supabaseService.getElectionById(id);
      if (!election) {
        res.status(404).json({ success: false, message: 'Election not found.' });
        return;
      }
      if (election.conductorId && election.conductorId !== req.user.id && req.user.role !== 'admin') {
        res.status(403).json({ success: false, message: 'You are not authorized to discard votes for this election.' });
        return;
      }

      const conductor = await supabaseService.getUserById(req.user.id);

      const record = await supabaseService.createDiscardedVote({
        electionId: id,
        voteId: voteId !== 'new' ? voteId : undefined,
        txHash,
        voterId,
        voterName,
        voterEmail,
        reason: reason.trim(),
        discardedBy: req.user.id,
        discardedByName: conductor?.name || req.user.name,
      });

      res.status(201).json({ success: true, data: record });
    } catch (error) {
      next(error);
    }
  }
}

export const electionController = new ElectionController();
