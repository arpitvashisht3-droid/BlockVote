import { Request, Response, NextFunction } from 'express';
import { supabaseService } from '../services/supabaseService';

export class UserController {
  async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = await supabaseService.getUserById(id);

      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userData = req.body;
      const newUser = await supabaseService.createUser(userData);
      res.status(201).json({ success: true, data: newUser });
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
