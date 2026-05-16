import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user.model.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_EXPIRES = '30d';

const signToken = (userId: string, email: string) =>
  jwt.sign({ id: userId, uid: userId, email }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

// POST /api/auth/register
export const register = async (req: any, res: any) => {
  const { email, password, name } = req.body;
  console.log(`[AUTH] Registration attempt for: ${email}`);

  if (!email || !password) {
    console.warn(`[AUTH] Registration failed: Missing email or password for ${email}`);
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    console.log('[AUTH] Checking for existing user in MongoDB...');
    const existing = await UserModel.findOne({ email });
    if (existing) {
      console.log(`[AUTH] Registration conflict: User ${email} already exists.`);
      return res.status(409).json({ error: 'Email already registered' });
    }

    console.log('[AUTH] Hashing password and creating record...');
    const passwordHash = await bcrypt.hash(password, 12);

    const user = await UserModel.create({
      email,
      passwordHash,
      name: name || email.split('@')[0],
      age: 25,
      isVerified: false,
      isPremium: false,
      profileImageUrls: [],
      interests: [],
      languages: [],
      personalValues: [],
      idealPartnerTraits: [],
    });

    console.log(`[AUTH] SUCCESS: User ${user.id} created. Signing token...`);
    const token = signToken(user.id, user.email || '');
    
    return res.status(201).json({ token, user, isNew: true });
  } catch (error: any) {
    console.error('[AUTH] CRITICAL REGISTRATION ERROR:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      name: error.name
    });

    res.status(500).json({ 
      error: 'Registration failed at database or server level', 
      details: error.message,
      code: error.code || 'UNKNOWN',
      type: error.name
    });
  }
};

// POST /api/auth/login
export const login = async (req: any, res: any) => {
  const { email, password } = req.body;
  console.log(`[AUTH] Login attempt for: ${email}`);

  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required' });

  try {
    console.log('[AUTH] Finding user...');
    const user = await UserModel.findOne({ email });
    if (!user) {
      console.warn(`[AUTH] Login failed: User ${email} not found.`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('[AUTH] Verifying password...');
    const raw = await UserModel.findOne({ email }).select('+passwordHash').lean();
    const isValid = await bcrypt.compare(password, (raw as any)?.passwordHash || '');
    
    if (!isValid) {
      console.warn(`[AUTH] Login failed: Incorrect password for ${email}.`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log(`[AUTH] SUCCESS: User ${user.id} logged in.`);
    const token = signToken(user.id, user.email || '');
    res.json({ token, user, isNew: false });
  } catch (error: any) {
    console.error('[AUTH] Login error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      error: 'Login failed', 
      details: error.message,
      type: error.name 
    });
  }
};

// GET /api/auth/me
export const getMe = async (req: any, res: any) => {
  try {
    const userId = req.user?.id || req.user?.uid;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user);
  } catch (error: any) {
    console.error('GetMe error:', error.message);
    res.status(500).json({ error: 'Failed to get user' });
  }
};

// POST /api/auth/social
export const socialLogin = async (req: any, res: any) => {
  const { email, name } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    let user = await UserModel.findOne({ email });
    const isNew = !user;

    if (!user) {
      user = await UserModel.create({
        email,
        name: name || email.split('@')[0],
        age: 25,
        isVerified: false,
        isPremium: false,
        profileImageUrls: [],
        interests: [],
        languages: [],
        personalValues: [],
        idealPartnerTraits: [],
      });
    }

    const token = signToken(user.id, user.email || '');
    res.json({ token, user, isNew });
  } catch (error: any) {
    console.error('Social login error:', error.message || error);
    res.status(500).json({ error: error.message || 'Social login failed' });
  }
};
