import express from 'express';
import { getMe, updateMe } from '../controllers/user.controller';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.get('/me', authenticateToken, getMe);
router.put('/me', authenticateToken, updateMe);

export default router;
