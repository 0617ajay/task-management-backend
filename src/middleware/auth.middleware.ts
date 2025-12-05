import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import env from '../config/env';

interface JwtPayload {
  userId: string;
}

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

    const decoded = jwt.verify(token!, env.jwt.accessSecret as jwt.Secret) as object;

    if (!('userId' in decoded) || typeof decoded.userId !== 'string') {
        throw new Error('Invalid token payload structure.');
    }
    
    const payload = decoded as JwtPayload;

    req.user = { id: payload.userId };

    next();
  } catch (err: any) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};
