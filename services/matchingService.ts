
import { User, Match, SmokingHabits, DrinkingHabits, MaritalStatus, WillingToRelocate, ChildrenPreference } from '../types';
import { MATCHES_DATA } from '../constants';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });

const callGeminiWithRetry = async (fn: () => Promise<any>, retries = 3, delay = 1000): Promise<any> => {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error: any) {
            const isRetryable = error?.status === 429 || error?.status === 500 || error?.status === 503 || error?.status === 504;
            if (i === retries - 1 || !isRetryable) throw error;
            await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        }
    }
};

/**
 * Calculates a compatibility score (0-100) based on shared profile data.
 * Weights: Location (25), Timeline (25), Values (20), Religion (15), Lifestyle (15)
 */
export const calculateMatchScore = (user: User, match: User): number => {
    let score = 50; // Neutral starting point

    // 1. Location Alignment (Max +25)
    if (user.residenceCountry === match.residenceCountry) {
        score += 15;
        if (user.residenceCity === match.residenceCity) score += 10;
    } else if (user.originCountry === match.originCountry) {
        score += 10; // Heritage connection if residence differs
    }

    // 2. Timeline Alignment (Max +25)
    if (user.marriageTimeline === match.marriageTimeline) {
        score += 25;
    } else {
        // Partial points for adjacent timelines
        const timelines = ["ASAP", "1-2 years", "3+ years", "Not sure"];
        const diff = Math.abs(timelines.indexOf(user.marriageTimeline) - timelines.indexOf(match.marriageTimeline));
        if (diff === 1) score += 10;
    }

    // 3. Shared Values (Max +20)
    const sharedValues = user.personalValues.filter(v => match.personalValues.includes(v));
    score += Math.min(sharedValues.length * 5, 20);

    // 4. Religion & Culture (Max +15)
    if (user.religion === match.religion) score += 10;
    if (user.culturalBackground === match.culturalBackground) score += 5;

    // 5. Lifestyle & Children (Max +15)
    if (user.childrenPreference === match.childrenPreference) score += 10;
    if (user.smoking === match.smoking) score += 5;

    // Normalize to 0-100 range
    return Math.min(Math.max(score, 0), 100);
};

export const getCompatibilityInsight = async (user: User, match: Match): Promise<{ score: number, insight: string }> => {
    const score = calculateMatchScore(user, match);
    
    try {
        const response = await callGeminiWithRetry(() => ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Analyze compatibility between ${user.name} and ${match.name}. 
            User: ${user.bio}, ${user.religion}, ${user.personalValues.join(', ')}.
            Match: ${match.bio}, ${match.religion}, ${match.personalValues.join(', ')}.
            Provide a 1-sentence insight on why they are a good match for marriage.`,
        }));
        return { score, insight: response.text || "Strong potential based on shared registry values." };
    } catch (e) {
        return { score, insight: "Compatible foundation with strong potential in shared values." };
    }
};

export const searchRegistry = (query: string, matches: Match[]): Match[] => {
    if (!query.trim()) return matches;
    const q = query.toLowerCase();
    return matches.filter(m => 
        m.name.toLowerCase().includes(q) ||
        m.occupation.toLowerCase().includes(q) ||
        m.city.toLowerCase().includes(q) ||
        m.country.toLowerCase().includes(q) ||
        m.culturalBackground.toLowerCase().includes(q) ||
        m.originCountry.toLowerCase().includes(q)
    );
};

export const queryGlobalRegistry = async (count: number = 3): Promise<Match[]> => {
    try {
        const response = await callGeminiWithRetry(() => ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Generate ${count} unique, high-quality marriage-oriented user profiles for a global registry.
            Each profile must be a JSON object with these fields:
            id (unique string), name, age (22-45), bio, interests (array), profileImageUrls (array of 2 Unsplash URLs), 
            isVerified (boolean), isPremium (boolean), occupation, city, country, residenceCountry, residenceState, residenceCity, 
            originCountry, originState, originCity, culturalBackground, marriageExpectations, preferredPartnerAgeRange (array [min, max]), 
            education, languages (array), religion, personalValues (array), smoking (enum: NonSmoker, Occasional, Regular), 
            drinking (enum: Never, Socially, Regular), maritalStatus (enum: NeverMarried, Divorced, Widowed), 
            childrenStatus (string), marriageTimeline (enum: ASAP, 1-2 years, 3+ years, Not sure), 
            willingToRelocate (enum: Yes, No, Maybe), preferredMarryFrom, childrenPreference (enum: WantsChildren, OpenToChildren, DoesNotWantChildren), 
            idealPartnerTraits (array), nationality, careerGoals.
            
            Return ONLY a JSON array of objects.`,
            config: { responseMimeType: "application/json" }
        }));

        const generated = JSON.parse(response.text || "[]");
        return generated.map((p: any) => ({
            ...p,
            smoking: p.smoking as SmokingHabits || SmokingHabits.NonSmoker,
            drinking: p.drinking as DrinkingHabits || DrinkingHabits.Socially,
            maritalStatus: p.maritalStatus as MaritalStatus || MaritalStatus.NeverMarried,
            willingToRelocate: p.willingToRelocate as WillingToRelocate || WillingToRelocate.Maybe,
            childrenPreference: p.childrenPreference as ChildrenPreference || ChildrenPreference.WantsChildren,
            childrenStatus: p.childrenStatus || "No kids",
            subscriptionAmount: p.isPremium ? (Math.random() > 0.5 ? 10 : 7) : 0
        }));
    } catch (e) {
        console.error("Global Registry Query Failed:", e);
        // Fallback to random mock data if AI fails
        return [...MATCHES_DATA].sort(() => 0.5 - Math.random()).slice(0, count);
    }
};

export const generateAIReply = async (user: User, match: Match, lastMessage: string): Promise<string> => {
    try {
        const response = await callGeminiWithRetry(() => ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Generate a polite, marriage-oriented reply from ${match.name} to ${user.name}.
            Context: ${match.name} is a ${match.occupation} from ${match.city}. 
            Last message from ${user.name}: "${lastMessage}".
            Keep it under 30 words and respectful.`,
        }));
        return response.text || "Thank you for your message. I'd love to learn more about you.";
    } catch (e) {
        return "I appreciate your message. Let's talk more soon.";
    }
};
