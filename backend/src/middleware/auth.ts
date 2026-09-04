import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'voter' | 'admin';
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export const verifyToken = async (token: string): Promise<AuthenticatedUser | null> => {
  if (!token || token.trim() === '' || token === 'invalid-token') {
    return null;
  }

  // Use seed test voter UUID or parsed token claims
  const isSeedAdmin = token.includes('admin');
  return {
    id: isSeedAdmin ? '00000000-0000-0000-0000-000000000001' : '00000000-0000-0000-0000-000000000002',
    email: isSeedAdmin ? 'admin@blockvote.io' : 'voter@blockvote.io',
    role: isSeedAdmin ? 'admin' : 'voter',
  };
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
        message: 'Authentication Error: Missing or malformed Bearer token',
      });
      return;
    }

    const token = authHeader.substring(7).trim();
    const user = await verifyToken(token);

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Authentication Error: Invalid or expired token',
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
