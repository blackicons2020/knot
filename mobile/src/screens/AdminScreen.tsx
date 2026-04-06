import React, { useState, useEffect, useMemo } from 'react';
import {
  ActivityIndicator, Alert, FlatList, Image, StyleSheet, Text,
  TextInput, TouchableOpacity, View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import { Colors, Spacing, BorderRadius } from '../theme/colors';
import { RootStackParamList, User } from '../types';
import { db } from '../services/apiService';
import { MATCHES_DATA } from '../constants';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type AdminTab = 'all' | 'pending' | 'verified' | 'subscribers';

export default function AdminScreen() {
  const navigation = useNavigation<Nav>();
  const { isDarkMode } = useTheme();
  const { addToast } = useToast();

  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<AdminTab>('all');
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    const data = await db.getAllUsers();
    setMembers(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSeed = async () => {
    setLoading(true);
    try {
      await db.seedMockData(MATCHES_DATA);
      addToast('Registry seeded with mock data.', 'success');
      await load();
    } catch {
      addToast('Seeding failed.', 'error');
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    Alert.alert('Confirm', 'Purge this member? This cannot be undone.', [
      { text: 'Cancel' },
      {
        text: 'Purge', style: 'destructive', onPress: async () => {
          try {
            await db.deleteUser(id);
            setMembers((p) => p.filter((m) => m.id !== id));
            addToast('Member purged.', 'success');
          } catch { addToast('Purge failed.', 'error'); }
        }
      },
    ]);
  };

  const toggleVerify = async (member: User) => {
    const updated = { ...member, isVerified: !member.isVerified };
    await db.saveUser(updated);
    setMembers((p) => p.map((m) => (m.id === member.id ? updated : m)));
    addToast(updated.isVerified ? 'Identity verified.' : 'Verification revoked.', 'success');
  };

  const filtered = useMemo(() => {
    let list = [...members];
    if (tab === 'pending') list = list.filter((m) => !m.isVerified);
    if (tab === 'verified') list = list.filter((m) => m.isVerified);
    if (tab === 'subscribers') list = list.filter((m) => m.isPremium);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((m) =>
        m.name.toLowerCase().includes(q) ||
        (m.occupation && m.occupation.toLowerCase().includes(q)) ||
        (m.email && m.email.toLowerCase().includes(q))
      );
    }
    return list;
  }, [members, tab, search]);

  const revenue = members.reduce((s, m) => s + (m.subscriptionAmount || 0), 0);

  return (
    <View style={[s.root, { backgroundColor: isDarkMode ? Colors.dark : Colors.gray50 }]}>
      {/* Header */}
      <View style={s.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Ionicons name="shield-checkmark" size={22} color={Colors.accent} />
          <View>
            <Text style={s.headerTitle}>Management Panel</Text>
            <Text style={s.headerSub}>Registry Administration</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TouchableOpacity style={s.seedBtn} onPress={handleSeed} disabled={loading}>
            <Text style={s.seedBtnText}>{loading ? 'SEEDING...' : 'SEED MOCK DATA'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.closeBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={22} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats */}
      <View style={s.statsRow}>
        <View style={s.statCard}><Text style={s.statLabel}>Total</Text><Text style={[s.statValue, { color: Colors.primary }]}>{members.length}</Text></View>
        <View style={s.statCard}><Text style={s.statLabel}>Revenue</Text><Text style={[s.statValue, { color: Colors.secondary }]}>${revenue.toFixed(2)}</Text></View>
        <View style={s.statCard}><Text style={s.statLabel}>Pending</Text><Text style={[s.statValue, { color: '#f97316' }]}>{members.filter((m) => !m.isVerified).length}</Text></View>
        <View style={s.statCard}><Text style={s.statLabel}>Verified</Text><Text style={[s.statValue, { color: '#16a34a' }]}>{members.filter((m) => m.isVerified).length}</Text></View>
      </View>

      {/* Search */}
      <View style={{ paddingHorizontal: Spacing.md }}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search directory..."
          placeholderTextColor={Colors.gray400}
          style={[s.searchInput, { backgroundColor: isDarkMode ? Colors.darkCard : Colors.white, color: isDarkMode ? Colors.white : Colors.gray900 }]}
        />
      </View>

      {/* Tabs */}
      <View style={s.tabRow}>
        {(['all', 'pending', 'verified', 'subscribers'] as AdminTab[]).map((t) => (
          <TouchableOpacity key={t} style={[s.tab, tab === t && s.tabActive]} onPress={() => setTab(t)}>
            <Text style={[s.tabText, tab === t && s.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: Spacing.md, paddingBottom: 100, gap: 12 }}
          renderItem={({ item }) => {
            const photo = item.profileImageUrls?.[0] || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200';
            return (
              <View style={[s.memberCard, { backgroundColor: isDarkMode ? Colors.darkCard : Colors.white }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                  <Image source={{ uri: photo }} style={s.memberAvatar} />
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={[s.memberName, { color: isDarkMode ? Colors.white : Colors.dark }]}>{item.name}, {item.age}</Text>
                      {item.isVerified && <Ionicons name="checkmark-circle" size={16} color="#22c55e" />}
                    </View>
                    <Text style={s.memberOcc}>{item.occupation}</Text>
                  </View>
                </View>
                <View style={s.memberActions}>
                  <TouchableOpacity
                    style={[s.verifyBtn, item.isVerified && s.verifyBtnRevoke]}
                    onPress={() => toggleVerify(item)}
                  >
                    <Text style={[s.verifyBtnText, item.isVerified && { color: Colors.gray600 }]}>
                      {item.isVerified ? 'Revoke Verification' : 'Approve User'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(item.id)}>
                    <Ionicons name="trash" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingVertical: 60 }}>
              <Text style={{ color: Colors.gray500, fontWeight: '600' }}>No members found.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.dark, paddingHorizontal: Spacing.md, paddingVertical: 14, paddingTop: 50 },
  headerTitle: { fontSize: 16, fontWeight: '900', color: Colors.white, textTransform: 'uppercase', letterSpacing: -0.5 },
  headerSub: { fontSize: 8, fontWeight: '700', color: Colors.accent, textTransform: 'uppercase', letterSpacing: 3, marginTop: 2 },
  seedBtn: { backgroundColor: Colors.accent, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  seedBtnText: { fontSize: 10, fontWeight: '900', color: Colors.dark, textTransform: 'uppercase', letterSpacing: 1 },
  closeBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16 },
  statsRow: { flexDirection: 'row', gap: 8, padding: Spacing.md },
  statCard: { flex: 1, backgroundColor: Colors.white, padding: 12, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.gray100 },
  statLabel: { fontSize: 10, fontWeight: '900', color: Colors.gray400, textTransform: 'uppercase', letterSpacing: 1 },
  statValue: { fontSize: 20, fontWeight: '900', marginTop: 4 },
  searchInput: { borderWidth: 1, borderColor: Colors.gray100, borderRadius: BorderRadius.lg, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, marginBottom: 12 },
  tabRow: { flexDirection: 'row', marginHorizontal: Spacing.md, backgroundColor: Colors.gray100, borderRadius: BorderRadius.lg, padding: 4, gap: 4, marginBottom: 4 },
  tab: { flex: 1, paddingVertical: 8, borderRadius: BorderRadius.md, alignItems: 'center' },
  tabActive: { backgroundColor: Colors.white, elevation: 1 },
  tabText: { fontSize: 10, fontWeight: '900', color: Colors.gray400, textTransform: 'uppercase', letterSpacing: 1 },
  tabTextActive: { color: Colors.primary },
  memberCard: { padding: 16, borderRadius: 20, borderWidth: 1, borderColor: Colors.gray100, elevation: 1 },
  memberAvatar: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: Colors.white },
  memberName: { fontSize: 16, fontWeight: '900' },
  memberOcc: { fontSize: 10, color: Colors.gray400, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  memberActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.gray50 },
  verifyBtn: { backgroundColor: Colors.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, elevation: 2 },
  verifyBtnRevoke: { backgroundColor: Colors.gray100, elevation: 0 },
  verifyBtnText: { fontSize: 10, fontWeight: '900', color: Colors.white, textTransform: 'uppercase', letterSpacing: 1 },
});
