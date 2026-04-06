import { User, Match, SmokingHabits, DrinkingHabits, MaritalStatus, WillingToRelocate, ChildrenPreference } from '../types';
import { MATCHES_DATA } from '../constants';

export const calculateMatchScore = (user: User, match: User): number => {
  let score = 50;
  if (user.residenceCountry === match.residenceCountry) {
    score += 15;
    if (user.residenceCity === match.residenceCity) score += 10;
  } else if (user.originCountry === match.originCountry) {
    score += 10;
  }
  if (user.marriageTimeline === match.marriageTimeline) {
    score += 25;
  } else {
    const timelines = ['ASAP', '1-2 years', '3+ years', 'Not sure'];
    const diff = Math.abs(
      timelines.indexOf(user.marriageTimeline) - timelines.indexOf(match.marriageTimeline),
    );
    if (diff === 1) score += 10;
  }
  const sharedValues = user.personalValues.filter((v) => match.personalValues.includes(v));
  score += Math.min(sharedValues.length * 5, 20);
  if (user.religion === match.religion) score += 10;
  if (user.culturalBackground === match.culturalBackground) score += 5;
  if (user.childrenPreference === match.childrenPreference) score += 10;
  if (user.smoking === match.smoking) score += 5;
  return Math.min(Math.max(score, 0), 100);
};

export const getCompatibilityInsight = async (
  user: User,
  match: Match,
): Promise<{ score: number; insight: string }> => {
  const score = calculateMatchScore(user, match);
  return { score, insight: 'Compatible foundation with strong potential in shared values.' };
};

export const searchRegistry = (query: string, matches: Match[]): Match[] => {
  if (!query.trim()) return matches;
  const q = query.toLowerCase();
  return matches.filter(
    (m) =>
      m.name.toLowerCase().includes(q) ||
      m.occupation.toLowerCase().includes(q) ||
      m.city.toLowerCase().includes(q) ||
      m.country.toLowerCase().includes(q) ||
      m.culturalBackground.toLowerCase().includes(q) ||
      m.originCountry.toLowerCase().includes(q),
  );
};

export const queryGlobalRegistry = async (count: number = 3): Promise<Match[]> => {
  // Fallback to random mock data – wire in Gemini API for production
  return [...MATCHES_DATA].sort(() => 0.5 - Math.random()).slice(0, count);
};

export const generateAIReply = async (
  user: User,
  match: Match,
  lastMessage: string,
): Promise<string> => {
  return "I appreciate your message. Let's talk more soon.";
};
