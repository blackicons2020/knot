
import express from 'express';
import { getCompatibility } from '../controllers/matching.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/compatibility', authenticateToken, getCompatibility);

export default router;
