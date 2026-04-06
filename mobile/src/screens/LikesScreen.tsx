import React, { useEffect, useState } from 'react';
import {
  Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View,
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
const { width } = Dimensions.get('window');
const CARD_W = (width - Spacing.md * 2 - 12) / 2;

export default function LikesScreen() {
  const navigation = useNavigation<Nav>();
  const { userProfile } = useAuth();
  const { isDarkMode } = useTheme();
  const [likes, setLikes] = useState<Match[]>([]);

  useEffect(() => {
    if (!userProfile?.isPremium) return;
    db.getLikedMatches(userProfile.id).then(setLikes);
  }, [userProfile]);

  if (!userProfile?.isPremium) {
    return (
      <View style={[s.root, { backgroundColor: isDarkMode ? Colors.dark : Colors.gray50 }]}>
        <AppHeader />
        <View style={s.lockWrap}>
          <View style={[s.lockCircle, { backgroundColor: isDarkMode ? Colors.darkSurface : Colors.light }]}>
            <Ionicons name="lock-closed" size={32} color={isDarkMode ? Colors.accent : Colors.primary} />
          </View>
          <Text style={[s.lockTitle, { color: isDarkMode ? Colors.white : Colors.dark }]}>Premium Access Only</Text>
          <Text style={[s.lockDesc, { color: isDarkMode ? Colors.gray400 : Colors.gray500 }]}>
            Subscribe to see who has liked your profile and start meaningful conversations.
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

  return (
    <View style={[s.root, { backgroundColor: isDarkMode ? Colors.dark : Colors.gray50 }]}>
      <AppHeader />
      <FlatList
        data={likes}
        keyExtractor={(m) => m.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ padding: Spacing.md, gap: 12, paddingBottom: 100 }}
        renderItem={({ item }) => {
          const photo = item.profileImageUrls?.[0] || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400';
          return (
            <TouchableOpacity
              style={s.card}
              onPress={() => navigation.navigate('ProfileDetail', { match: item })}
              activeOpacity={0.9}
            >
              <Image source={{ uri: photo }} style={s.cardImg} />
              <View style={s.cardGrad} />
              <View style={s.cardInfo}>
                <Text style={s.cardName}>{item.name}, {item.age}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={s.emptyWrap}>
            <Text style={[s.emptyTitle, { color: isDarkMode ? Colors.gray400 : Colors.gray600 }]}>No one has liked your profile yet.</Text>
            <Text style={[s.emptySub, { color: isDarkMode ? Colors.gray500 : Colors.gray500 }]}>Keep exploring and check back soon!</Text>
          </View>
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  title: { fontSize: 22, fontWeight: '900', paddingHorizontal: Spacing.md, paddingTop: Spacing.md },
  lockWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  lockCircle: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  lockTitle: { fontSize: 18, fontWeight: '900', textTransform: 'uppercase', letterSpacing: -0.5, marginBottom: 12 },
  lockDesc: { fontSize: 13, fontWeight: '500', textAlign: 'center', marginBottom: 32, lineHeight: 20 },
  upgradeBtn: { width: '100%', paddingVertical: 16, borderRadius: BorderRadius.lg, alignItems: 'center', elevation: 4 },
  upgradeBtnText: { fontSize: 11, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2 },
  card: { width: CARD_W, height: 220, borderRadius: BorderRadius.md, overflow: 'hidden' },
  cardImg: { width: '100%', height: '100%' },
  cardGrad: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)' },
  cardInfo: { position: 'absolute', bottom: 10, left: 10 },
  cardName: { color: Colors.white, fontWeight: '700', fontSize: 13 },
  emptyWrap: { alignItems: 'center', paddingVertical: 80 },
  emptyTitle: { fontWeight: '700' },
  emptySub: { fontSize: 13, marginTop: 8 },
});
