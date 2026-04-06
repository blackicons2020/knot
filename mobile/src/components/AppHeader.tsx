import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../contexts/ThemeContext';
import { Colors, Spacing } from '../theme/colors';
import KnotLogo from './KnotLogo';

const AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=128',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=128',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=128',
];

export default function AppHeader() {
  const insets = useSafeAreaInsets();
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <View>
      <View
        style={[
          st.header,
          {
            paddingTop: insets.top + 12,
            backgroundColor: isDarkMode ? Colors.dark + 'F2' : Colors.white + 'F2',
            borderBottomColor: isDarkMode ? Colors.darkBorder : Colors.gray100,
          },
        ]}
      >
        <View style={st.headerLeft}>
          <KnotLogo size="md" />
          <View style={st.headerActions}>
            <TouchableOpacity style={st.headerBtn}>
              <Ionicons name="options" size={18} color={isDarkMode ? Colors.accent : Colors.gray400} />
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleTheme} style={st.headerBtn}>
              <Ionicons
                name={isDarkMode ? 'sunny' : 'moon'}
                size={18}
                color={isDarkMode ? Colors.accent : Colors.gray400}
              />
            </TouchableOpacity>
          </View>
        </View>
        <View style={st.avatarStack}>
          {AVATARS.map((uri, i) => (
            <Image
              key={i}
              source={{ uri }}
              style={[st.stackAvatar, { marginLeft: i > 0 ? -10 : 0 }]}
            />
          ))}
        </View>
      </View>
      <Text style={[st.tagline, { color: isDarkMode ? Colors.accent : Colors.secondary }]}>
        Where true relationship leads to vow
      </Text>
    </View>
  );
}

const st = StyleSheet.create({
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 8,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerLeft: { gap: 6 },
  headerActions: { flexDirection: 'row', gap: 12, marginTop: 4 },
  headerBtn: { padding: 2 },
  avatarStack: { flexDirection: 'row', marginBottom: 8 },
  stackAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  tagline: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: -0.3,
    paddingVertical: 6,
  },
});
