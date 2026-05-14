import { MessageModel } from '../models/message.model.js';

export const getMessages = async (req: any, res: any) => {
  try {
    const { matchId } = req.params;

    const messages = await MessageModel.find({ matchId })
      .sort({ timestamp: 1 });

    res.json(messages);
  } catch (error: any) {
    console.error('GetMessages error:', error.message);
    res.status(500).json({ error: 'Failed to get messages' });
  }
};

export const sendMessage = async (req: any, res: any) => {
  try {
    const { matchId } = req.params;
    const userId = req.user?.id || req.user?.uid;
    const { text, receiverId } = req.body;

    if (!text) return res.status(400).json({ error: 'text required' });

    // In a real app, you'd verify if the users are actually matched
    
    const message = await MessageModel.create({
      matchId,
      senderId: userId,
      receiverId: receiverId || 'unknown', // receiverId should ideally be provided or looked up from matchId
      text,
    });

    res.status(201).json(message);
  } catch (error: any) {
    console.error('SendMessage error:', error.message);
    res.status(500).json({ error: 'Failed to send message' });
  }
};
