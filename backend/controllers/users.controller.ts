import { UserModel } from '../models/user.model';

export const getAllUsers = async (req: any, res: any) => {
  try {
    const users = await UserModel.find();
    res.json(users);
  } catch (error: any) {
    console.error('GetAllUsers error:', error.message);
    res.status(500).json({ error: 'Failed to get users' });
  }
};

export const getUser = async (req: any, res: any) => {
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error: any) {
    console.error('GetUser error:', error.message);
    res.status(500).json({ error: 'Failed to get user' });
  }
};

export const updateUser = async (req: any, res: any) => {
  try {
    const user = await UserModel.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error: any) {
    console.error('UpdateUser error:', error.message);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

export const deleteUser = async (req: any, res: any) => {
  try {
    const user = await UserModel.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
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

    // Clear existing users if you want, or just insert
    // await UserModel.deleteMany({});
    
    const preparedUsers = users.map(u => ({
      ...u,
      // Ensure we don't have conflicting IDs if seeding
    }));

    await UserModel.insertMany(preparedUsers);
    res.json({ success: true, count: users.length });
  } catch (error: any) {
    console.error('SeedUsers error:', error.message);
    res.status(500).json({ error: 'Failed to seed users' });
  }
};
