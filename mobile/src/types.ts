// Navigation param list for all screens
export type RootStackParamList = {
  Auth: undefined;
  Onboarding: undefined;
  MainTabs: undefined;
  ProfileDetail: { match: Match };
  Chat: { match: Match; user: User };
  VideoCall: { match: Match; user: User };
  Verification: { user: User };
  EditProfile: { user: User };
  ManagePhotos: { user: User };
  Payment: { user: User };
  Admin: undefined;
};

export type TabParamList = {
  Home: undefined;
  Discovery: undefined;
  Likes: undefined;
  Messages: undefined;
  Profile: undefined;
};

// Enums
export enum SmokingHabits {
  NonSmoker = 'Non-smoker',
  Occasional = 'Occasional',
  Regular = 'Regular',
  TryingToQuit = 'Trying to quit',
}

export enum DrinkingHabits {
  Never = 'Never',
  Socially = 'Socially',
  Frequently = 'Frequently',
  Sober = 'Sober',
}

export enum MaritalStatus {
  NeverMarried = 'Never Married',
  Divorced = 'Divorced',
  Widowed = 'Widowed',
  Annulled = 'Annulled',
}

export enum WillingToRelocate {
  Yes = 'Yes',
  No = 'No',
  Maybe = 'Maybe',
}

export enum ChildrenPreference {
  WantsChildren = 'Wants children',
  DoesNotWantChildren = "Doesn't want children",
  OpenToChildren = 'Open to children',
  HasChildren = 'Has children',
}

export enum TravelFrequency {
  Often = 'Often',
  Sometimes = 'Sometimes',
  Rarely = 'Rarely',
  Never = 'Never',
}

export enum SocialActivity {
  Introvert = 'Introvert',
  Extrovert = 'Extrovert',
  Ambivert = 'Ambivert',
}

export interface User {
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
  smoking: SmokingHabits;
  drinking: DrinkingHabits;
  maritalStatus: MaritalStatus;
  childrenStatus: string;
  marriageTimeline: string;
  willingToRelocate: WillingToRelocate;
  preferredMarryFrom: string;
  childrenPreference: ChildrenPreference;
  idealPartnerTraits: string[];
  marriageExpectations: string;
  preferredPartnerAgeRange: [number, number];
  nationality: string;
  careerGoals: string;
  subscriptionDate?: string;
  subscriptionAmount?: number;
  subscriptionPeriod?: string;
}

export interface Match extends User {
  compatibilityScore?: number;
  compatibilityInsight?: string;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  link: string;
}

export interface FilterState {
  ageRange: [number, number];
  location: string;
  showVerifiedOnly: boolean;
}
