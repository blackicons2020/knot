import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user.model';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_EXPIRES = '30d';

const signToken = (userId: string, email: string) =>
  jwt.sign({ id: userId, uid: userId, email }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

// POST /api/auth/register
export const register = async (req: any, res: any) => {
  const { email, password, name } = req.body;
  console.log(`Registration attempt for: ${email}`);

  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required' });

  try {
    console.log('Checking for existing user...');
    const existing = await UserModel.findOne({ email });
    if (existing) {
      console.log('User already exists.');
      return res.status(409).json({ error: 'Email already registered' });
    }

    console.log('Hashing password...');
    const passwordHash = await bcrypt.hash(password, 12);

    console.log('Creating user in database...');
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

    console.log(`User created successfully with ID: ${user.id}. Signing token...`);
    const token = signToken(user.id, user.email || '');
    
    console.log('Registration complete.');
    res.status(201).json({ token, user, isNew: true });
  } catch (error: any) {
    console.error('DETAILED REGISTRATION ERROR:', error);
    res.status(500).json({ 
      error: 'Registration failed', 
      details: error.message,
      code: error.code || 'UNKNOWN'
    });
  }
};

// POST /api/auth/login
export const login = async (req: any, res: any) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required' });

  try {
    const user = await UserModel.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const raw = await UserModel.findOne({ email }).select('+passwordHash').lean();
    const isValid = await bcrypt.compare(password, (raw as any)?.passwordHash || '');
    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = signToken(user.id, user.email || '');
    res.json({ token, user, isNew: false });
  } catch (error: any) {
    console.error('Login error:', error.message || error);
    res.status(500).json({ error: error.message || 'Login failed' });
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
