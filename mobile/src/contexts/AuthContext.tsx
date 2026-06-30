import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/apiService';
import { User } from '../types';

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

  useEffect(() => {
    const restore = async () => {
      try {
        await api.init();
        let user = await api.getMe();
        
        if (user) {
          await AsyncStorage.setItem('knot_user_profile', JSON.stringify(user));
        } else {
          // Fallback to local storage if backend is unreachable during demo
          const localUser = await AsyncStorage.getItem('knot_user_profile');
          if (localUser) {
            user = JSON.parse(localUser);
          }
        }
        
        setUserProfile(user);
      } catch {
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
