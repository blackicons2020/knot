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

  try {
    console.log('Attempting to connect to MongoDB...');
    const db = await mongoose.connect(MONGODB_URI, {
      bufferCommands: true, // Allow commands to buffer while connecting
      serverSelectionTimeoutMS: 15000, // Increase timeout for Vercel cold starts
    });
    isConnected = db.connections[0].readyState === 1;
    console.log('MongoDB connected successfully');
  } catch (error: any) {
    console.error('MongoDB connection error:', error.message || error);
    isConnected = false;
  }
};

// Middleware to ensure DB is connected before processing requests
export const ensureDbConnected = async (req: any, res: any, next: any) => {
  if (mongoose.connection.readyState !== 1) {
    console.log('DB not connected, attempting to connect before request...');
    await connectDB();
  }
  
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ error: 'Database is starting up. Please try again in a few seconds.' });
  }
  
  next();
};

mongoose.connection.on('disconnected', () => {
  isConnected = false;
});
