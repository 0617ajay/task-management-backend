// src/config/env.ts
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Validate required environment variables
const requiredEnv = [
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'DATABASE_URL',
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export default {
  port: Number(process.env.PORT) || 4000,

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET as string,
    refreshSecret: process.env.JWT_REFRESH_SECRET as string,
    accessExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m', // string like '15m' or number in seconds
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d', // string like '7d'
  },

  databaseUrl: process.env.DATABASE_URL as string,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
};
