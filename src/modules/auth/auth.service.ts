// src/modules/auth/auth.service.ts
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import env from '../../config/env.ts';
import { prisma } from '../../libs/prisma.ts';

const SALT_ROUNDS = 10;

export class AuthService {
  // REGISTER
  static async register(email: string, password: string, name: string | null) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw { status: 400, message: 'Email already exists' };

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: { email, passwordHash, name },
    });

    return user;
  }

  // LOGIN
  static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw { status: 401, message: 'Invalid credentials' };

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw { status: 401, message: 'Invalid credentials' };

    // Generate JWT tokens
    const accessToken = jwt.sign(
      { userId: user.id },
      env.jwt.accessSecret as jwt.Secret,
      { expiresIn: env.jwt.accessExpiresIn as jwt.SignOptions['expiresIn'] }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      env.jwt.refreshSecret as jwt.Secret,
      { expiresIn: env.jwt.refreshExpiresIn as jwt.SignOptions['expiresIn'] }
    );

    // Save hashed refresh token in DB
    const refreshTokenHash = await bcrypt.hash(refreshToken, SALT_ROUNDS);
    await prisma.refreshToken.create({
      data: {
        tokenHash: refreshTokenHash,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return { user, accessToken, refreshToken };
  }

  // REFRESH
  static async refresh(userId: string, token: string) {
    // Find valid, non-revoked refresh token
    const dbToken = await prisma.refreshToken.findFirst({
      where: { userId, revoked: false },
    });
    if (!dbToken) throw { status: 401, message: 'Invalid refresh token' };

    const valid = await bcrypt.compare(token, dbToken.tokenHash);
    if (!valid) throw { status: 401, message: 'Invalid refresh token' };

    // Revoke old refresh token
    await prisma.refreshToken.update({
      where: { id: dbToken.id },
      data: { revoked: true },
    });

    // Create new access & refresh tokens
    const newAccessToken = jwt.sign(
      { userId },
      env.jwt.accessSecret as jwt.Secret,
      { expiresIn: env.jwt.accessExpiresIn as jwt.SignOptions['expiresIn'] }
    );

    const newRefreshToken = jwt.sign(
      { userId },
      env.jwt.refreshSecret as jwt.Secret,
      { expiresIn: env.jwt.refreshExpiresIn as jwt.SignOptions['expiresIn'] }
    );

    const newRefreshTokenHash = await bcrypt.hash(newRefreshToken, SALT_ROUNDS);
    await prisma.refreshToken.create({
      data: {
        tokenHash: newRefreshTokenHash,
        userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  // LOGOUT
  static async logout(userId: string) {
    await prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    });
    return true;
  }
}
