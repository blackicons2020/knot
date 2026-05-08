import express from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth';
import { UserModel } from '../models/user.model';
import { ImageModel } from '../models/image.model';
import { GoogleGenAI } from '@google/genai';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY || '');

// POST /api/verify/selfie
// Receives a selfie, compares it with profile photo using Gemini AI
router.post('/selfie', authenticateToken, upload.single('selfie'), async (req: any, res: any) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No selfie uploaded' });
  }

  try {
    const userId = req.user.id;
    const user = await UserModel.findById(userId);

    if (!user || user.profileImageUrls.length === 0) {
      return res.status(400).json({ error: 'Please upload a profile photo first' });
    }

    // Get the first profile photo data
    const profilePhotoId = user.profileImageUrls[0].split('/').pop();
    const profilePhoto = await ImageModel.findById(profilePhotoId);

    if (!profilePhoto) {
      return res.status(400).json({ error: 'Profile photo data missing' });
    }

    // Save the selfie as well
    const selfieImage = await ImageModel.create({
      data: req.file.buffer,
      contentType: req.file.mimetype,
      userId
    });

    const selfieUrl = `/api/images/${selfieImage.id}`;
    await UserModel.findByIdAndUpdate(userId, { selfieUrl });

    // Use Gemini to compare the two images
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
      Compare these two photos. 
      Photo 1 is a profile picture. 
      Photo 2 is a live selfie for verification.
      Do these photos belong to the same person?
      Answer with only one word: "MATCH" or "NO_MATCH".
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: profilePhoto.data.toString('base64'),
          mimeType: profilePhoto.contentType
        }
      },
      {
        inlineData: {
          data: req.file.buffer.toString('base64'),
          mimeType: req.file.mimetype
        }
      }
    ]);

    const text = result.response.text().trim().toUpperCase();
    const isVerified = text.includes('MATCH') && !text.includes('NO_MATCH');

    if (isVerified) {
      await UserModel.findByIdAndUpdate(userId, { isVerified: true });
      res.json({ success: true, message: 'Identity verified successfully!', isVerified: true });
    } else {
      res.json({ success: false, message: 'AI could not verify your identity. Please try again with a clearer selfie.', isVerified: false });
    }

  } catch (error: any) {
    console.error('Selfie verification error:', error.message);
    res.status(500).json({ error: 'Verification service temporarily unavailable' });
  }
});

export default router;
