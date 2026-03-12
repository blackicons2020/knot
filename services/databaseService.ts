
import { User, Match, Message } from '../types';
import { CURRENT_USER, MATCHES_DATA, LIKED_MATCHES_DATA, MESSAGES_DATA } from '../constants';
import { api } from './apiService';

const DB_KEYS = {
    USER: 'knot_user_profile',
    MATCHES: 'knot_matches_v2', // Versioned to avoid old schema conflicts
    LIKES: 'knot_likes',
    MESSAGES: 'knot_messages_history'
};

class DatabaseService {
    private isInitialized = false;

    constructor() {
        this.init();
    }

    private init() {
        if (this.isInitialized) return;
        if (!localStorage.getItem(DB_KEYS.USER)) {
            localStorage.setItem(DB_KEYS.USER, JSON.stringify(CURRENT_USER));
        }
        if (!localStorage.getItem(DB_KEYS.MATCHES)) {
            localStorage.setItem(DB_KEYS.MATCHES, JSON.stringify(MATCHES_DATA));
        }
        if (!localStorage.getItem(DB_KEYS.LIKES)) {
            localStorage.setItem(DB_KEYS.LIKES, JSON.stringify(LIKED_MATCHES_DATA));
        }
        if (!localStorage.getItem(DB_KEYS.MESSAGES)) {
            localStorage.setItem(DB_KEYS.MESSAGES, JSON.stringify(MESSAGES_DATA));
        }
        this.isInitialized = true;
    }

    async getUser(): Promise<User> {
        const token = localStorage.getItem('knot_auth_token');
        if (token) {
            try {
                const userData = await api.getMe();
                const user = userData as User;
                localStorage.setItem(DB_KEYS.USER, JSON.stringify(user));
                return user;
            } catch {
                // API unavailable — fall back to localStorage cache
            }
        }
        const raw = localStorage.getItem(DB_KEYS.USER);
        if (!raw) return CURRENT_USER;
        const user = JSON.parse(raw);
        if (user.childrenStatus === undefined) {
            user.childrenStatus = 'No kids';
            await this.saveUser(user);
        }
        return user;
    }

    async saveUser(user: User): Promise<void> {
        localStorage.setItem(DB_KEYS.USER, JSON.stringify(user));
        const token = localStorage.getItem('knot_auth_token');
        if (token) {
            api.updateMe(user).catch(() => {}); // write-through, silent on error
        }
    }

    // Write directly to localStorage only (used before token is available)
    saveLocalUser(user: User): void {
        localStorage.setItem(DB_KEYS.USER, JSON.stringify(user));
    }

    async getMatches(): Promise<Match[]> {
        const token = localStorage.getItem('knot_auth_token');
        if (token) {
            try {
                const currentUserRaw = localStorage.getItem(DB_KEYS.USER);
                const currentUser = currentUserRaw ? JSON.parse(currentUserRaw) : null;
                const users = await api.getUsers(currentUser?.id);
                const matches = users.map((u: any) => ({ ...u, childrenStatus: u.childrenStatus || 'No kids' }) as Match);
                if (matches.length > 0) {
                    localStorage.setItem(DB_KEYS.MATCHES, JSON.stringify(matches));
                    return matches;
                }
            } catch {
                // API unavailable — fall back to localStorage cache
            }
        }
        const raw = localStorage.getItem(DB_KEYS.MATCHES);
        if (!raw) return MATCHES_DATA;
        const matches = JSON.parse(raw);
        return matches.map((m: Match) => ({
            ...m,
            childrenStatus: m.childrenStatus || 'No kids'
        }));
    }

    async saveMatches(matches: Match[]): Promise<void> {
        localStorage.setItem(DB_KEYS.MATCHES, JSON.stringify(matches));
    }

    async addGlobalMatches(newMatches: Match[]): Promise<void> {
        const current = await this.getMatches();
        const existingIds = new Set(current.map(m => m.id));
        const uniqueNew = newMatches.filter(m => !existingIds.has(m.id));
        await this.saveMatches([...current, ...uniqueNew]);
    }

    async getLikedMatches(): Promise<Match[]> {
        const token = localStorage.getItem('knot_auth_token');
        if (token) {
            try {
                const currentUserRaw = localStorage.getItem(DB_KEYS.USER);
                const currentUser = currentUserRaw ? JSON.parse(currentUserRaw) : null;
                if (currentUser?.id) {
                    const likes = await api.getLikes(currentUser.id);
                    // likes are Match records, resolve full user profiles from the local matches list
                    const allMatches = await this.getMatches();
                    const likedIds = new Set(likes.map((l: any) => l.matchedUserId));
                    const likedMatches = allMatches.filter(m => likedIds.has(m.id));
                    localStorage.setItem(DB_KEYS.LIKES, JSON.stringify(likedMatches));
                    return likedMatches;
                }
            } catch {
                // fall back
            }
        }
        const raw = localStorage.getItem(DB_KEYS.LIKES);
        return raw ? JSON.parse(raw) : LIKED_MATCHES_DATA;
    }

    async addLike(match: Match): Promise<void> {
        const likes = await this.getLikedMatches();
        if (!likes.find(l => l.id === match.id)) {
            likes.push(match);
            localStorage.setItem(DB_KEYS.LIKES, JSON.stringify(likes));
        }
        const token = localStorage.getItem('knot_auth_token');
        if (token) {
            const currentUserRaw = localStorage.getItem(DB_KEYS.USER);
            const currentUser = currentUserRaw ? JSON.parse(currentUserRaw) : null;
            if (currentUser?.id) {
                api.likeUser(currentUser.id, match.id).catch(() => {});
            }
        }
    }

    async getMessages(matchId: string): Promise<Message[]> {
        const token = localStorage.getItem('knot_auth_token');
        if (token) {
            try {
                const msgs = await api.getMessages(matchId);
                return msgs.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
            } catch {
                // fall back to localStorage
            }
        }
        const historyStr = localStorage.getItem(DB_KEYS.MESSAGES);
        if (!historyStr) return [];
        const history = JSON.parse(historyStr);
        const conv = history.find((h: any) => h.matchId === matchId);
        return conv ? conv.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })) : [];
    }

    async sendMessage(matchId: string, message: Message): Promise<void> {
        const token = localStorage.getItem('knot_auth_token');
        if (token) {
            api.sendMessage(matchId, message.text).catch(() => {});
        }
        const historyStr = localStorage.getItem(DB_KEYS.MESSAGES);
        const history = historyStr ? JSON.parse(historyStr) : [];
        let conv = history.find((h: any) => h.matchId === matchId);
        if (!conv) {
            conv = { matchId, messages: [] };
            history.push(conv);
        }
        conv.messages.push(message);
        localStorage.setItem(DB_KEYS.MESSAGES, JSON.stringify(history));
    }
}

export const db = new DatabaseService();
