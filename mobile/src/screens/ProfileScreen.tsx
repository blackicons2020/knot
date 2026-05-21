import React from 'react';
import {
  Image, ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../contexts/AuthContext';
import AppHeader from '../components/AppHeader';
import { Colors } from '../theme/colors';
import { RootStackParamList } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

/* ── Reusable sub-components ─────────────────────────────── */

function DataItem({ label, value, isBold, hideValue }: { label: string; value?: string | null; isBold?: boolean; hideValue?: boolean }) {
  return (
    <View style={st.dataItem}>
      <Text style={st.dataLabel}>{label}</Text>
      {!hideValue && (
        value ? (
          <Text style={[st.dataValue, isBold && { fontWeight: 'bold' }]}>{value}</Text>
        ) : (
          <Text style={[st.dataValue, { color: Colors.gray600, fontStyle: 'italic' }]}>Not specified</Text>
        )
      )}
    </View>
  );
}

function Chip({ text, variant }: { text: string; variant: 'neutral' | 'brand' | 'glass' }) {
  let bg = 'rgba(255,255,255,0.05)';
  let fg = Colors.gray300;
  let borderColor = 'rgba(255,255,255,0.05)';

  if (variant === 'brand') {
    bg = 'rgba(212,175,55,0.1)';
    fg = Colors.accent;
    borderColor = 'rgba(212,175,55,0.3)';
  } else if (variant === 'neutral') {
    bg = 'rgba(45,27,78,0.3)'; // purple glass
    fg = Colors.accent;
    borderColor = 'rgba(212,175,55,0.2)';
  }

  return (
    <View style={[st.chip, { backgroundColor: bg, borderColor, borderWidth: 1 }]}>
      <Text style={[st.chipText, { color: fg }]}>{text}</Text>
    </View>
  );
}

function SectionHeader({ title, hideBorder }: { title: string; hideBorder?: boolean }) {
  return (
    <View style={[st.sectionHeaderWrap, !hideBorder && { borderBottomWidth: 1 }]}>
      <Text style={st.sectionHeader}>{title}</Text>
    </View>
  );
}

function GlassCard({ children, style }: { children: React.ReactNode; style?: any }) {
  return (
    <View style={[st.glassCard, style]}>
      {children}
    </View>
  );
}

/* ── Main Screen ──────────────────────────────────────────── */

export default function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const { userProfile } = useAuth();

  if (!userProfile) return null;

  const photo = userProfile.profileImageUrls?.[0] || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400';
  const isAdmin = userProfile.id === 'user_0';
  const locationText = userProfile.residenceCity && userProfile.residenceCountry
    ? `${userProfile.residenceCity}, ${userProfile.residenceCountry}`
    : `${userProfile.city || ''}, ${userProfile.country || ''}`.replace(/^, |, $/g, '');

  return (
    <View style={st.root}>
      <AppHeader />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View style={st.content}>
        
        {/* ─── 1. Header Cards ─── */}
        <View style={st.headerGrid}>
          {/* User Info Card */}
          <GlassCard style={st.userInfoCard}>
            <View style={st.userRow}>
              <View style={st.avatarContainer}>
                <Image source={{ uri: photo }} style={st.avatar} />
                <TouchableOpacity style={st.avatarOverlay} onPress={() => navigation.navigate('ManagePhotos', { user: userProfile })}>
                  <Ionicons name="camera" size={16} color={Colors.white} />
                  <Text style={st.avatarOverlayText}>UPDATE</Text>
                </TouchableOpacity>
              </View>
              <View style={st.userInfoText}>
                <Text style={st.userName}>{userProfile.name}, {userProfile.age}</Text>
                <Text style={st.userLocation}>{userProfile.occupation} • {locationText}</Text>
                {userProfile.isVerified && (
                  <View style={st.verifiedBadge}>
                    <Text style={st.verifiedBadgeText}>Verified Registry Member</Text>
                  </View>
                )}
              </View>
            </View>
            <TouchableOpacity style={st.editBtn} onPress={() => navigation.navigate('EditProfile', { user: userProfile })}>
              <Ionicons name="settings-outline" size={14} color={Colors.gray300} />
              <Text style={st.editBtnText}>Edit Profile Data</Text>
            </TouchableOpacity>
          </GlassCard>

          {/* Identity Verification Card */}
          <GlassCard style={st.verificationCard}>
            <Text style={st.verifTitle}>Identity Verification</Text>
            <View style={st.verifRow}>
              <Text style={st.verifLabel}>Government ID Scan</Text>
              <Text style={st.verifStatus}>Approved</Text>
            </View>
            <View style={st.verifRow}>
              <Text style={st.verifLabel}>Liveness Selfie Match</Text>
              <Text style={st.verifStatus}>Approved</Text>
            </View>
            <View style={st.verifCompleteBadge}>
              <Text style={st.verifCompleteText}>Identity Verified</Text>
            </View>
          </GlassCard>
        </View>

        {/* ─── 2. My Photos ─── */}
        <View style={st.sectionBlock}>
          <View style={st.photosHeader}>
            <Text style={st.sectionHeader}>My Photos</Text>
            <Text style={st.photosCount}>{userProfile.profileImageUrls?.length || 0} / 6 Uploaded</Text>
          </View>
          <View style={st.photosGrid}>
            {userProfile.profileImageUrls?.map((url, idx) => (
              <View key={idx} style={st.photoWrapper}>
                <Image source={{ uri: url }} style={st.photoImage} />
                {idx === 0 && (
                  <View style={st.primaryBadge}>
                    <Text style={st.primaryBadgeText}>Primary</Text>
                  </View>
                )}
              </View>
            ))}
            {(userProfile.profileImageUrls?.length || 0) < 6 && (
              <TouchableOpacity 
                style={st.addPhotoBtn} 
                onPress={() => navigation.navigate('ManagePhotos', { user: userProfile })}
              >
                <Ionicons name="camera-outline" size={24} color={Colors.gray400} />
                <Text style={st.addPhotoText}>Add Photo</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ─── 3. Profile Detail Section ─── */}
        
        {/* Psychological Profile */}
        {(userProfile.personalityArchetype || userProfile.attachmentStyle) && (
          <View style={st.sectionBlock}>
            <SectionHeader title="Psychological Profile" hideBorder />
            <View style={st.chipRow}>
              {userProfile.personalityArchetype && <Chip text={`✔ ${userProfile.personalityArchetype}`} variant="brand" />}
              {userProfile.attachmentStyle && <Chip text={`✔ ${userProfile.attachmentStyle}`} variant="neutral" />}
            </View>
          </View>
        )}

        {/* Bio */}
        {userProfile.bio && (
          <View style={st.sectionBlock}>
            <SectionHeader title="Bio & Intentions" hideBorder />
            <Text style={st.bioText}>{userProfile.bio}</Text>
          </View>
        )}

        {/* Identity & Roots */}
        <View style={st.sectionBlock}>
          <SectionHeader title="Identity & Roots" />
          
          <View style={st.grid2}>
            <GlassCard style={st.gridItem}><DataItem label="Marriage History" value={userProfile.maritalStatus} isBold /></GlassCard>
            <GlassCard style={st.gridItem}><DataItem label="Occupation" value={userProfile.occupation} isBold /></GlassCard>
          </View>

          <GlassCard style={[st.gridItemFull, { marginBottom: 16 }]}>
            <Text style={st.cardSectionTitle}>Current Residence</Text>
            <View style={st.grid3}>
              <View style={st.col3}><DataItem label="Country" value={userProfile.residenceCountry} isBold /></View>
              <View style={st.col3}><DataItem label="State" value={userProfile.residenceState} isBold /></View>
              <View style={st.col3}><DataItem label="City" value={userProfile.residenceCity} isBold /></View>
            </View>
            
            <View style={st.divider} />
            
            <Text style={st.cardSectionTitle}>Heritage & Origin</Text>
            <View style={st.grid3}>
              <View style={st.col3}><DataItem label="Country" value={userProfile.originCountry} isBold /></View>
              <View style={st.col3}><DataItem label="State" value={userProfile.originState} isBold /></View>
              <View style={st.col3}><DataItem label="City" value={userProfile.originCity} isBold /></View>
            </View>
            <View style={{ marginTop: 12 }}>
              <DataItem label="Cultural Identity" value={userProfile.culturalBackground} isBold />
            </View>
          </GlassCard>

          <View style={st.grid2}>
            <GlassCard style={st.gridItem}><DataItem label="Nationality" value={userProfile.nationality} isBold /></GlassCard>
            <GlassCard style={st.gridItem}><DataItem label="Languages Spoken" value={userProfile.languagesSpoken?.join(', ')} isBold /></GlassCard>
          </View>
        </View>

        {/* Lifestyle & Beliefs */}
        <View style={st.sectionBlock}>
          <SectionHeader title="Lifestyle & Beliefs" />
          
          <View style={st.grid2}>
            <GlassCard style={st.gridItem}><DataItem label="Faith/Religion" value={userProfile.religion} isBold /></GlassCard>
            <GlassCard style={st.gridItem}><DataItem label="Smoking" value={userProfile.smoking} isBold /></GlassCard>
            <GlassCard style={st.gridItem}><DataItem label="Drinking" value={userProfile.drinking} isBold /></GlassCard>
            <GlassCard style={st.gridItem}><DataItem label="Children" value={userProfile.childrenStatus || 'No kids'} isBold /></GlassCard>
          </View>
          
          <GlassCard style={st.gridItemFull}>
            <Text style={st.dataLabel}>Core Life Values</Text>
            <View style={st.chipRow}>
              {(userProfile.personalValues?.length ?? 0) > 0 ? (
                userProfile.personalValues.map(v => <Chip key={v} text={v} variant="glass" />)
              ) : (
                <Text style={[st.dataValue, { color: Colors.gray600, fontStyle: 'italic' }]}>Not listed</Text>
              )}
            </View>
          </GlassCard>
        </View>

        {/* Marriage Expectations */}
        <View style={st.sectionBlock}>
          <SectionHeader title="Marriage Expectations" />
          
          <View style={st.grid2}>
            <GlassCard style={st.gridItem}><DataItem label="Vow Timeline" value={userProfile.marriageTimeline} isBold /></GlassCard>
            <GlassCard style={st.gridItem}><DataItem label="Relocation" value={userProfile.willingToRelocate} isBold /></GlassCard>
            <GlassCard style={st.gridItem}><DataItem label="Children Intent" value={userProfile.childrenPreference} isBold /></GlassCard>
            <GlassCard style={st.gridItem}>
              <DataItem label="Partner Age" value={
                userProfile.preferredPartnerAgeRange
                  ? `${userProfile.preferredPartnerAgeRange[0]} - ${userProfile.preferredPartnerAgeRange[1]} years`
                  : undefined
              } isBold />
            </GlassCard>
          </View>

          <GlassCard style={[st.gridItemFull, { marginBottom: 16 }]}>
            <Text style={st.dataLabel}>Ideal Partner Traits</Text>
            <View style={st.chipRow}>
              {(userProfile.idealPartnerTraits?.length ?? 0) > 0 ? (
                userProfile.idealPartnerTraits.map(t => <Chip key={t} text={t} variant="brand" />)
              ) : (
                <Text style={[st.dataValue, { color: Colors.gray600, fontStyle: 'italic' }]}>Not listed</Text>
              )}
            </View>
          </GlassCard>

          <GlassCard style={[st.gridItemFull, { marginBottom: 16 }]}>
            <DataItem label="Registry Expectations" value={userProfile.marriageExpectations} />
          </GlassCard>

          <View style={st.grid2}>
            <GlassCard style={st.gridItem}>
              <DataItem label="Readiness" hideValue />
              <Text style={st.scoreTextGreen}>{userProfile.readinessScore ? `${userProfile.readinessScore}% (Elite)` : 'Not calculated'}</Text>
            </GlassCard>
            <GlassCard style={st.gridItem}>
              <DataItem label="Trust Score" hideValue />
              <Text style={st.scoreTextGreen}>{userProfile.trustScore ? `${userProfile.trustScore}% (Verified)` : 'Not calculated'}</Text>
            </GlassCard>
          </View>
        </View>

        </View>
      </ScrollView>
    </View>
  );
}

/* ── Styles ───────────────────────────────────────────────── */

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0A0E14' },
  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  
  /* Glass Card Base */
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
  },

  /* Headers */
  headerGrid: { gap: 16, marginBottom: 24, paddingBottom: 24, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.05)' },
  userInfoCard: { gap: 16, justifyContent: 'center' },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatarContainer: { width: 72, height: 72, borderRadius: 36, overflow: 'hidden', position: 'relative' },
  avatar: { width: '100%', height: '100%' },
  avatarOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', paddingVertical: 4 },
  avatarOverlayText: { fontSize: 8, fontWeight: 'bold', color: Colors.white, marginTop: 1 },
  userInfoText: { flex: 1 },
  userName: { fontSize: 18, fontWeight: 'bold', color: Colors.white },
  userLocation: { fontSize: 11, color: Colors.gray400, marginTop: 4 },
  verifiedBadge: { marginTop: 8, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: 'rgba(16, 185, 129, 0.25)', alignSelf: 'flex-start', borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.3)' },
  verifiedBadgeText: { fontSize: 8, fontWeight: '900', color: '#10B981', textTransform: 'uppercase', letterSpacing: 1 },
  editBtn: { width: '100%', paddingVertical: 10, borderRadius: 12, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  editBtnText: { fontSize: 11, fontWeight: 'bold', color: Colors.gray300 },

  verificationCard: { gap: 12, justifyContent: 'center' },
  verifTitle: { fontSize: 11, color: Colors.gray400, textTransform: 'uppercase', letterSpacing: 2, fontWeight: '900', marginBottom: 4 },
  verifRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  verifLabel: { fontSize: 11, color: Colors.gray300 },
  verifStatus: { fontSize: 11, color: '#10B981', fontWeight: 'bold' },
  verifCompleteBadge: { marginTop: 8, paddingVertical: 8, borderRadius: 12, backgroundColor: 'rgba(16, 185, 129, 0.1)', borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.2)', alignItems: 'center' },
  verifCompleteText: { fontSize: 9, fontWeight: '900', color: '#10B981', textTransform: 'uppercase', letterSpacing: 1 },

  /* Sections */
  sectionBlock: { marginBottom: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.05)' },
  sectionHeaderWrap: { paddingBottom: 12, borderBottomColor: 'rgba(255, 255, 255, 0.05)', marginBottom: 16 },
  sectionHeader: { fontSize: 11, color: Colors.gray400, textTransform: 'uppercase', letterSpacing: 2, fontWeight: '900' },
  cardSectionTitle: { fontSize: 9, color: Colors.accent, textTransform: 'uppercase', letterSpacing: 2, fontWeight: '900', marginBottom: 12 },

  /* Photos */
  photosHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  photosCount: { fontSize: 9, color: Colors.gray500, fontWeight: 'bold' },
  photosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  photoWrapper: { width: '30%', aspectRatio: 1, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
  photoImage: { width: '100%', height: '100%' },
  primaryBadge: { position: 'absolute', top: 6, left: 6, backgroundColor: Colors.accent, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  primaryBadgeText: { fontSize: 7, fontWeight: '900', textTransform: 'uppercase', color: Colors.dark },
  addPhotoBtn: { width: '30%', aspectRatio: 1, borderRadius: 16, borderWidth: 2, borderStyle: 'dashed', borderColor: 'rgba(255, 255, 255, 0.2)', alignItems: 'center', justifyContent: 'center', gap: 4 },
  addPhotoText: { fontSize: 8, fontWeight: '900', color: Colors.gray400, textTransform: 'uppercase', letterSpacing: 1 },

  /* Data Layout */
  bioText: { fontSize: 13, color: Colors.gray300, lineHeight: 22 },
  grid2: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 12 },
  gridItem: { width: '48%', marginBottom: 4 },
  gridItemFull: { width: '100%', marginBottom: 4 },
  grid3: { flexDirection: 'row', gap: 8 },
  col3: { flex: 1 },
  
  dataItem: { marginBottom: 0 },
  dataLabel: { fontSize: 8, fontWeight: '900', color: Colors.gray500, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 },
  dataValue: { fontSize: 13, color: Colors.white },
  scoreTextGreen: { fontSize: 13, fontWeight: 'bold', color: '#10B981', marginTop: 4 },

  /* Chips */
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  chipText: { fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },

  /* Divider */
  divider: { height: 1, backgroundColor: 'rgba(255, 255, 255, 0.05)', marginVertical: 16 },
});
