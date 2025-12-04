// src/app.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middleware/error.middleware.ts';
import authRoutes from './modules/auth/auth.routes.ts';
import taskRoutes from './modules/tasks/task.routes.ts';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173', // your frontend URL
  credentials: true,
}));
// app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error Handler (must be last)
app.use(errorHandler);

export default app;
