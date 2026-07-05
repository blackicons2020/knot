import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '../contexts/AuthContext';
import { RootStackParamList } from '../types';
import { Colors } from '../theme/colors';

import { useTheme } from '../contexts/ThemeContext';
import TabNavigator from './TabNavigator';
import AuthScreen from '../screens/AuthScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import ProfileDetailScreen from '../screens/ProfileDetailScreen';
import ChatScreen from '../screens/ChatScreen';
import VideoCallScreen from '../screens/VideoCallScreen';
import VerificationScreen from '../screens/VerificationScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import ManagePhotosScreen from '../screens/ManagePhotosScreen';
import PaymentScreen from '../screens/PaymentScreen';
import AdminScreen from '../screens/AdminScreen';
import LegalScreen from '../screens/LegalScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { isAuthenticated, userProfile, loading } = useAuth();
  const { isDarkMode } = useTheme();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121721' }}>
        <ActivityIndicator color="#D4AF37" size="large" />
      </View>
    );
  }

  const needsOnboarding = isAuthenticated && (!userProfile?.firstName || userProfile.firstName === '');

  return (
    <NavigationContainer theme={isDarkMode ? DarkTheme : DefaultTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : userProfile?.role === 'ADMIN' ? (
          <>
            <Stack.Screen name="Admin" component={AdminScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen
              name="ProfileDetail"
              component={ProfileDetailScreen}
              options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
            />
          </>
        ) : needsOnboarding ? (
          <>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Legal" component={LegalScreen} options={{ presentation: 'modal' }} />
          </>
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={TabNavigator} />
            <Stack.Screen
              name="ProfileDetail"
              component={ProfileDetailScreen}
              options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
            />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="VideoCall" component={VideoCallScreen} options={{ animation: 'fade' }} />
            <Stack.Screen name="Verification" component={VerificationScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="ManagePhotos" component={ManagePhotosScreen} />
            <Stack.Screen name="Payment" component={PaymentScreen} />
            <Stack.Screen name="Admin" component={AdminScreen} />
            <Stack.Screen name="Legal" component={LegalScreen} options={{ presentation: 'modal' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
