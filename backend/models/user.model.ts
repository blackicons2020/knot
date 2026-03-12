import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  id: string;
  email?: string;
  name: string;
  age: number;
  bio: string;
  interests: string[];
  profileImageUrls: string[];
  isVerified: boolean;
  isPremium: boolean;
  occupation: string;
  city: string;
  country: string;
  residenceCountry: string;
  residenceState: string;
  residenceCity: string;
  originCountry: string;
  originState: string;
  originCity: string;
  education: string;
  languages: string[];
  religion: string;
  culturalBackground: string;
  personalValues: string[];
  smoking: string;
  drinking: string;
  maritalStatus: string;
  childrenStatus: string;
  marriageTimeline: string;
  willingToRelocate: string;
  preferredMarryFrom: string;
  childrenPreference: string;
  idealPartnerTraits: string[];
  marriageExpectations: string;
  nationality: string;
  careerGoals: string;
  subscriptionDate?: string;
  subscriptionAmount?: number;
  subscriptionPeriod?: string;
  passwordHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, unique: true, sparse: true, trim: true, lowercase: true },
    name: { type: String, required: true },
    age: { type: Number, required: true },
    bio: { type: String, default: '' },
    interests: [{ type: String }],
    profileImageUrls: [{ type: String }],
    isVerified: { type: Boolean, default: false },
    isPremium: { type: Boolean, default: false },
    occupation: { type: String, default: '' },
    city: { type: String, default: '' },
    country: { type: String, default: '' },
    residenceCountry: { type: String, default: '' },
    residenceState: { type: String, default: '' },
    residenceCity: { type: String, default: '' },
    originCountry: { type: String, default: '' },
    originState: { type: String, default: '' },
    originCity: { type: String, default: '' },
    education: { type: String, default: '' },
    languages: [{ type: String }],
    religion: { type: String, default: '' },
    culturalBackground: { type: String, default: '' },
    personalValues: [{ type: String }],
    smoking: { type: String, default: 'Non-smoker' },
    drinking: { type: String, default: 'Never' },
    maritalStatus: { type: String, default: 'Never Married' },
    childrenStatus: { type: String, default: 'No kids' },
    marriageTimeline: { type: String, default: '' },
    willingToRelocate: { type: String, default: 'Maybe' },
    preferredMarryFrom: { type: String, default: '' },
    childrenPreference: { type: String, default: 'Open to children' },
    idealPartnerTraits: [{ type: String }],
    marriageExpectations: { type: String, default: '' },
    nationality: { type: String, default: '' },
    careerGoals: { type: String, default: '' },
    subscriptionDate: { type: String },
    subscriptionAmount: { type: Number },
    subscriptionPeriod: { type: String },
    passwordHash: { type: String },
  },
  { timestamps: true }
);

// Virtual 'id' field mapped to MongoDB '_id'
UserSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.passwordHash;
  },
});

export const UserModel = mongoose.model<IUser>('User', UserSchema);
