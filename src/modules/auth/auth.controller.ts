// src/modules/auth/auth.controller.ts
import type { Request, Response } from 'express';
import { AuthService } from './auth.service.ts';
import { registerSchema, loginSchema } from './auth.validators.ts';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const body = registerSchema.parse(req.body);
      const user = await AuthService.register(body.email, body.password, body.name || null);
      res.status(201).json({ success: true, data: { id: user.id, email: user.email, name: user.name } });
    } catch (err: any) {
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const body = loginSchema.parse(req.body);
      const { user, accessToken, refreshToken } = await AuthService.login(body.email, body.password);

      // Send refresh token as HTTP-only cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({ success: true, data: { user: { id: user.id, email: user.email, name: user.name }, accessToken } });
    } catch (err: any) {
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  }

  static async refresh(req: Request, res: Response) {
    try {
      const token = req.cookies.refreshToken;
      if (!token) throw { status: 401, message: 'No refresh token' };

      // Decode token to get userId
      const decoded: any = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      const { accessToken, refreshToken } = await AuthService.refresh(decoded.userId, token);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({ success: true, data: { accessToken } });
    } catch (err: any) {
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      const token = req.cookies.refreshToken;
      if (!token) throw { status: 401, message: 'No refresh token' };

      // Decode token to get userId
      const decoded: any = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      await AuthService.logout(decoded.userId);

      res.clearCookie('refreshToken');
      res.json({ success: true, message: 'Logged out successfully' });
    } catch (err: any) {
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  }
}
