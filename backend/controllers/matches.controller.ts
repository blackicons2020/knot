import { adminDb } from '../firebase-admin';

export const swipe = async (req: any, res: any) => {
  try {
    const uid = req.user?.uid;
    const { swipedId, type } = req.body;

    if (!uid || !swipedId || !type) {
      return res.status(400).json({ error: 'swipedId and type required' });
    }

    // Record the swipe
    await adminDb.collection('swipes').add({
      swiperId: uid,
      swipedId,
      type, // 'like' or 'pass'
      createdAt: new Date().toISOString(),
    });

    // If it's a like, check if the other user also liked us (mutual match)
    if (type === 'like') {
      const mutual = await adminDb
        .collection('swipes')
        .where('swiperId', '==', swipedId)
        .where('swipedId', '==', uid)
        .where('type', '==', 'like')
        .limit(1)
        .get();

      if (!mutual.empty) {
        // Create a match document
        const matchId = [uid, swipedId].sort().join('_');
        await adminDb.collection('matches').doc(matchId).set({
          users: [uid, swipedId],
          createdAt: new Date().toISOString(),
        });
        return res.json({ match: true, matchId });
      }
    }

    res.json({ match: false });
  } catch (error: any) {
    console.error('Swipe error:', error.message);
    res.status(500).json({ error: 'Swipe failed' });
  }
};

export const getMutualMatches = async (req: any, res: any) => {
  try {
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ error: 'Unauthorized' });

    const snapshot = await adminDb
      .collection('matches')
      .where('users', 'array-contains', uid)
      .get();

    const matches: any[] = [];
    for (const doc of snapshot.docs) {
      const matchData = doc.data();
      const otherUserId = matchData.users.find((id: string) => id !== uid);
      if (otherUserId) {
        const userDoc = await adminDb.collection('users').doc(otherUserId).get();
        if (userDoc.exists) {
          const { password, ...userData } = userDoc.data() as any;
          matches.push({ ...userData, id: userDoc.id, matchId: doc.id });
        }
      }
    }

    res.json(matches);
  } catch (error: any) {
    console.error('GetMutualMatches error:', error.message);
    res.status(500).json({ error: 'Failed to get matches' });
  }
};
