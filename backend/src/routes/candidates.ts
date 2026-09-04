import { Router } from 'express';
import { electionController } from '../controllers/electionController';
import { validateAddCandidate } from '../middleware/validate';

const router = Router({ mergeParams: true });

router.get('/:id/candidates', (req, res, next) => electionController.getCandidates(req, res, next));
router.post('/:id/candidates', validateAddCandidate, (req, res, next) => electionController.addCandidate(req, res, next));

export default router;
