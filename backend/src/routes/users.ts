import { Router } from 'express';
import { userController } from '../controllers/userController';
import { authenticateUser } from '../middleware/auth';

const router = Router();

// Public auth routes
router.post('/register', (req, res, next) => userController.register(req, res, next));
router.post('/login', (req, res, next) => userController.login(req, res, next));

// Protected auth routes
router.get('/me', authenticateUser, (req, res, next) => userController.getMe(req, res, next));
router.put('/me', authenticateUser, (req, res, next) => userController.updateProfile(req, res, next));

// User by ID
router.get('/:id', authenticateUser, (req, res, next) => userController.getUserById(req, res, next));

export default router;
