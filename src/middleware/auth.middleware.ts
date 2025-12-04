import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import env from '../config/env.ts';

interface JwtPayload {
  userId: string;
}

// Extend Express Request type to include `user`
declare global {
  namespace Express {
    interface Request {
      user: { id: string };
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];

    // FIX: Assert the result to `object` first, then to your custom type.
    const decoded = jwt.verify(token!, env.jwt.accessSecret as jwt.Secret) as object;

    // Optional: Add a runtime check to ensure userId exists
    if (!('userId' in decoded) || typeof decoded.userId !== 'string') {
        throw new Error('Invalid token payload structure.');
    }
    
    // Now you can safely cast the decoded object to your specific JwtPayload
    const payload = decoded as JwtPayload;

    // Attach user info to request
    req.user = { id: payload.userId };

    next();
  } catch (err: any) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};
