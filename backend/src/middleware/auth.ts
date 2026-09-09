import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'voter' | 'admin';
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

/**
 * Provider-agnostic token verification helper.
 * Ready to be swapped out with actual JWT or Supabase token verification later.
 */
export const verifyToken = async (token: string): Promise<AuthenticatedUser | null> => {
  if (!token || token.trim() === '' || token === 'invalid-token') {
    return null;
  }

  // Mock authenticated user payload for valid tokens
  return {
    id: 'usr-123',
    email: 'voter@blockvote.io',
    role: 'voter'
  };
};

/**
 * Express Authentication Middleware
 * Validates 'Authorization: Bearer <token>' header and attaches user info to request.
 */
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
