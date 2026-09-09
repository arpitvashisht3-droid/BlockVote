import { Request, Response, NextFunction } from 'express';
import { supabaseService } from '../services/supabaseService';
import { generateToken, AuthenticatedRequest } from '../middleware/auth';

export class UserController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        name,
        username,
        email,
        password,
        phone,
        dateOfBirth,
        country,
        state,
        city,
        walletAddress,
        role
      } = req.body;

      if (!name || typeof name !== 'string' || !name.trim()) {
        res.status(400).json({ success: false, message: 'Full name is required.' });
        return;
      }

      if (!email || typeof email !== 'string' || !email.includes('@')) {
        res.status(400).json({ success: false, message: 'Valid email address is required.' });
        return;
      }

      if (!password || typeof password !== 'string' || password.length < 8) {
        res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' });
        return;
      }

      const cleanEmail = email.trim().toLowerCase();
      const existingUserByEmail = await supabaseService.getUserByEmail(cleanEmail);
      if (existingUserByEmail) {
        res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
        return;
      }

      if (username) {
        const cleanUsername = username.trim().toLowerCase();
        const existingUserByUsername = await supabaseService.getUserByUsername(cleanUsername);
        if (existingUserByUsername) {
          res.status(400).json({ success: false, message: `Username '@${cleanUsername}' is already taken. Please choose a different username.` });
          return;
        }
      }

      const newUser = await supabaseService.createUser({
        name,
        username,
        email,
        password,
        phone,
        dateOfBirth,
        country,
        state,
        city,
        walletAddress,
        role: role === 'admin' ? 'admin' : 'voter'
      });

      const token = generateToken({
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        username: newUser.username,
        role: newUser.role
      });

      const { passwordHash: _, ...safeUser } = newUser;

      res.status(201).json({
        success: true,
        data: {
          user: safeUser,
          token
        }
      });
    } catch (error: any) {
      if (error.message && error.message.includes('already taken')) {
        res.status(400).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, role } = req.body;

      if (!email || !password) {
        res.status(400).json({ success: false, message: 'Email and password are required.' });
        return;
      }

      const user = await supabaseService.getUserByEmail(email);
      if (!user) {
        res.status(401).json({ success: false, message: 'Invalid email or password.' });
        return;
      }

      if (user.passwordHash) {
        const isValid = await supabaseService.verifyPassword(password, user.passwordHash);
        if (!isValid) {
          res.status(401).json({ success: false, message: 'Invalid email or password.' });
          return;
        }
      }

      if (role && user.role !== role) {
        res.status(403).json({ success: false, message: `Access denied. Account is registered as ${user.role}.` });
        return;
      }

      const token = generateToken({
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        role: user.role
      });

      const { passwordHash: _, ...safeUser } = user;

      res.json({
        success: true,
        data: {
          user: safeUser,
          token
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }
      const user = await supabaseService.getUserById(req.user.id);
      if (!user) {
        res.status(404).json({ success: false, message: 'User profile not found' });
        return;
      }

      const { passwordHash: _, ...safeUser } = user;
      res.json({ success: true, data: safeUser });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      const updates = req.body;
      delete updates.passwordHash;
      delete updates.id;

      const updatedUser = await supabaseService.updateUser(req.user.id, updates);
      if (!updatedUser) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      const { passwordHash: _, ...safeUser } = updatedUser;
      res.json({ success: true, data: safeUser });
    } catch (error: any) {
      if (error.message && error.message.includes('already taken')) {
        res.status(400).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  }

  async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = await supabaseService.getUserById(id);

      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      const { passwordHash: _, ...safeUser } = user;
      res.json({ success: true, data: safeUser });
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
