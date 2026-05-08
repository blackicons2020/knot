
import express from 'express';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/auth.routes';
import usersRoutes from './routes/users.routes';
import matchesRoutes from './routes/matches.routes';
import messagesRoutes from './routes/messages.routes';
import uploadRoutes from './routes/upload.routes';
import imageRoutes from './routes/image.routes';
import matchingRoutes from './routes/matching.routes';
import paystackRoutes from './routes/paystack.routes';
import verificationRoutes from './routes/verification.routes';
import { connectDB, ensureDbConnected } from './db';

const app = express();

// Middleware
app.use(ensureDbConnected as any);
app.use(cors({
  origin: true, // Allow all origins to resolve Network Errors during initial deployment
  credentials: true,
}));

// Paystack Webhook needs raw body, so we define it BEFORE express.json()
app.use('/api/paystack/webhook', (express as any).raw({ type: 'application/json' }));

app.use(express.json() as any);



// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/matches', matchesRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/paystack', paystackRoutes);
app.use('/api/verify', verificationRoutes);

import mongoose from 'mongoose';

// Detailed Health check for debugging
app.get('/api/health', (req, res) => {
  res.json({
    status: 'Knot API is running',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    env: {
      hasMongoUri: !!process.env.MONGODB_URI,
      hasJwtSecret: !!process.env.JWT_SECRET,
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      nodeEnv: process.env.NODE_ENV
    }
  });
});

// Error Handling
app.use((err: any, req: express.Request, res: any, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).send({ error: 'Something went wrong!' });
});

export default app;
