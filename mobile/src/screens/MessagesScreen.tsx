import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import AppHeader from '../components/AppHeader';
import { Colors, Spacing, BorderRadius } from '../theme/colors';
import { RootStackParamList, Match } from '../types';
import { db } from '../services/apiService';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function MessagesScreen() {
  const navigation = useNavigation<Nav>();
  const { userProfile } = useAuth();
  const { isDarkMode } = useTheme();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userProfile) return;
    db.getLikedMatches(userProfile.id).then((m) => {
      setMatches(m);
      setLoading(false);
    });
  }, [userProfile]);

  if (!userProfile?.isPremium) {
    return (
      <View style={[s.root, { backgroundColor: isDarkMode ? Colors.dark : Colors.gray50 }]}>
        <AppHeader />
        <View style={s.lockWrap}>
          <View style={[s.lockCircle, { backgroundColor: isDarkMode ? Colors.darkSurface : Colors.light }]}>
            <Ionicons name="chatbubbles" size={32} color={isDarkMode ? Colors.accent : Colors.primary} />
          </View>
          <Text style={[s.lockTitle, { color: isDarkMode ? Colors.white : Colors.dark }]}>Messaging Restricted</Text>
          <Text style={[s.lockDesc, { color: isDarkMode ? Colors.gray400 : Colors.gray500 }]}>
            Subscribe to start chatting with your matches and build real connections.
          </Text>
          <TouchableOpacity
            style={[s.upgradeBtn, { backgroundColor: isDarkMode ? Colors.accent : Colors.primary }]}
            onPress={() => navigation.navigate('Payment', { user: userProfile! })}
          >
            <Text style={[s.upgradeBtnText, { color: isDarkMode ? Colors.dark : Colors.white }]}>Upgrade to Premium</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[s.root, { backgroundColor: isDarkMode ? Colors.dark : Colors.gray50 }]}>
        <AppHeader />
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 60 }} />
      </View>
    );
  }

  return (
    <View style={[s.root, { backgroundColor: isDarkMode ? Colors.dark : Colors.gray50 }]}>
      <AppHeader />
      <FlatList
        data={matches}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => {
          const photo = item.profileImageUrls?.[0] || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400';
          return (
            <TouchableOpacity
              style={[s.chatRow, { borderBottomColor: isDarkMode ? Colors.darkBorder : Colors.gray100 }]}
              onPress={() => navigation.navigate('Chat', { match: item, user: userProfile! })}
            >
              <Image source={{ uri: photo }} style={s.avatar} />
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={[s.chatName, { color: isDarkMode ? Colors.white : Colors.dark }]}>{item.name}</Text>
                <Text style={s.chatSub}>Tap to start chatting</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.gray400} />
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={s.emptyWrap}>
            <Text style={[s.emptyTitle, { color: isDarkMode ? Colors.gray400 : Colors.gray600 }]}>No chats yet.</Text>
            <Text style={[s.emptySub, { color: isDarkMode ? Colors.gray500 : Colors.gray500 }]}>When you match with someone, you can chat here.</Text>
          </View>
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  title: { fontSize: 22, fontWeight: '900', textTransform: 'uppercase', letterSpacing: -0.5, paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: 8 },
  lockWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  lockCircle: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  lockTitle: { fontSize: 18, fontWeight: '900', textTransform: 'uppercase', letterSpacing: -0.5, marginBottom: 12 },
  lockDesc: { fontSize: 13, fontWeight: '500', textAlign: 'center', marginBottom: 32, lineHeight: 20 },
  upgradeBtn: { width: '100%', paddingVertical: 16, borderRadius: BorderRadius.lg, alignItems: 'center', elevation: 4 },
  upgradeBtnText: { fontSize: 11, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2 },
  chatRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: 14, borderBottomWidth: 1 },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  chatName: { fontSize: 15, fontWeight: '700' },
  chatSub: { fontSize: 13, color: Colors.gray500, marginTop: 2 },
  emptyWrap: { alignItems: 'center', paddingVertical: 80 },
  emptyTitle: { fontWeight: '700' },
  emptySub: { fontSize: 13, marginTop: 8, textAlign: 'center' },
});
