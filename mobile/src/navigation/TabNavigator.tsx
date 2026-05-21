import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import InsightsScreen from '../screens/InsightsScreen';
import AICoachScreen from '../screens/AICoachScreen';
import MessagesScreen from '../screens/MessagesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { Colors } from '../theme/colors';
import { TabParamList } from '../types';
import { useTheme } from '../contexts/ThemeContext';

const Tab = createBottomTabNavigator<TabParamList>();

interface TabBarIconProps {
  name: string;
  focused: boolean;
  isDark: boolean;
}

function TabBarIcon({ name, focused, isDark }: TabBarIconProps) {
  const iconMap: Record<string, { active: string; inactive: string }> = {
    Home: { active: 'compass', inactive: 'compass-outline' },
    Insights: { active: 'analytics', inactive: 'analytics-outline' },
    AICoach: { active: 'sparkles', inactive: 'sparkles-outline' },
    Messages: { active: 'chatbubbles', inactive: 'chatbubbles-outline' },
    Profile: { active: 'person', inactive: 'person-outline' },
  };
  const icons = iconMap[name] || { active: 'ellipse', inactive: 'ellipse-outline' };
  const color = focused
    ? Colors.primary
    : isDark
    ? Colors.gray500
    : Colors.gray400;
  return <Ionicons name={(focused ? icons.active : icons.inactive) as any} size={22} color={color} />;
}

export default function TabNavigator() {
  const { isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: isDarkMode ? Colors.dark : Colors.white,
          borderTopColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : Colors.gray100,
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
        },
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: '900',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: isDarkMode ? Colors.gray500 : Colors.gray400,
        tabBarIcon: ({ focused }) => (
          <TabBarIcon name={route.name} focused={focused} isDark={isDarkMode} />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Matches' }} />
      <Tab.Screen name="Insights" component={InsightsScreen} options={{ tabBarLabel: 'Insights' }} />
      <Tab.Screen name="AICoach" component={AICoachScreen} options={{ tabBarLabel: 'AI Coach' }} />
      <Tab.Screen name="Messages" component={MessagesScreen} options={{ tabBarLabel: 'Messages' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}
