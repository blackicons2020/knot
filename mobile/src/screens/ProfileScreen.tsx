import React from 'react';
import {
  Image, ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import AppHeader from '../components/AppHeader';
import { Colors, Spacing, BorderRadius } from '../theme/colors';
import { RootStackParamList } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

/* ── Reusable sub-components ─────────────────────────────── */

function DataItem({ label, value, isDark }: { label: string; value?: string | null; isDark: boolean }) {
  return (
    <View style={st.dataItem}>
      <Text style={st.dataLabel}>{label}</Text>
      {value ? (
        <Text style={[st.dataValue, { color: isDark ? Colors.gray200 : Colors.black }]}>{value}</Text>
      ) : (
        <Text style={[st.dataValue, { color: isDark ? Colors.gray600 : Colors.gray300, fontStyle: 'italic' }]}>Not specified</Text>
      )}
    </View>
  );
}

function Chip({ text, variant, isDark }: { text: string; variant: 'neutral' | 'brand'; isDark: boolean }) {
  const bg = variant === 'brand'
    ? (isDark ? 'rgba(244,196,48,0.1)' : Colors.light)
    : (isDark ? Colors.gray800 : Colors.gray100);
  const fg = variant === 'brand'
    ? (isDark ? Colors.accent : Colors.primary)
    : (isDark ? Colors.gray300 : Colors.gray700);
  const borderColor = variant === 'brand'
    ? (isDark ? 'rgba(244,196,48,0.2)' : 'rgba(74,13,103,0.1)')
    : 'transparent';
  return (
    <View style={[st.chip, { backgroundColor: bg, borderColor, borderWidth: variant === 'brand' ? 1 : 0 }]}>
      <Text style={[st.chipText, { color: fg }]}>{text}</Text>
    </View>
  );
}

function SectionHeader({ title, isDark }: { title: string; isDark: boolean }) {
  return (
    <View style={[st.sectionHeaderWrap, { borderBottomColor: isDark ? Colors.gray800 : Colors.gray100 }]}>
      <Text style={[st.sectionHeader, { color: isDark ? Colors.white : Colors.dark }]}>{title}</Text>
    </View>
  );
}

function Divider({ isDark }: { isDark: boolean }) {
  return <View style={[st.divider, { backgroundColor: isDark ? Colors.gray800 : Colors.gray200 }]} />;
}

/* ── Main Screen ──────────────────────────────────────────── */

export default function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const { userProfile } = useAuth();
  const { isDarkMode } = useTheme();

  if (!userProfile) return null;

  const photo = userProfile.profileImageUrls?.[0] || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400';
  const isAdmin = userProfile.id === 'user_0';
  const locationText = userProfile.residenceCity && userProfile.residenceCountry
    ? `${userProfile.residenceCity}, ${userProfile.residenceCountry}`
    : `${userProfile.city || ''}, ${userProfile.country || ''}`.replace(/^, |, $/g, '');

  return (
    <ScrollView
      style={[st.root, { backgroundColor: isDarkMode ? Colors.dark : Colors.white }]}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <AppHeader />
      {/* ─── Hero image with gradient ─── */}
      <View style={st.heroWrap}>
        <Image source={{ uri: photo }} style={st.heroImage} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.25)', 'rgba(0,0,0,0.8)']}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={st.heroContent}>
          <View style={st.heroNameRow}>
            <Text style={st.heroName}>{userProfile.name}, {userProfile.age}</Text>
            {userProfile.isVerified && (
              <View style={st.verifiedBadge}>
                <Ionicons name="checkmark" size={14} color={Colors.dark} />
              </View>
            )}
          </View>
          <Text style={st.heroLocation}>{locationText.toUpperCase()}</Text>
        </View>
      </View>

      {/* ─── Quick action buttons (overlapping hero) ─── */}
      <View style={st.actionsRow}>
        <TouchableOpacity
          style={[st.actionBtnSmall, {
            backgroundColor: isDarkMode ? Colors.gray800 : Colors.white,
            borderColor: isDarkMode ? Colors.gray700 : Colors.gray100,
          }]}
          onPress={() => navigation.navigate('ManagePhotos', { user: userProfile })}
        >
          <Ionicons name="camera-outline" size={24} color={isDarkMode ? Colors.gray400 : Colors.gray400} />
          <Text style={[st.actionLabelSmall, { color: isDarkMode ? Colors.gray500 : Colors.gray400 }]}>Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[st.actionBtnLarge, { backgroundColor: isDarkMode ? Colors.accent : Colors.primary }]}
          onPress={() => navigation.navigate('EditProfile', { user: userProfile })}
        >
          <Ionicons name="pencil" size={28} color={isDarkMode ? Colors.dark : Colors.white} />
          <Text style={[st.actionLabelLarge, { color: isDarkMode ? Colors.dark : Colors.white }]}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[st.actionBtnSmall, {
            backgroundColor: userProfile.isVerified ? (isDarkMode ? 'rgba(34,197,94,0.1)' : '#F0FFF4') : (isDarkMode ? Colors.gray800 : Colors.white),
            borderColor: userProfile.isVerified ? Colors.success : (isDarkMode ? Colors.gray700 : Colors.gray100),
          }]}
          onPress={() => navigation.navigate('Verification', { user: userProfile })}
          disabled={userProfile.isVerified}
        >
          {userProfile.isVerified ? (
            <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
          ) : (
            <Ionicons name="shield-checkmark-outline" size={24} color={isDarkMode ? Colors.gray500 : Colors.secondary} />
          )}
          <Text style={[st.actionLabelSmall, {
            color: userProfile.isVerified ? Colors.success : Colors.gray400,
          }]}>
            {userProfile.isVerified ? 'Verified' : 'Verify ID'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ─── Admin button ─── */}
      {isAdmin && (
        <TouchableOpacity
          style={[st.adminBtn, { backgroundColor: isDarkMode ? Colors.gray900 : Colors.dark }]}
          onPress={() => navigation.navigate('Admin')}
        >
          <Ionicons name="shield-checkmark" size={22} color={Colors.accent} />
          <Text style={st.adminBtnText}>Registry Command Center</Text>
        </TouchableOpacity>
      )}

      {/* ─── Content ─── */}
      <View style={st.content}>

        {/* ══ IDENTITY & ROOTS ══ */}
        <SectionHeader title="Identity & Roots" isDark={isDarkMode} />

        <View style={st.row2}>
          <View style={st.col}>
            <DataItem label="Marital Status" value={userProfile.maritalStatus} isDark={isDarkMode} />
          </View>
          <View style={st.col}>
            <DataItem label="Occupation" value={userProfile.occupation} isDark={isDarkMode} />
          </View>
        </View>

        {/* Location card */}
        <View style={[st.locationCard, {
          backgroundColor: isDarkMode ? 'rgba(0,0,0,0.25)' : Colors.gray50,
          borderColor: isDarkMode ? Colors.gray800 : Colors.gray100,
        }]}>
          <Text style={[st.locationLabel, { color: isDarkMode ? Colors.accent : Colors.primary }]}>Current Residence</Text>
          <View style={st.row3}>
            <View style={st.col3}>
              <DataItem label="Country" value={userProfile.residenceCountry} isDark={isDarkMode} />
            </View>
            <View style={st.col3}>
              <DataItem label="State" value={userProfile.residenceState} isDark={isDarkMode} />
            </View>
            <View style={st.col3}>
              <DataItem label="City" value={userProfile.residenceCity} isDark={isDarkMode} />
            </View>
          </View>

          <Divider isDark={isDarkMode} />

          <Text style={[st.locationLabel, { color: isDarkMode ? Colors.accent : Colors.primary }]}>Heritage & Origin</Text>
          <View style={st.row3}>
            <View style={st.col3}>
              <DataItem label="Country" value={userProfile.originCountry} isDark={isDarkMode} />
            </View>
            <View style={st.col3}>
              <DataItem label="State" value={userProfile.originState} isDark={isDarkMode} />
            </View>
            <View style={st.col3}>
              <DataItem label="City" value={userProfile.originCity} isDark={isDarkMode} />
            </View>
          </View>

          <DataItem label="Cultural Identity" value={userProfile.culturalBackground} isDark={isDarkMode} />
        </View>

        <DataItem label="Registry Bio" value={userProfile.bio} isDark={isDarkMode} />

        <View style={[st.row2, { marginTop: 8 }]}>
          <View style={st.col}>
            <DataItem label="Nationality" value={userProfile.nationality} isDark={isDarkMode} />
          </View>
          <View style={st.col}>
            <DataItem label="Languages" value={userProfile.languages?.join(', ')} isDark={isDarkMode} />
          </View>
        </View>

        <Divider isDark={isDarkMode} />

        {/* ══ LIFESTYLE & BELIEFS ══ */}
        <SectionHeader title="Lifestyle & Beliefs" isDark={isDarkMode} />

        <View style={st.row2}>
          <View style={st.col}>
            <DataItem label="Faith/Religion" value={userProfile.religion} isDark={isDarkMode} />
          </View>
          <View style={st.col}>
            <DataItem label="Smoking" value={userProfile.smoking} isDark={isDarkMode} />
          </View>
        </View>
        <View style={st.row2}>
          <View style={st.col}>
            <DataItem label="Drinking" value={userProfile.drinking} isDark={isDarkMode} />
          </View>
          <View style={st.col}>
            <DataItem label="Children" value={userProfile.childrenStatus || 'No kids'} isDark={isDarkMode} />
          </View>
        </View>

        <View style={st.dataItem}>
          <Text style={st.dataLabel}>Core Life Values</Text>
          <View style={st.chipRow}>
            {(userProfile.personalValues?.length ?? 0) > 0 ? (
              userProfile.personalValues.map(v => <Chip key={v} text={v} variant="neutral" isDark={isDarkMode} />)
            ) : (
              <Text style={[st.dataValue, { color: Colors.gray300, fontStyle: 'italic' }]}>Not listed</Text>
            )}
          </View>
        </View>

        <Divider isDark={isDarkMode} />

        {/* ══ MARRIAGE EXPECTATIONS ══ */}
        <SectionHeader title="Marriage Expectations" isDark={isDarkMode} />

        <View style={st.row2}>
          <View style={st.col}>
            <DataItem label="Vow Timeline" value={userProfile.marriageTimeline} isDark={isDarkMode} />
          </View>
          <View style={st.col}>
            <DataItem label="Relocation" value={userProfile.willingToRelocate} isDark={isDarkMode} />
          </View>
        </View>
        <View style={st.row2}>
          <View style={st.col}>
            <DataItem label="Children Intent" value={userProfile.childrenPreference} isDark={isDarkMode} />
          </View>
          <View style={st.col}>
            <DataItem label="Partner Age" value={
              userProfile.preferredPartnerAgeRange
                ? `${userProfile.preferredPartnerAgeRange[0]} - ${userProfile.preferredPartnerAgeRange[1]} years`
                : undefined
            } isDark={isDarkMode} />
          </View>
        </View>

        <View style={st.dataItem}>
          <Text style={st.dataLabel}>Ideal Partner Traits</Text>
          <View style={st.chipRow}>
            {(userProfile.idealPartnerTraits?.length ?? 0) > 0 ? (
              userProfile.idealPartnerTraits.map(t => <Chip key={t} text={t} variant="brand" isDark={isDarkMode} />)
            ) : (
              <Text style={[st.dataValue, { color: Colors.gray300, fontStyle: 'italic' }]}>Not listed</Text>
            )}
          </View>
        </View>

        <DataItem label="Registry Expectations" value={userProfile.marriageExpectations} isDark={isDarkMode} />

      </View>
    </ScrollView>
  );
}

/* ── Styles ───────────────────────────────────────────────── */

const st = StyleSheet.create({
  root: { flex: 1 },

  /* Hero */
  heroWrap: { height: 280, position: 'relative' },
  heroImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  heroContent: { position: 'absolute', bottom: 48, left: 24, right: 24 },
  heroNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  heroName: { fontSize: 32, fontWeight: '900', color: Colors.white, letterSpacing: -1 },
  verifiedBadge: { backgroundColor: Colors.accent, borderRadius: 14, padding: 4, elevation: 4 },
  heroLocation: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.8)', letterSpacing: 2, marginTop: 4 },

  /* Action buttons */
  actionsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginTop: -36, marginBottom: 24, paddingHorizontal: 24, zIndex: 20 },
  actionBtnSmall: {
    width: 80, height: 80, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
    elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8,
    borderWidth: 1,
  },
  actionBtnLarge: {
    width: 112, height: 112, borderRadius: 28, alignItems: 'center', justifyContent: 'center',
    elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12,
    transform: [{ scale: 1.05 }],
  },
  actionLabelSmall: { fontSize: 8, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 4 },
  actionLabelLarge: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 4 },

  /* Admin */
  adminBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
    marginHorizontal: 24, marginBottom: 24, padding: 18, borderRadius: 28,
    elevation: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  adminBtnText: { fontSize: 12, fontWeight: '900', color: Colors.accent, textTransform: 'uppercase', letterSpacing: 2 },

  /* Content area */
  content: { paddingHorizontal: 24 },

  /* Section header */
  sectionHeaderWrap: { paddingTop: 8, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: Colors.gray100, marginBottom: 16 },
  sectionHeader: { fontSize: 18, fontWeight: '900', color: Colors.dark, letterSpacing: -0.5, textTransform: 'uppercase' },

  /* Data items */
  dataItem: { marginBottom: 16 },
  dataLabel: { fontSize: 10, fontWeight: '900', color: Colors.gray400, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 },
  dataValue: { fontSize: 14, fontWeight: '500', lineHeight: 22 },

  /* Grid rows */
  row2: { flexDirection: 'row', gap: 24, marginBottom: 16 },
  row3: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  col: { flex: 1 },
  col3: { flex: 1 },

  /* Location card */
  locationCard: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 16 },
  locationLabel: { fontSize: 9, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 },

  /* Chips */
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  chipText: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.5 },

  /* Divider */
  divider: { height: 1, marginVertical: 8 },
});
