import { adminDb } from '../firebase-admin';

export const getMessages = async (req: any, res: any) => {
  try {
    const { matchId } = req.params;

    const snapshot = await adminDb
      .collection('messages')
      .where('matchId', '==', matchId)
      .orderBy('createdAt', 'asc')
      .get();

    const messages = snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));

    res.json(messages);
  } catch (error: any) {
    console.error('GetMessages error:', error.message);
    res.status(500).json({ error: 'Failed to get messages' });
  }
};

export const sendMessage = async (req: any, res: any) => {
  try {
    const { matchId } = req.params;
    const uid = req.user?.uid;
    const { text } = req.body;

    if (!text) return res.status(400).json({ error: 'text required' });

    const message = {
      matchId,
      senderId: uid,
      text,
      createdAt: new Date().toISOString(),
    };

    const ref = await adminDb.collection('messages').add(message);
    res.status(201).json({ ...message, id: ref.id });
  } catch (error: any) {
    console.error('SendMessage error:', error.message);
    res.status(500).json({ error: 'Failed to send message' });
  }
};
