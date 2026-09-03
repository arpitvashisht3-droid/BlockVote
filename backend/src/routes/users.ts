import { Router } from 'express';
import { userController } from '../controllers/userController';
import { validateCreateUser } from '../middleware/validate';

const router = Router();

router.get('/:id', (req, res, next) => userController.getUserById(req, res, next));
router.post('/', validateCreateUser, (req, res, next) => userController.createUser(req, res, next));

export default router;
