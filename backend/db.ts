import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  console.error('CRITICAL: MONGODB_URI is not defined');
}

let isConnected = false;

export const connectDB = async (): Promise<void> => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  if (!MONGODB_URI) {
    console.error('CRITICAL ERROR: MONGODB_URI is missing from Environment Variables!');
    return;
  }

  try {
    const dbName = MONGODB_URI.split('/').pop()?.split('?')[0] || 'test (default)';
    console.log(`[MONGODB] Attempting to connect to Atlas database: ${dbName}`);
    
    const db = await mongoose.connect(MONGODB_URI, {
      bufferCommands: true,
      serverSelectionTimeoutMS: 20000, 
    });
    isConnected = db.connections[0].readyState === 1;
    console.log(`[MONGODB] SUCCESS: Connected to ${db.connection.name}. State: ${mongoose.connection.readyState}`);
  } catch (error: any) {
    console.error('[MONGODB] FAILED: Connection error details:');
    console.error('- Message:', error.message);
    console.error('- Code:', error.code);
    console.error('- Full Error:', error);
    isConnected = false;
  }
};

// Middleware to ensure DB is connected before processing requests
export const ensureDbConnected = async (req: any, res: any, next: any) => {
  const { readyState } = mongoose.connection;
  
  if (readyState !== 1) {
    console.log(`[DB GUARD] Current readyState: ${readyState}. Attempting to reconnect...`);
    await connectDB();
  }
  
  if (mongoose.connection.readyState !== 1) {
    console.error(`[DB GUARD] Connection failed. Blocking request to ${req.originalUrl}`);
    return res.status(503).json({ 
      error: 'Database is starting up or unreachable.', 
      readyState: mongoose.connection.readyState,
      message: 'Please check backend logs for connection errors.'
    });
  }
  
  next();
};

mongoose.connection.on('disconnected', () => {
  isConnected = false;
});
