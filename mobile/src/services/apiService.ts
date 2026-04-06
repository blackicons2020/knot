import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { User, Match, Message } from '../types';

const DEV_API_URL = Platform.OS === 'web' ? 'http://localhost:5000/api' : 'http://10.0.2.2:5000/api';
const API_URL = process.env.EXPO_PUBLIC_API_URL || (__DEV__ ? DEV_API_URL : 'https://knotmobile-backend.onrender.com/api');
// Base URL without /api — used for serving uploaded files
const BASE_URL = API_URL.replace(/\/api$/, '');

class ApiService {
  private token: string | null = null;

  async init() {
    this.token = await AsyncStorage.getItem('knot_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      AsyncStorage.setItem('knot_token', token);
    } else {
      AsyncStorage.removeItem('knot_token');
    }
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    const res = await fetch(`${API_URL}${path}`, { ...options, headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data as T;
  }

  // Auth
  async register(email: string, password: string) {
    const data = await this.request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    return data;
  }

  async login(email: string, password: string) {
    const data = await this.request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    return data;
  }

  async getMe(): Promise<User | null> {
    try {
      return await this.request<User>('/auth/me');
    } catch {
      return null;
    }
  }

  logout() {
    this.setToken(null);
  }

  // Users
  async getUser(uid: string): Promise<User | null> {
    try {
      return await this.request<User>(`/users/${uid}`);
    } catch {
      return null;
    }
  }

  async saveUser(user: Partial<User> & { id: string }): Promise<void> {
    const { id, ...body } = user;
    await this.request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(body) });
  }

  async updatePremiumStatus(uid: string, isPremium: boolean): Promise<void> {
    await this.request(`/users/${uid}`, {
      method: 'PUT',
      body: JSON.stringify({ isPremium }),
    });
  }

  async getPotentialMatches(_currentUser: User): Promise<Match[]> {
    return this.request<Match[]>('/users');
  }

  async getLikedMatches(_uid: string): Promise<Match[]> {
    return this.request<Match[]>('/matches/mutual');
  }

  async recordSwipe(swiperId: string, swipedId: string, type: 'like' | 'pass'): Promise<void> {
    await this.request('/matches/swipe', {
      method: 'POST',
      body: JSON.stringify({ swipedId, type }),
    });
  }

  // Messages (polling-based instead of WebSocket for now)
  async getMessages(matchId: string): Promise<Message[]> {
    return this.request<Message[]>(`/messages/${matchId}`);
  }

  async sendMessage(matchId: string, senderId: string, text: string): Promise<void> {
    await this.request(`/messages/${matchId}`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }

  // Polling-based message subscription
  subscribeToMessages(matchId: string, callback: (messages: Message[]) => void) {
    let active = true;
    const poll = async () => {
      while (active) {
        try {
          const messages = await this.getMessages(matchId);
          callback(messages);
        } catch { /* ignore polling errors */ }
        await new Promise((r) => setTimeout(r, 3000));
      }
    };
    poll();
    return () => { active = false; };
  }

  // Admin
  async getAllUsers(): Promise<User[]> {
    return this.request<User[]>('/users');
  }

  async deleteUser(uid: string): Promise<void> {
    await this.request(`/users/${uid}`, { method: 'DELETE' });
  }

  async seedMockData(users: User[]): Promise<void> {
    await this.request('/users/seed', {
      method: 'POST',
      body: JSON.stringify({ users }),
    });
  }

  async addGlobalMatches(users: User[]): Promise<void> {
    const globalUsers = users.map((u) => ({ ...u, isGlobal: true }));
    await this.request('/users/seed', {
      method: 'POST',
      body: JSON.stringify({ users: globalUsers }),
    });
  }

  // Upload a photo file, returns the full URL for displaying
  async uploadPhoto(uri: string): Promise<string> {
    const formData = new FormData();

    if (Platform.OS === 'web') {
      // On web, uri is a blob URL — fetch it and append as blob
      const response = await fetch(uri);
      const blob = await response.blob();
      formData.append('photo', blob, 'photo.jpg');
    } else {
      // On native, use the file URI directly
      const filename = uri.split('/').pop() || 'photo.jpg';
      const ext = filename.split('.').pop()?.toLowerCase() || 'jpg';
      const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
      formData.append('photo', { uri, name: filename, type: mimeType } as any);
    }

    const headers: Record<string, string> = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    // Don't set Content-Type — let fetch set it with the boundary
    const res = await fetch(`${API_URL}/upload`, { method: 'POST', headers, body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    // Return full URL (e.g. http://localhost:5000/uploads/abc123.jpg)
    return `${BASE_URL}${data.url}`;
  }
}

export const api = new ApiService();
export const db = api; // backward-compatible alias
