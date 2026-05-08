import express from 'express';
import { ImageModel } from '../models/image.model';

const router = express.Router();

// GET /api/images/:id
// Serves binary image data from MongoDB
router.get('/:id', async (req, res) => {
  try {
    const image = await ImageModel.findById(req.params.id);
    
    if (!image) {
      return res.status(404).send('Image not found');
    }

    // Set the correct content type (e.g., image/jpeg)
    res.set('Content-Type', image.contentType);
    // Cache the image for 1 year to improve performance
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
    
    res.send(image.data);
  } catch (error: any) {
    console.error('Fetch image error:', error.message);
    res.status(500).send('Internal server error');
  }
});

export default router;
