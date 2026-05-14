import { MatchModel } from '../models/match.model.js';
import { UserModel } from '../models/user.model.js';

export const swipe = async (req: any, res: any) => {
  try {
    const userId = req.user?.id || req.user?.uid;
    const { swipedId, type } = req.body;

    if (!userId || !swipedId || !type) {
      return res.status(400).json({ error: 'swipedId and type required' });
    }

    if (type === 'pass') {
      // Just record the pass (optional, depend on if you want to store passes)
      // Here we just return success
      return res.json({ match: false });
    }

    // Record the like
    const existingLike = await MatchModel.findOne({ userId, matchedUserId: swipedId });
    if (!existingLike) {
      await MatchModel.create({
        userId,
        matchedUserId: swipedId,
        isMutual: false,
      });
    }

    // Check for mutual match
    const mutualLike = await MatchModel.findOne({
      userId: swipedId,
      matchedUserId: userId,
    });

    if (mutualLike) {
      // Mark both as mutual
      await MatchModel.updateMany(
        {
          $or: [
            { userId: userId, matchedUserId: swipedId },
            { userId: swipedId, matchedUserId: userId },
          ],
        },
        { isMutual: true }
      );
      return res.json({ match: true, matchId: [userId, swipedId].sort().join('_') });
    }

    res.json({ match: false });
  } catch (error: any) {
    console.error('Swipe error:', error.message);
    res.status(500).json({ error: 'Swipe failed' });
  }
};

export const getMutualMatches = async (req: any, res: any) => {
  try {
    const userId = req.user?.id || req.user?.uid;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const mutualMatches = await MatchModel.find({
      userId,
      isMutual: true,
    });

    const matches: any[] = [];
    for (const m of mutualMatches) {
      const otherUser = await UserModel.findById(m.matchedUserId);
      if (otherUser) {
        matches.push({
          ...otherUser.toJSON(),
          matchId: [userId, m.matchedUserId].sort().join('_'),
        });
      }
    }

    res.json(matches);
  } catch (error: any) {
    console.error('GetMutualMatches error:', error.message);
    res.status(500).json({ error: 'Failed to get matches' });
  }
};
