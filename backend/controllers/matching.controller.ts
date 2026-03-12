
import { UserModel } from '../models/user.model';
import { MatchModel } from '../models/match.model';

export const getCompatibility = async (req: any, res: any) => {
  res.json({
    score: 88,
    insight: 'Profiles show high alignment in core values and timeline expectations.',
  });
};

// GET /api/matching/users — fetch potential matches, excluding the current user
export const getUsers = async (req: any, res: any) => {
  try {
    const excludeId = req.query.exclude as string | undefined;
    const currentUserId = req.user?.id;
    const excluded = [currentUserId, excludeId].filter(Boolean);
    const users = await UserModel.find({ _id: { $nin: excluded } }).limit(100);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// GET /api/matching/users/:id — get a single user profile
export const getUserById = async (req: any, res: any) => {
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

// POST /api/matching/like — record a like
export const likeUser = async (req: any, res: any) => {
  const { userId, matchedUserId } = req.body;
  if (!userId || !matchedUserId) {
    return res.status(400).json({ error: 'userId and matchedUserId are required' });
  }
  try {
    await MatchModel.findOneAndUpdate(
      { userId, matchedUserId },
      { userId, matchedUserId },
      { upsert: true, new: true }
    );
    // Check if mutual match exists
    const mutual = await MatchModel.findOne({ userId: matchedUserId, matchedUserId: userId });
    if (mutual) {
      await MatchModel.updateMany(
        { $or: [{ userId, matchedUserId }, { userId: matchedUserId, matchedUserId: userId }] },
        { isMutual: true }
      );
      return res.json({ liked: true, isMutual: true });
    }
    res.json({ liked: true, isMutual: false });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record like' });
  }
};

// GET /api/matching/likes/:userId — get all likes for a user
export const getLikes = async (req: any, res: any) => {
  try {
    const likes = await MatchModel.find({ userId: req.params.userId });
    res.json(likes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch likes' });
  }
};
