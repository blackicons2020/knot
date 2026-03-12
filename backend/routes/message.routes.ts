import express from 'express';
import { getMessages, sendMessage } from '../controllers/message.controller';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.get('/:matchId', authenticateToken, getMessages);
router.post('/', authenticateToken, sendMessage);

export default router;
