import { Router } from 'express';
import { electionController } from '../controllers/electionController';
import { validateVoteTransaction } from '../middleware/validate';

const router = Router();

router.post('/vote', validateVoteTransaction, (req, res, next) => electionController.castVote(req, res, next));

export default router;
