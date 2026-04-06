import React, { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import { Colors, BorderRadius, Spacing } from '../theme/colors';
import { RootStackParamList, Match, FilterState } from '../types';
import { INITIAL_FILTERS, MATCHES_DATA } from '../constants';
import { db } from '../services/apiService';
import { queryGlobalRegistry, calculateMatchScore } from '../services/matchingService';
import AppHeader from '../components/AppHeader';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function MatchCard({ match, user, onPress }: { match: Match; user: any; onPress: () => void }) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const score = calculateMatchScore(user, match);
  const photos = match.profileImageUrls?.length
    ? match.profileImageUrls
    : ['https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800'];
  const { isDarkMode } = useTheme();

  return (
    <View
      style={[styles.card, { backgroundColor: isDarkMode ? Colors.darkCard : Colors.white, borderColor: isDarkMode ? Colors.darkBorder : Colors.gray100 }]}
    >
      <TouchableOpacity style={styles.cardImageWrap} onPress={onPress} activeOpacity={0.95}>
        <Image source={{ uri: photos[photoIndex] }} style={styles.cardImage} />

        {/* Score badge */}
        <View style={[styles.scoreBadge, { backgroundColor: Colors.primary + 'E6' }]}>
          <Text style={[styles.scoreText, { color: Colors.accent }]}>{score}%</Text>
          <Text style={[styles.scoreLabel, { color: Colors.accent }]}>MATCH</Text>
        </View>

        {/* Photo indicators (vertical pills, left side) */}
        {photos.length > 1 && (
          <View style={styles.photoIndicators}>
            {photos.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.indicatorPill,
                  { backgroundColor: i === photoIndex ? '#FFFFFF' : 'rgba(255,255,255,0.35)' },
                ]}
              />
            ))}
          </View>
        )}

        {/* Gradient overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.12)', 'rgba(0,0,0,0.82)']}
          locations={[0, 0.35, 1]}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        />

        {/* Info overlay */}
        <View style={styles.cardOverlay}>
          <View style={styles.nameRow}>
            <Text style={styles.cardName}>{match.name}, {match.age}</Text>
            {match.isVerified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
              </View>
            )}
          </View>
          <Text style={styles.cardOccupation}>{match.occupation}</Text>
          <Text style={styles.cardLocation}>{match.city}, {match.country}</Text>
        </View>
      </TouchableOpacity>

      <View style={[styles.cardBody, { borderTopColor: isDarkMode ? Colors.darkBorder : Colors.gray100 }]}>
        <Text style={[styles.cardBio, { color: isDarkMode ? Colors.gray400 : Colors.gray600 }]} numberOfLines={2}>
          "{match.marriageExpectations || match.bio}"
        </Text>
        <View style={styles.cardFooter}>
          <View style={{ flexShrink: 1 }}>
            <Text style={[styles.timelineLabel, { color: isDarkMode ? Colors.gray500 : Colors.gray400 }]}>MARRIAGE{`\n`}TIMELINE</Text>
            <Text style={[styles.timelineValue, { color: isDarkMode ? Colors.accent : Colors.primary }]}>{match.marriageTimeline}</Text>
          </View>
          <View style={styles.footerActions}>
            <TouchableOpacity
              style={[styles.heartBtn, { backgroundColor: isDarkMode ? Colors.darkSurface : Colors.gray100 }]}
              onPress={onPress}
            >
              <Ionicons name="heart-outline" size={22} color={isDarkMode ? Colors.accent : Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.reviewBtn, { backgroundColor: isDarkMode ? Colors.accent : Colors.primary }]}
              onPress={onPress}
            >
              <Text style={[styles.reviewBtnText, { color: isDarkMode ? Colors.dark : Colors.white }]}>REVIEW{`\n`}PROFILE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { userProfile } = useAuth();
  const { isDarkMode } = useTheme();
  const { addToast } = useToast();

  const [matches, setMatches] = useState<Match[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);

  useEffect(() => {
    if (!userProfile) return;
    (async () => {
      let data = await db.getPotentialMatches(userProfile);
      if (data.length <= 1) {
        await db.seedMockData(MATCHES_DATA.slice(0, 5));
        data = await db.getPotentialMatches(userProfile);
      }
      const unique = Array.from(new Map(data.map((m) => [m.id, m])).values());
      setMatches(unique);
    })();
  }, [userProfile]);

  const fetchMore = useCallback(async () => {
    if (isSyncing || !userProfile) return;
    setIsSyncing(true);
    try {
      const newMatches = await queryGlobalRegistry(6);
      if (newMatches.length > 0) {
        await db.addGlobalMatches(newMatches);
        setMatches((prev) => {
          const combined = [...prev, ...newMatches];
          return Array.from(new Map(combined.map((m) => [m.id, m])).values());
        });
      }
    } catch {
      addToast('Global Sync Failed.', 'error');
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, userProfile]);

  const filtered = matches
    .filter((m) => {
      const ageOk = m.age >= filters.ageRange[0] && m.age <= filters.ageRange[1];
      const locOk = filters.location
        ? m.city?.toLowerCase().includes(filters.location.toLowerCase()) ||
          m.country?.toLowerCase().includes(filters.location.toLowerCase())
        : true;
      const verOk = filters.showVerifiedOnly ? m.isVerified : true;
      return ageOk && locOk && verOk;
    })
    .sort((a, b) => (b.subscriptionAmount || 0) - (a.subscriptionAmount || 0));

  const openProfile = (match: Match) => navigation.navigate('ProfileDetail', { match });

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? Colors.dark : Colors.gray50 }]}>
      <AppHeader />

      {isSyncing && <View style={[styles.syncBar, { backgroundColor: isDarkMode ? Colors.accent : Colors.primary }]} />}

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: Spacing.md, paddingBottom: 100 }}
        onEndReached={() => fetchMore()}
        onEndReachedThreshold={0.3}
        renderItem={({ item }) => (
          <MatchCard match={item} user={userProfile} onPress={() => openProfile(item)} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={[styles.emptyText, { color: isDarkMode ? Colors.gray400 : Colors.gray500 }]}>No matches found in this criteria.</Text>
          </View>
        }
        ListFooterComponent={isSyncing ? <ActivityIndicator color={Colors.primary} style={{ marginTop: Spacing.lg }} /> : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  syncBar: { height: 2, width: '100%' },
  card: {
    borderRadius: 40,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardImageWrap: { width: '100%', aspectRatio: 1 },
  cardImage: { width: '100%', height: '100%' },
  photoIndicators: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
    gap: 6,
  },
  indicatorPill: {
    width: 4,
    height: 20,
    borderRadius: 2,
  },
  scoreBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    zIndex: 10,
  },
  scoreText: { fontSize: 14, fontWeight: '900', lineHeight: 16 },
  scoreLabel: { fontSize: 7, fontWeight: '900', letterSpacing: 1, marginTop: 2 },
  cardOverlay: { position: 'absolute', bottom: 16, left: 20, right: 20 },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  cardName: { fontSize: 22, fontWeight: '900', color: Colors.white, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6 },
  verifiedBadge: { backgroundColor: Colors.white, borderRadius: 10, padding: 1, marginLeft: 6 },
  cardOccupation: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 },
  cardLocation: { fontSize: 10, fontWeight: '500', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 2, marginTop: 2 },
  cardBody: { paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1 },
  cardBio: { fontSize: 12, fontStyle: 'italic', lineHeight: 18 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 },
  footerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  heartBtn: { padding: 12, borderRadius: BorderRadius.lg },
  timelineLabel: { fontSize: 8, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2 },
  timelineValue: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 },
  reviewBtn: { paddingHorizontal: 24, paddingVertical: 14, borderRadius: BorderRadius.lg },
  reviewBtnText: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2, textAlign: 'center' },
  emptyWrap: { alignItems: 'center', paddingVertical: 80, paddingHorizontal: 40 },
  emptyText: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 2, textAlign: 'center' },
});
