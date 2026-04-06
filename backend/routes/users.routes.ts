import express from 'express';
import { getAllUsers, getUser, updateUser, deleteUser, seedUsers } from '../controllers/users.controller';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticateToken, getAllUsers);
router.get('/:id', authenticateToken, getUser);
router.put('/:id', authenticateToken, updateUser);
router.delete('/:id', authenticateToken, deleteUser);
router.post('/seed', authenticateToken, seedUsers);

export default router;
