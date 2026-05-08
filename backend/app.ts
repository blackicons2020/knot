import express from 'express';
import cors from 'cors';
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
import mongoose from 'mongoose';

const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
}));

// Paystack Webhook needs raw body
app.use('/api/paystack/webhook', (express as any).raw({ type: 'application/json' }));
app.use(express.json() as any);

// Safety Shield: Try to connect but don't crash if it fails
connectDB().catch(err => console.error('Initial DB connection failed:', err));

// Detailed Health check for debugging
app.get('/api/health', (req, res) => {
  res.json({
    status: 'Knot API is running',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    readyState: mongoose.connection.readyState,
    env: {
      hasMongoUri: !!process.env.MONGODB_URI,
      hasJwtSecret: !!process.env.JWT_SECRET,
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
    }
  });
});

// Apply DB Guard only to functional routes, not health check
app.use('/api/auth', ensureDbConnected as any, authRoutes);
app.use('/api/users', ensureDbConnected as any, usersRoutes);
app.use('/api/matches', ensureDbConnected as any, matchesRoutes);
app.use('/api/messages', ensureDbConnected as any, messagesRoutes);
app.use('/api/upload', ensureDbConnected as any, uploadRoutes);
app.use('/api/images', imageRoutes); // Images don't necessarily need DB guard if served from cache
app.use('/api/matching', ensureDbConnected as any, matchingRoutes);
app.use('/api/paystack', ensureDbConnected as any, paystackRoutes);
app.use('/api/verify', ensureDbConnected as any, verificationRoutes);

// Root health check
app.get('/', (_req, res) => {
  res.json({ status: 'Knot API is running' });
});

// Error Handling
app.use((err: any, req: express.Request, res: any, next: express.NextFunction) => {
  console.error('Global Error Handler:', err);
  res.status(500).send({ error: 'Internal Server Error', message: err.message });
});

export default app;
