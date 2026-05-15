import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  matchId: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: Date;
  read: boolean;
}

const MessageSchema = new Schema<IMessage>(
  {
    matchId: { type: String, required: true, index: true },
    senderId: { type: String, required: true, index: true },
    receiverId: { type: String, required: true, index: true },
    text: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: 'timestamp', updatedAt: false } }
);

MessageSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    const r = ret as any;
    delete r._id;
    delete r.__v;
  },
});

export const MessageModel = mongoose.model<IMessage>('Message', MessageSchema);
