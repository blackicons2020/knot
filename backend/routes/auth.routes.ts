import express from 'express';
import { register, login, socialLogin } from '../controllers/auth.controller';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/social', socialLogin);

export default router;
