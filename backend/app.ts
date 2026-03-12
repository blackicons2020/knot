
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import paymentRoutes from './routes/payment.routes';
import matchingRoutes from './routes/matching.routes';
import messageRoutes from './routes/message.routes';

const app = express();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '20mb' }) as any); // larger limit for base64 profile photos

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/messages', messageRoutes);

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// Error Handling
app.use((err: any, _req: express.Request, res: any, _next: express.NextFunction) => {
  console.error('=== GLOBAL ERROR ===');
  console.error('Name:', err.name);
  console.error('Message:', err.message);
  console.error('Type:', typeof err);
  console.error('Keys:', Object.keys(err));
  console.error('Full:', JSON.stringify(err, Object.getOwnPropertyNames(err)));
  console.error('Stack:', err.stack);
  res.status(500).json({ error: err.message || err.name || String(err) || 'Something went wrong!' });
});

export default app;
