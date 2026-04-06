import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { adminDb } from '../firebase-admin';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// Simple password hashing (use bcrypt in production)
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export const register = async (req: any, res: any) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Check if user already exists
    const existing = await adminDb.collection('users').where('email', '==', email).limit(1).get();
    if (!existing.empty) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const userRef = adminDb.collection('users').doc();
    const user = {
      id: userRef.id,
      email,
      password: hashPassword(password),
      name: '',
      age: 0,
      bio: '',
      photos: [],
      interests: [],
      isPremium: false,
      isGlobal: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await userRef.set(user);

    const token = jwt.sign({ uid: userRef.id, email }, JWT_SECRET, { expiresIn: '30d' });
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json({ token, user: userWithoutPassword });
  } catch (error: any) {
    console.error('Register error:', error.message);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req: any, res: any) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const snapshot = await adminDb.collection('users').where('email', '==', email).limit(1).get();
    if (snapshot.empty) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const doc = snapshot.docs[0];
    const user = doc.data();

    if (user.password !== hashPassword(password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ uid: doc.id, email }, JWT_SECRET, { expiresIn: '30d' });
    const { password: _, ...userWithoutPassword } = user;
    res.json({ token, user: { ...userWithoutPassword, id: doc.id } });
  } catch (error: any) {
    console.error('Login error:', error.message);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const getMe = async (req: any, res: any) => {
  try {
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ error: 'Unauthorized' });

    const doc = await adminDb.collection('users').doc(uid).get();
    if (!doc.exists) return res.status(404).json({ error: 'User not found' });

    const { password, ...user } = doc.data() as any;
    res.json({ ...user, id: doc.id });
  } catch (error: any) {
    console.error('GetMe error:', error.message);
    res.status(500).json({ error: 'Failed to get user' });
  }
};
