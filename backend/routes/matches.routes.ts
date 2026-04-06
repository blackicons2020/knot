import express from 'express';
import { swipe, getMutualMatches } from '../controllers/matches.controller';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.post('/swipe', authenticateToken, swipe);
router.get('/mutual', authenticateToken, getMutualMatches);

export default router;
