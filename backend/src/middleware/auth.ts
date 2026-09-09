import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'blockvote_jwt_secret_key_sepolia_2026';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name?: string;
  username?: string;
  role: 'voter' | 'admin';
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export const generateToken = (user: AuthenticatedUser): string => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const verifyToken = async (token: string): Promise<AuthenticatedUser | null> => {
  if (!token || token.trim() === '' || token === 'invalid-token') {
    return null;
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
    return decoded;
  } catch (err) {
    return null;
  }
};

export const authenticateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Authentication Error: Missing or malformed Bearer token'
      });
      return;
    }

    const token = authHeader.substring(7).trim();
    const user = await verifyToken(token);

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Authentication Error: Invalid or expired token'
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
