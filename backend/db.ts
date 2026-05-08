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
    console.log('Connecting to MongoDB Atlas...');
    const db = await mongoose.connect(MONGODB_URI, {
      bufferCommands: true,
      serverSelectionTimeoutMS: 20000, // Slightly longer for Vercel
    });
    isConnected = db.connections[0].readyState === 1;
    console.log('SUCCESS: MongoDB connected correctly.');
  } catch (error: any) {
    console.error('FAILED: MongoDB connection error:', error.message || error);
    isConnected = false;
    // Don't re-throw, let ensureDbConnected handle the 503
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
