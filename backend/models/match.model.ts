import mongoose, { Schema, Document } from 'mongoose';

export interface IMatch extends Document {
  userId: string;
  matchedUserId: string;
  likedAt: Date;
  isMutual: boolean;
}

const MatchSchema = new Schema<IMatch>(
  {
    userId: { type: String, required: true, index: true },
    matchedUserId: { type: String, required: true, index: true },
    likedAt: { type: Date, default: Date.now },
    isMutual: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Prevent duplicate like records
MatchSchema.index({ userId: 1, matchedUserId: 1 }, { unique: true });

MatchSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  },
});

export const MatchModel = mongoose.model<IMatch>('Match', MatchSchema);
