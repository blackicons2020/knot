import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user.model';

const JWT_SECRET = process.env.JWT_SECRET || 'knot_jwt_secret';
const JWT_EXPIRES = '30d';

const signToken = (userId: string) =>
  jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

// POST /api/auth/register
export const register = async (req: any, res: any) => {
  const { email, password, name } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required' });

  try {
    const existing = await UserModel.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await UserModel.create({
      email,
      passwordHash,
      name: name || '',
      age: 25,
      isVerified: false,
      isPremium: false,
      profileImageUrls: [],
      interests: [],
      languages: [],
      personalValues: [],
      idealPartnerTraits: [],
    });

    const token = signToken(user.id);
    res.status(201).json({ token, user, isNew: true });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
};

// POST /api/auth/login
export const login = async (req: any, res: any) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required' });

  try {
    // Need passwordHash — select it explicitly since it's not in toJSON
    const user = await UserModel.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const raw = await UserModel.findOne({ email }).select('+passwordHash').lean();
    const isValid = await bcrypt.compare(password, (raw as any)?.passwordHash || '');
    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = signToken(user.id);
    res.json({ token, user, isNew: false });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
};

// POST /api/auth/social  — sign in / sign up via social provider (no password)
export const socialLogin = async (req: any, res: any) => {
  const { email, name } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    let user = await UserModel.findOne({ email });
    const isNew = !user;

    if (!user) {
      user = await UserModel.create({
        email,
        name: name || '',
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

    const token = signToken(user.id);
    res.json({ token, user, isNew });
  } catch (error) {
    res.status(500).json({ error: 'Social login failed' });
  }
};
