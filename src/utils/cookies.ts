// src/utils/cookie.ts

import { Response } from 'express';

// Set the refresh token cookie
export function setRefreshTokenCookie(res: Response, refreshToken: string) {
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
}

// Clear the refresh token cookie
export function clearRefreshTokenCookie(res: Response) {
    res.clearCookie('refreshToken');
}