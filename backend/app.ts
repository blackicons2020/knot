
import express from 'express';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/auth.routes';
import usersRoutes from './routes/users.routes';
import matchesRoutes from './routes/matches.routes';
import messagesRoutes from './routes/messages.routes';
import uploadRoutes from './routes/upload.routes';
import matchingRoutes from './routes/matching.routes';
import paystackRoutes from './routes/paystack.routes';

const app = express();

// Middleware
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Paystack Webhook needs raw body, so we define it BEFORE express.json()
app.use('/api/paystack/webhook', (express as any).raw({ type: 'application/json' }));

app.use(express.json() as any);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/matches', matchesRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/paystack', paystackRoutes);

// Health check
app.get('/', (_req, res) => {
  res.json({ status: 'Knot API is running' });
});

// Error Handling
app.use((err: any, req: express.Request, res: any, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).send({ error: 'Something went wrong!' });
});

export default app;
