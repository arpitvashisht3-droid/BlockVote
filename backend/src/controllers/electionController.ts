import { Request, Response, NextFunction } from 'express';
import { supabaseService } from '../services/supabaseService';
import { blockchainService } from '../services/blockchainService';

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
      res.status(201).json({ success: true, data: newCandidate });
    } catch (error) {
      next(error);
    }
  }

  async castVote(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { electionId, candidateId, voterId, voterAddress } = req.body;
      const voter = voterId || voterAddress;
      const txResult = await blockchainService.castVote(electionId, candidateId, voter);
      res.status(200).json({ success: true, data: txResult });
    } catch (error) {
      next(error);
    }
  }
}

export const electionController = new ElectionController();
