import { User, Match, Message, Resource, FilterState, SmokingHabits, DrinkingHabits, MaritalStatus, WillingToRelocate, ChildrenPreference } from './types';

export const CURRENT_USER: User = {
  id: 'user_0',
  name: 'Alex',
  firstName: 'Alex',
  lastName: 'M',
  gender: 'male',
  preferredGender: 'female',
  age: 29,
  bio: 'Software engineer with a passion for travel, hiking, and finding the best coffee shops.',
  interests: ['Traveling', 'Hiking', 'Coffee', 'Programming', 'Photography'],
  profileImageUrls: [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop',
  ],
  isVerified: false,
  isPremium: false,
  occupation: 'Software Engineer',
  city: 'San Francisco',
  country: 'USA',
  residenceCountry: 'United States of America',
  residenceState: 'California',
  residenceCity: 'San Francisco',
  originCountry: 'Nigeria',
  originState: 'Lagos',
  originCity: 'Ikeja',
  culturalBackground: 'Yoruba',
  education: 'B.S. in Computer Science',
  languagesSpoken: ['English', 'Yoruba', 'Spanish'],
  religion: 'Christian',
  personalValues: ['Honesty', 'Family', 'Kindness', 'Ambition'],
  smoking: SmokingHabits.NonSmoker,
  drinking: DrinkingHabits.Socially,
  maritalStatus: MaritalStatus.NeverMarried,
  childrenStatus: 'No kids',
  marriageTimeline: '1-2 years',
  willingToRelocate: WillingToRelocate.Maybe,
  preferredMarryFrom: 'Anywhere',
  childrenPreference: ChildrenPreference.WantsChildren,
  idealPartnerTraits: ['Kind', 'Ambitious', 'Family-oriented', 'Good sense of humor'],
  marriageExpectations: 'Looking for a life partner to build a future with, based on shared values, mutual respect, and a deep connection.',
  preferredPartnerAgeRange: [18, 60],
  nationality: 'American/Nigerian',
  careerGoals: 'Lead a team and build a product that makes a difference.',
};

export const MATCHES_DATA: Match[] = [];

export const INITIAL_FILTERS: FilterState = {
  ageRange: [18, 60],
  location: '',
  showVerifiedOnly: false,
};
