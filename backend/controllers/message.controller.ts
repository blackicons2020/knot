import { MessageModel } from '../models/message.model';

// GET /api/messages/:matchId  — fetch conversation between current user and matchId
export const getMessages = async (req: any, res: any) => {
  const myId = req.user.id;
  const { matchId } = req.params;
  try {
    const messages = await MessageModel.find({
      $or: [
        { senderId: myId, receiverId: matchId },
        { senderId: matchId, receiverId: myId },
      ],
    }).sort({ timestamp: 1 });
    res.json(messages);
  } catch {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

// POST /api/messages  — send a message
export const sendMessage = async (req: any, res: any) => {
  const senderId = req.user.id;
  const { receiverId, text } = req.body;
  if (!receiverId || !text) return res.status(400).json({ error: 'receiverId and text are required' });

  try {
    const message = await MessageModel.create({ senderId, receiverId, text });
    res.status(201).json(message);
  } catch {
    res.status(500).json({ error: 'Failed to send message' });
  }
};
