import { Router } from 'express';
import { electionController } from '../controllers/electionController';
import { validateCreateElection } from '../middleware/validate';

const router = Router();

router.get('/', (req, res, next) => electionController.getElections(req, res, next));
router.get('/:id', (req, res, next) => electionController.getElectionById(req, res, next));
router.post('/', validateCreateElection, (req, res, next) => electionController.createElection(req, res, next));

export default router;
