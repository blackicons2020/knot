import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './db.js';

const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Knot Server running on port ${PORT}`);
  });
});
