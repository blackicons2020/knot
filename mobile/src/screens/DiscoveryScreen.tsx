import React, { useMemo } from 'react';
import {
  Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import AppHeader from '../components/AppHeader';
import { Colors, BorderRadius, Spacing } from '../theme/colors';
import { RootStackParamList, Match } from '../types';
import { calculateMatchScore } from '../services/matchingService';
import { db } from '../services/apiService';
import { MATCHES_DATA } from '../constants';

type Nav = NativeStackNavigationProp<RootStackParamList>;
const { width } = Dimensions.get('window');
const COL_GAP = 10;
const CARD_W = (width - Spacing.md * 2 - COL_GAP) / 2;

export default function DiscoveryScreen() {
  const navigation = useNavigation<Nav>();
  const { userProfile } = useAuth();
  const { isDarkMode } = useTheme();

  const [matches, setMatches] = React.useState<Match[]>([]);
  React.useEffect(() => {
    if (!userProfile) return;
    db.getPotentialMatches(userProfile).then((data) => {
      const unique = Array.from(new Map(data.map((m) => [m.id, m])).values());
      setMatches(unique.length > 0 ? unique : MATCHES_DATA);
    });
  }, [userProfile]);

  const processed = useMemo(() => {
    if (!userProfile) return matches;
    return [...matches]
      .map((m) => ({ ...m, localScore: calculateMatchScore(userProfile, m) }))
      .sort((a, b) => {
        if ((b.subscriptionAmount || 0) !== (a.subscriptionAmount || 0))
          return (b.subscriptionAmount || 0) - (a.subscriptionAmount || 0);
        return b.localScore - a.localScore;
      });
  }, [matches, userProfile]);

  const openProfile = (match: Match) => navigation.navigate('ProfileDetail', { match });

  const renderItem = ({ item }: { item: Match }) => {
    const photo = item.profileImageUrls?.[0] || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800';
    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: isDarkMode ? Colors.darkCard : Colors.white, borderColor: isDarkMode ? Colors.darkBorder : Colors.gray100 }]}
        onPress={() => openProfile(item)}
        activeOpacity={0.9}
      >
        <Image source={{ uri: photo }} style={styles.cardImage} />
        <View style={styles.cardGradient} />
        <View style={styles.cardInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.cardName} numberOfLines={1}>{item.name}, {item.age}</Text>
            {item.isVerified && (
              <View style={styles.verifiedDot}>
                <Ionicons name="checkmark-circle" size={10} color={Colors.primary} />
              </View>
            )}
          </View>
          <Text style={styles.cardCity} numberOfLines={1}>{item.city}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? Colors.dark : Colors.gray50 }]}>
      <AppHeader />
      <FlatList
        data={processed}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ gap: COL_GAP }}
        contentContainerStyle={{ padding: Spacing.md, paddingBottom: 100, gap: COL_GAP }}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={[styles.emptyText, { color: isDarkMode ? Colors.gray500 : Colors.gray400 }]}>No users found in the registry.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: {
    width: CARD_W,
    aspectRatio: 3 / 4,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
  },
  cardImage: { width: '100%', height: '100%' },
  cardGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  cardInfo: { position: 'absolute', bottom: 10, left: 10, right: 10 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  cardName: { fontSize: 11, fontWeight: '900', color: Colors.white },
  verifiedDot: { backgroundColor: Colors.white, borderRadius: 6, padding: 1 },
  cardCity: { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 100 },
  emptyText: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 2 },
});
