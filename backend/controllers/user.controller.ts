import { UserModel } from '../models/user.model';

// GET /api/users/me
export const getMe = async (req: any, res: any) => {
  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

// PUT /api/users/me
export const updateMe = async (req: any, res: any) => {
  // Strip read-only / sensitive fields from the body
  const { passwordHash, _id, __v, ...updates } = req.body;
  try {
    const user = await UserModel.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch {
    res.status(500).json({ error: 'Profile update failed' });
  }
};
