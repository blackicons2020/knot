
import express from 'express';
import { getCompatibility, getUsers, getUserById, likeUser, getLikes } from '../controllers/matching.controller';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.post('/compatibility', authenticateToken, getCompatibility);
router.get('/users', authenticateToken, getUsers);
router.get('/users/:id', authenticateToken, getUserById);
router.post('/like', authenticateToken, likeUser);
router.get('/likes/:userId', authenticateToken, getLikes);

export default router;
