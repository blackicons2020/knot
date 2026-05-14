import express from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth.js';
import { ImageModel } from '../models/image.model.js';

const router = express.Router();

// Use memory storage instead of disk storage for serverless compatibility
const storage = multer.memoryStorage();
const upload = multer({ 
  storage, 
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

// POST /api/upload
// Uploads an image and stores it in MongoDB
router.post('/', authenticateToken, upload.single('photo'), async (req: any, res: any) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const userId = req.user?.id || req.user?.uid;
    
    const newImage = await ImageModel.create({
      data: req.file.buffer,
      contentType: req.file.mimetype,
      userId: userId || 'anonymous'
    });

    // Return the URL that points to our new image server route
    const url = `/api/images/${newImage.id}`;
    res.json({ url, id: newImage.id });
  } catch (error: any) {
    console.error('Upload error:', error.message);
    res.status(500).json({ error: 'Failed to save image to database' });
  }
});

export default router;
