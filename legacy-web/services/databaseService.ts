import api from '../src/api';
import { User, Match, Message } from '../types';

class DatabaseService {
    // User Operations
    async getUser(uid: string): Promise<User | null> {
        try {
            const response = await api.get(`/users/${uid}`);
            return response.data;
        } catch (error) {
            console.error('GetUser error:', error);
            return null;
        }
    }

    async saveUser(user: User): Promise<void> {
        try {
            await api.put(`/users/${user.id}`, user);
        } catch (error) {
            console.error('SaveUser error:', error);
        }
    }

    async updatePremiumStatus(uid: string, isPremium: boolean): Promise<void> {
        try {
            await api.put(`/users/${uid}`, { isPremium });
        } catch (error) {
            console.error('UpdatePremiumStatus error:', error);
        }
    }

    // Matching Operations
    async getPotentialMatches(currentUser: User): Promise<Match[]> {
        try {
            const response = await api.get('/users');
            // Filter out current user and map to Match type
            return response.data
                .filter((u: User) => u.id !== currentUser.id)
                .map((u: User) => u as Match);
        } catch (error) {
            console.error('GetPotentialMatches error:', error);
            return [];
        }
    }

    async getLikedMatches(uid: string): Promise<Match[]> {
        try {
            const response = await api.get('/matches');
            return response.data;
        } catch (error) {
            console.error('GetLikedMatches error:', error);
            return [];
        }
    }

    async recordSwipe(swiperId: string, swipedId: string, type: 'like' | 'pass'): Promise<void> {
        try {
            await api.post('/matches/swipe', { swipedId, type });
        } catch (error) {
            console.error('RecordSwipe error:', error);
        }
    }

    // Messaging Operations
    subscribeToMessages(matchId: string, callback: (messages: Message[]) => void) {
        // Since MongoDB doesn't have native subscriptions, we use polling as a fallback
        // In production, you should use Socket.io or Server-Sent Events
        const fetchMessages = async () => {
            try {
                const response = await api.get(`/messages/${matchId}`);
                callback(response.data);
            } catch (error) {
                console.error('FetchMessages error:', error);
            }
        };

        fetchMessages(); // Initial fetch
        const interval = setInterval(fetchMessages, 3000); // Poll every 3 seconds

        return () => clearInterval(interval);
    }

    async sendMessage(matchId: string, senderId: string, text: string): Promise<void> {
        try {
            await api.post(`/messages/${matchId}`, { text });
        } catch (error) {
            console.error('SendMessage error:', error);
        }
    }

    async getAllUsers(): Promise<User[]> {
        try {
            const response = await api.get('/users');
            return response.data;
        } catch (error) {
            console.error('GetAllUsers error:', error);
            return [];
        }
    }

    async seedMockData(mockMatches: Match[]): Promise<void> {
        try {
            await api.post('/users/seed', { users: mockMatches });
        } catch (error) {
            console.error('SeedMockData error:', error);
        }
    }

    async addGlobalMatches(newMatches: Match[]): Promise<void> {
        try {
            // Reusing seed logic or just individual updates
            for (const match of newMatches) {
                await api.put(`/users/${match.id}`, { ...match, isGlobal: true });
            }
        } catch (error) {
            console.error('AddGlobalMatches error:', error);
        }
    }

    async deleteUser(uid: string): Promise<void> {
        try {
            await api.delete(`/users/${uid}`);
        } catch (error) {
            console.error('DeleteUser error:', error);
        }
    }
}

export const databaseService = new DatabaseService();
export const db = databaseService;
