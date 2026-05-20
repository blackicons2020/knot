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

function DataItem({ label, value }: { label: string; value?: string | null }) {
  return (
    <View style={st.dataItem}>
      <Text style={st.dataLabel}>{label}</Text>
      {value ? (
        <Text style={[st.dataValue, { color: Colors.gray200 }]}>{value}</Text>
      ) : (
        <Text style={[st.dataValue, { color: Colors.gray600, fontStyle: 'italic' }]}>Not specified</Text>
      )}
    </View>
  );
}

function Chip({ text, variant }: { text: string; variant: 'neutral' | 'brand' }) {
  const bg = variant === 'brand' ? 'rgba(212,175,55,0.1)' : Colors.gray800;
  const fg = variant === 'brand' ? Colors.accent : Colors.gray300;
  const borderColor = variant === 'brand' ? 'rgba(212,175,55,0.3)' : 'transparent';
  return (
    <View style={[st.chip, { backgroundColor: bg, borderColor, borderWidth: variant === 'brand' ? 1 : 0 }]}>
      <Text style={[st.chipText, { color: fg }]}>{text}</Text>
    </View>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={st.sectionHeaderWrap}>
      <Text style={st.sectionHeader}>{title}</Text>
    </View>
  );
}

function Divider() {
  return <View style={st.divider} />;
}

/* ── Main Screen ──────────────────────────────────────────── */

export default function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const { userProfile } = useAuth();
  // We ignore isDarkMode because this screen uses a bespoke dark/gold theme exclusively.

  if (!userProfile) return null;

  const photo = userProfile.profileImageUrls?.[0] || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400';
  const isAdmin = userProfile.id === 'user_0';
  const locationText = userProfile.residenceCity && userProfile.residenceCountry
    ? `${userProfile.residenceCity}, ${userProfile.residenceCountry}`
    : `${userProfile.city || ''}, ${userProfile.country || ''}`.replace(/^, |, $/g, '');

  return (
    <ScrollView
      style={[st.root, { backgroundColor: Colors.dark }]}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <AppHeader />
      {/* ─── Hero image with gradient ─── */}
      <View style={st.heroWrap}>
        <Image source={{ uri: photo }} style={st.heroImage} />
        <LinearGradient
          colors={['transparent', 'rgba(19,22,32,0.4)', Colors.dark]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={st.heroContent}>
          <Text style={st.heroName}>{userProfile.name}, {userProfile.age}</Text>
          <Text style={st.heroLocation}>{locationText.toUpperCase()}</Text>
          {userProfile.isVerified && (
            <View style={st.verifiedRow}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.accent} />
              <Text style={st.verifiedText}>VERIFIED IDENTITY</Text>
            </View>
          )}
          <Text style={st.heroSubtitle}>
            Where true relationship leads to <Text style={{ color: Colors.accent }}>vow</Text>
          </Text>
        </View>
      </View>

      {/* ─── Quick action buttons (overlapping hero) ─── */}
      <View style={st.actionsRow}>
        <TouchableOpacity
          style={st.actionBtnSmall}
          onPress={() => navigation.navigate('ManagePhotos', { user: userProfile })}
        >
          <Ionicons name="camera-outline" size={24} color={Colors.gray400} />
          <Text style={st.actionLabelSmall}>Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={st.actionBtnLarge}
          onPress={() => navigation.navigate('EditProfile', { user: userProfile })}
        >
          <Ionicons name="pencil" size={28} color={Colors.dark} />
          <Text style={st.actionLabelLarge}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[st.actionBtnSmall, userProfile.isVerified && st.actionBtnSmallVerified]}
          onPress={() => navigation.navigate('Verification', { user: userProfile })}
          disabled={userProfile.isVerified}
        >
          {userProfile.isVerified ? (
            <Ionicons name="checkmark-circle" size={24} color={Colors.accent} />
          ) : (
            <Ionicons name="shield-checkmark-outline" size={24} color={Colors.gray400} />
          )}
          <Text style={[st.actionLabelSmall, userProfile.isVerified && { color: Colors.accent }]}>
            {userProfile.isVerified ? 'Verified' : 'Verify ID'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ─── Admin button ─── */}
      {isAdmin && (
        <TouchableOpacity
          style={st.adminBtn}
          onPress={() => navigation.navigate('Admin')}
        >
          <Ionicons name="shield-checkmark" size={22} color={Colors.accent} />
          <Text style={st.adminBtnText}>Registry Command Center</Text>
        </TouchableOpacity>
      )}

      {/* ─── Content ─── */}
      <View style={st.content}>

        {/* ══ IDENTITY & ROOTS ══ */}
        <SectionHeader title="Identity & Roots" />

        <View style={st.row2}>
          <View style={st.col}>
            <DataItem label="Marriage History" value={userProfile.maritalStatus} />
          </View>
          <View style={st.col}>
            <DataItem label="Occupation" value={userProfile.occupation} />
          </View>
        </View>

        {/* Location card */}
        <View style={st.locationCard}>
          <Text style={st.locationLabel}>Current Residence</Text>
          <View style={st.row3}>
            <View style={st.col3}>
              <DataItem label="Country" value={userProfile.residenceCountry} />
            </View>
            <View style={st.col3}>
              <DataItem label="State" value={userProfile.residenceState} />
            </View>
            <View style={st.col3}>
              <DataItem label="City" value={userProfile.residenceCity} />
            </View>
          </View>

          <Divider />

          <Text style={st.locationLabel}>Heritage & Origin</Text>
          <View style={st.row3}>
            <View style={st.col3}>
              <DataItem label="Country" value={userProfile.originCountry} />
            </View>
            <View style={st.col3}>
              <DataItem label="State" value={userProfile.originState} />
            </View>
            <View style={st.col3}>
              <DataItem label="City" value={userProfile.originCity} />
            </View>
          </View>

          <DataItem label="Cultural Identity" value={userProfile.culturalBackground} />
        </View>

        <DataItem label="Registry Bio" value={userProfile.bio} />

        <View style={[st.row2, { marginTop: 8 }]}>
          <View style={st.col}>
            <DataItem label="Nationality" value={userProfile.nationality} />
          </View>
          <View style={st.col}>
            <DataItem label="Languages" value={userProfile.languages?.join(', ')} />
          </View>
        </View>

        <Divider />

        {/* ══ LIFESTYLE & BELIEFS ══ */}
        <SectionHeader title="Lifestyle & Beliefs" />

        <View style={st.row2}>
          <View style={st.col}>
            <DataItem label="Faith/Religion" value={userProfile.religion} />
          </View>
          <View style={st.col}>
            <DataItem label="Smoking" value={userProfile.smoking} />
          </View>
        </View>
        <View style={st.row2}>
          <View style={st.col}>
            <DataItem label="Drinking" value={userProfile.drinking} />
          </View>
          <View style={st.col}>
            <DataItem label="Children" value={userProfile.childrenStatus || 'No kids'} />
          </View>
        </View>

        <View style={st.dataItem}>
          <Text style={st.dataLabel}>Core Life Values</Text>
          <View style={st.chipRow}>
            {(userProfile.personalValues?.length ?? 0) > 0 ? (
              userProfile.personalValues.map(v => <Chip key={v} text={v} variant="neutral" />)
            ) : (
              <Text style={[st.dataValue, { color: Colors.gray600, fontStyle: 'italic' }]}>Not listed</Text>
            )}
          </View>
        </View>

        <Divider />

        {/* ══ MARRIAGE EXPECTATIONS ══ */}
        <SectionHeader title="Marriage Expectations" />

        <View style={st.row2}>
          <View style={st.col}>
            <DataItem label="Vow Timeline" value={userProfile.marriageTimeline} />
          </View>
          <View style={st.col}>
            <DataItem label="Relocation" value={userProfile.willingToRelocate} />
          </View>
        </View>
        <View style={st.row2}>
          <View style={st.col}>
            <DataItem label="Children Intent" value={userProfile.childrenPreference} />
          </View>
          <View style={st.col}>
            <DataItem label="Partner Age" value={
              userProfile.preferredPartnerAgeRange
                ? `${userProfile.preferredPartnerAgeRange[0]} - ${userProfile.preferredPartnerAgeRange[1]} years`
                : undefined
            } />
          </View>
        </View>

        <View style={st.dataItem}>
          <Text style={st.dataLabel}>Ideal Partner Traits</Text>
          <View style={st.chipRow}>
            {(userProfile.idealPartnerTraits?.length ?? 0) > 0 ? (
              userProfile.idealPartnerTraits.map(t => <Chip key={t} text={t} variant="brand" />)
            ) : (
              <Text style={[st.dataValue, { color: Colors.gray600, fontStyle: 'italic' }]}>Not listed</Text>
            )}
          </View>
        </View>

        <DataItem label="Registry Expectations" value={userProfile.marriageExpectations} />

      </View>
    </ScrollView>
  );
}

/* ── Styles ───────────────────────────────────────────────── */

const st = StyleSheet.create({
  root: { flex: 1 },

  /* Hero */
  heroWrap: { height: 380, position: 'relative' },
  heroImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  heroContent: { position: 'absolute', bottom: 60, left: 24, right: 24 },
  heroName: { fontSize: 36, fontWeight: '900', color: Colors.white, letterSpacing: -1, marginBottom: 4 },
  heroLocation: { fontSize: 13, fontWeight: '700', color: Colors.gray300, letterSpacing: 3, marginBottom: 12 },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  verifiedText: { fontSize: 10, fontWeight: '900', color: Colors.accent, letterSpacing: 2 },
  heroSubtitle: { fontSize: 14, fontWeight: '500', color: Colors.gray200, fontStyle: 'italic', letterSpacing: 0.5 },

  /* Action buttons */
  actionsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginTop: -40, marginBottom: 32, paddingHorizontal: 24, zIndex: 20 },
  actionBtnSmall: {
    width: 72, height: 72, borderRadius: 20, alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.darkCard,
    borderWidth: 1, borderColor: Colors.darkBorder,
    elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  actionBtnSmallVerified: {
    backgroundColor: 'rgba(212,175,55,0.1)',
    borderColor: 'rgba(212,175,55,0.3)',
  },
  actionBtnLarge: {
    width: 100, height: 100, borderRadius: 28, alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.accent,
    elevation: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12,
  },
  actionLabelSmall: { fontSize: 9, fontWeight: '900', color: Colors.gray400, textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 6 },
  actionLabelLarge: { fontSize: 11, fontWeight: '900', color: Colors.dark, textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 8 },

  /* Admin */
  adminBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
    marginHorizontal: 24, marginBottom: 24, padding: 18, borderRadius: 28,
    backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.darkBorder,
  },
  adminBtnText: { fontSize: 12, fontWeight: '900', color: Colors.accent, textTransform: 'uppercase', letterSpacing: 2 },

  /* Content area */
  content: { paddingHorizontal: 24 },

  /* Section header */
  sectionHeaderWrap: { paddingTop: 8, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: Colors.darkBorder, marginBottom: 20 },
  sectionHeader: { fontSize: 18, fontWeight: '900', color: Colors.white, letterSpacing: 2, textTransform: 'uppercase' },

  /* Data items */
  dataItem: { marginBottom: 20 },
  dataLabel: { fontSize: 10, fontWeight: '900', color: Colors.gray500, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 },
  dataValue: { fontSize: 15, fontWeight: '500', lineHeight: 22 },

  /* Grid rows */
  row2: { flexDirection: 'row', gap: 24, marginBottom: 4 },
  row3: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  col: { flex: 1 },
  col3: { flex: 1 },

  /* Location card */
  locationCard: { padding: 20, borderRadius: 20, backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.darkBorder, marginBottom: 24 },
  locationLabel: { fontSize: 10, fontWeight: '900', color: Colors.accent, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 },

  /* Chips */
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  chipText: { fontSize: 11, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.5 },

  /* Divider */
  divider: { height: 1, backgroundColor: Colors.darkBorder, marginVertical: 12 },
});
