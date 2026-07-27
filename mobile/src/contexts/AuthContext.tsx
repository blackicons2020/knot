import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/apiService';
import { User } from '../types';
import { usePushNotifications } from '../hooks/usePushNotifications';

interface AuthContextType {
  isAuthenticated: boolean;
  userProfile: User | null;
  setUserProfile: (user: User | null) => void;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  userProfile: null,
  setUserProfile: () => {},
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { expoPushToken } = usePushNotifications();

  useEffect(() => {
    if (userProfile && expoPushToken?.data) {
      // Background sync token to backend
      api.updateProfile(userProfile.id, { pushToken: expoPushToken.data }).catch(console.warn);
    }
  }, [userProfile, expoPushToken]);

  useEffect(() => {
    const restore = async () => {
      try {
        await api.init();

        // If user is not logged in (no token), immediately finish loading and open AuthScreen!
        if (!api.hasToken()) {
          setUserProfile(null);
          setLoading(false);
          return;
        }

        // Check for cached local user profile for instant launch
        const localUserStr = await AsyncStorage.getItem('knot_user_profile');
        if (localUserStr) {
          try {
            const localUser = JSON.parse(localUserStr);
            setUserProfile(localUser);
            setLoading(false); // Instantly open main app!
          } catch (e) {
            console.warn('Failed to parse cached user profile:', e);
          }
        }

        // Fetch fresh profile from backend in background
        try {
          const user = await api.getMe();
          if (user) {
            await AsyncStorage.setItem('knot_user_profile', JSON.stringify(user));
            setUserProfile(user);
          }
        } catch (e) {
          console.warn('Backend profile fetch failed or timed out:', e);
        }
      } catch (err) {
        setUserProfile(null);
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  const login = async (email: string, password: string) => {
    const { user } = await api.login(email, password);
    await AsyncStorage.setItem('knot_user_profile', JSON.stringify(user));
    setUserProfile(user);
  };

  const register = async (email: string, password: string) => {
    const { user } = await api.register(email, password);
    await AsyncStorage.setItem('knot_user_profile', JSON.stringify(user));
    setUserProfile(user);
  };

  const logout = async () => {
    api.logout();
    await AsyncStorage.removeItem('knot_user_profile');
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!userProfile,
        userProfile,
        setUserProfile,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
