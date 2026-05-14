import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import usersRoutes from './routes/users.routes.js';
import matchesRoutes from './routes/matches.routes.js';
import messagesRoutes from './routes/messages.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import imageRoutes from './routes/image.routes.js';
import matchingRoutes from './routes/matching.routes.js';
import paystackRoutes from './routes/paystack.routes.js';
import verificationRoutes from './routes/verification.routes.js';
import { connectDB, ensureDbConnected } from './db.js';
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

// Detailed Health check for debugging
app.get('/api/health', async (req, res) => {
  let dbStatus = 'Disconnected';
  let queryStatus = 'Pending';
  
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }
    dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
    
    // Try a real query to verify schema/model
    if (dbStatus === 'Connected') {
      // Import UserModel inside to avoid circular deps if any
      const { UserModel } = await import('./models/user.model.js');
      await UserModel.findOne().limit(1);
      queryStatus = 'Success';
    }
  } catch (e: any) {
    dbStatus = 'Error';
    queryStatus = `Failed: ${e.message}`;
  }

  res.json({
    status: 'Knot API is running',
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatus,
      query: queryStatus,
      readyState: mongoose.connection.readyState,
      dbName: mongoose.connection.name
    },
    env: {
      hasMongoUri: !!process.env.MONGODB_URI,
      hasJwtSecret: !!process.env.JWT_SECRET,
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      nodeEnv: process.env.NODE_ENV
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
