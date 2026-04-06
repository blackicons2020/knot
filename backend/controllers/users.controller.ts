import { adminDb } from '../firebase-admin';

export const getAllUsers = async (req: any, res: any) => {
  try {
    const snapshot = await adminDb.collection('users').get();
    const users = snapshot.docs.map((doc) => {
      const { password, ...data } = doc.data();
      return { ...data, id: doc.id };
    });
    res.json(users);
  } catch (error: any) {
    console.error('GetAllUsers error:', error.message);
    res.status(500).json({ error: 'Failed to get users' });
  }
};

export const getUser = async (req: any, res: any) => {
  try {
    const doc = await adminDb.collection('users').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'User not found' });
    const { password, ...user } = doc.data() as any;
    res.json({ ...user, id: doc.id });
  } catch (error: any) {
    console.error('GetUser error:', error.message);
    res.status(500).json({ error: 'Failed to get user' });
  }
};

export const updateUser = async (req: any, res: any) => {
  try {
    const userRef = adminDb.collection('users').doc(req.params.id);
    const doc = await userRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'User not found' });

    await userRef.update({ ...req.body, updatedAt: new Date().toISOString() });
    res.json({ success: true });
  } catch (error: any) {
    console.error('UpdateUser error:', error.message);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

export const deleteUser = async (req: any, res: any) => {
  try {
    await adminDb.collection('users').doc(req.params.id).delete();
    res.json({ success: true });
  } catch (error: any) {
    console.error('DeleteUser error:', error.message);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

export const seedUsers = async (req: any, res: any) => {
  try {
    const { users } = req.body;
    if (!Array.isArray(users)) return res.status(400).json({ error: 'users array required' });

    const batch = adminDb.batch();
    for (const user of users) {
      const ref = user.id ? adminDb.collection('users').doc(user.id) : adminDb.collection('users').doc();
      batch.set(ref, { ...user, id: ref.id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    await batch.commit();
    res.json({ success: true, count: users.length });
  } catch (error: any) {
    console.error('SeedUsers error:', error.message);
    res.status(500).json({ error: 'Failed to seed users' });
  }
};
