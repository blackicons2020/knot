import express from 'express';
import { getMessages, sendMessage } from '../controllers/messages.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/:matchId', authenticateToken, getMessages);
router.post('/:matchId', authenticateToken, sendMessage);

export default router;
