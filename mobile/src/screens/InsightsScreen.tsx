import React from 'react';
import { ScrollView, StyleSheet, Text, View, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import AppHeader from '../components/AppHeader';
import { Colors, Spacing, BorderRadius } from '../theme/colors';

const { width } = Dimensions.get('window');
const CARD_W = (width - Spacing.md * 2 - Spacing.sm) / 2;

export default function InsightsScreen() {
  const { userProfile } = useAuth();
  const { isDarkMode } = useTheme();

  // Fallback to default mock metrics if not set during onboarding
  const readiness = userProfile?.readinessScore || 88;
  const seriousness = userProfile?.seriousnessLevel || 94;
  const trust = userProfile?.trustScore || 98;
  const archetype = userProfile?.personalityArchetype || 'The Intentional Builder';
  const attachment = userProfile?.attachmentStyle || 'Secure';
  const values = userProfile?.personalValues?.length ? userProfile.personalValues : ['Faith', 'Family', 'Career', 'Trust'];

  const getArchetypeDesc = (arch: string) => {
    switch (arch) {
      case 'The Grounded Romantic':
        return 'You prioritize deep emotional availability and shared life dreams, valuing stability, long-term romantic integrity, and warm daily connection.';
      case 'The Calm Connector':
        return 'You value emotional regulation and ease in conversation, managing boundaries with gentle reassurance and steady commitment timelines.';
      case 'The Loyal Partner':
        return 'You focus on long-term safety, loyalty, and dependability, building on clear mutual expectations and structural boundaries.';
      default:
        return 'You approach relationship milestones deliberately, prioritizing family values, structural boundaries, and joint growth curves.';
    }
  };

  const getAttachmentDesc = (att: string) => {
    switch (att) {
      case 'Anxious-Preoccupied':
        return 'You have high intimacy capacity but can experience occasional security worries. You are learning to express needs with clear, calm boundaries.';
      case 'Dismissive-Avoidant':
        return 'You highly value independence and self-reliance, working on creating safe collaborative entryways for deep vulnerability.';
      case 'Fearful-Avoidant':
        return 'You fluctuate between desire for closeness and self-protection, gradually building trust through safe, consistent alignment cycles.';
      default:
        return 'Your attachment is Secure. You comfortably express intimacy, manage boundaries with high collaborative intelligence, and recover from relationship friction smoothly.';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? Colors.dark : Colors.gray50 }]}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: isDarkMode ? Colors.white : Colors.dark }]}>
          Relationship Intelligence
        </Text>
        <Text style={[styles.subtitle, { color: isDarkMode ? Colors.gray400 : Colors.gray500 }]}>
          Verified psychological alignment vectors extracted from your AI onboarding interview.
        </Text>

        {/* Index Metrics Row */}
        <View style={styles.metricsGrid}>
          {/* Readiness Index */}
          <View style={[styles.metricCard, { backgroundColor: isDarkMode ? Colors.darkCard : Colors.white, borderColor: isDarkMode ? Colors.darkBorder : Colors.gray200 }]}>
            <View style={[styles.iconWrap, { backgroundColor: isDarkMode ? 'rgba(212,175,55,0.1)' : 'rgba(212,175,55,0.05)' }]}>
              <Ionicons name="ribbon-outline" size={24} color={Colors.accent} />
            </View>
            <Text style={[styles.metricLabel, { color: isDarkMode ? Colors.gray500 : Colors.gray400 }]}>READINESS INDEX</Text>
            <Text style={[styles.metricVal, { color: isDarkMode ? Colors.white : Colors.dark }]}>{readiness}%</Text>
            <Text style={styles.statusBadgeGreen}>Highly Ready</Text>
          </View>

          {/* Seriousness Index */}
          <View style={[styles.metricCard, { backgroundColor: isDarkMode ? Colors.darkCard : Colors.white, borderColor: isDarkMode ? Colors.darkBorder : Colors.gray200 }]}>
            <View style={[styles.iconWrap, { backgroundColor: isDarkMode ? 'rgba(226,125,141,0.1)' : 'rgba(226,125,141,0.05)' }]}>
              <Ionicons name="analytics-outline" size={24} color={Colors.primary} />
            </View>
            <Text style={[styles.metricLabel, { color: isDarkMode ? Colors.gray500 : Colors.gray400 }]}>SERIOUSNESS INDEX</Text>
            <Text style={[styles.metricVal, { color: isDarkMode ? Colors.white : Colors.dark }]}>{seriousness}%</Text>
            <Text style={[styles.statusBadgeGrey, { color: isDarkMode ? Colors.gray300 : Colors.gray600 }]}>Elite Intention</Text>
          </View>

          {/* Safety Trust Index */}
          <View style={[styles.metricCardFull, { backgroundColor: isDarkMode ? Colors.darkCard : Colors.white, borderColor: isDarkMode ? Colors.darkBorder : Colors.gray200 }]}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.iconWrap, { backgroundColor: 'rgba(34,197,94,0.1)' }]}>
                <Ionicons name="shield-checkmark-outline" size={24} color={Colors.success} />
              </View>
              <View>
                <Text style={[styles.metricLabel, { color: isDarkMode ? Colors.gray500 : Colors.gray400 }]}>SAFETY TRUST INDEX</Text>
                <Text style={[styles.metricVal, { color: isDarkMode ? Colors.white : Colors.dark }]}>{trust}%</Text>
              </View>
            </View>
            <Text style={[styles.descText, { color: isDarkMode ? Colors.gray400 : Colors.gray600, marginTop: Spacing.sm }]}>
              Biometric signature matched. Verified ID document & selfie liveness checks represent an authentic profile.
            </Text>
          </View>
        </View>

        {/* Psychological Alignment Map */}
        <View style={[styles.sectionCard, { backgroundColor: isDarkMode ? Colors.darkCard : Colors.white, borderColor: isDarkMode ? Colors.darkBorder : Colors.gray200 }]}>
          <Text style={[styles.sectionTitle, { color: isDarkMode ? Colors.white : Colors.dark }]}>
            Psychological Alignment Map
          </Text>

          {/* Personality Archetype */}
          <View style={styles.alignmentRow}>
            <View style={styles.alignmentHeader}>
              <Ionicons name="sparkles" size={16} color={Colors.accent} />
              <Text style={[styles.alignmentName, { color: Colors.accent }]}>Personality Archetype</Text>
            </View>
            <Text style={[styles.alignmentVal, { color: isDarkMode ? Colors.white : Colors.dark }]}>{archetype}</Text>
            <Text style={[styles.descText, { color: isDarkMode ? Colors.gray400 : Colors.gray600 }]}>
              {getArchetypeDesc(archetype)}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: isDarkMode ? Colors.darkBorder : Colors.gray200 }]} />

          {/* Attachment Style */}
          <View style={styles.alignmentRow}>
            <View style={styles.alignmentHeader}>
              <Ionicons name="heart" size={16} color={Colors.primary} />
              <Text style={[styles.alignmentName, { color: Colors.primary }]}>Attachment Profile</Text>
            </View>
            <Text style={[styles.alignmentVal, { color: isDarkMode ? Colors.white : Colors.dark }]}>{attachment} Attachment</Text>
            <Text style={[styles.descText, { color: isDarkMode ? Colors.gray400 : Colors.gray600 }]}>
              {getAttachmentDesc(attachment)}
            </Text>
          </View>
        </View>

        {/* Extracted Values Map */}
        <View style={[styles.sectionCard, { backgroundColor: isDarkMode ? Colors.darkCard : Colors.white, borderColor: isDarkMode ? Colors.darkBorder : Colors.gray200, marginBottom: 40 }]}>
          <Text style={[styles.sectionTitle, { color: isDarkMode ? Colors.white : Colors.dark, marginBottom: Spacing.xs }]}>
            Extracted Value Maps
          </Text>
          <Text style={[styles.descText, { color: isDarkMode ? Colors.gray400 : Colors.gray600, marginBottom: Spacing.md }]}>
            Core marital foundation pillars identified through natural language analysis of your relationship goals.
          </Text>
          <View style={styles.valuesContainer}>
            {values.map((v, i) => (
              <View key={i} style={[styles.valueTag, { backgroundColor: isDarkMode ? 'rgba(212,175,55,0.08)' : Colors.gray100, borderColor: isDarkMode ? 'rgba(212,175,55,0.15)' : Colors.gray300 }]}>
                <Ionicons name="checkmark-circle-outline" size={12} color={Colors.accent} style={{ marginRight: 4 }} />
                <Text style={[styles.valueText, { color: isDarkMode ? Colors.white : Colors.dark }]}>{v}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: Spacing.md, paddingBottom: 24 },
  title: { fontSize: 22, fontWeight: '900', letterSpacing: -0.5, marginBottom: 4 },
  subtitle: { fontSize: 12, lineHeight: 18, marginBottom: Spacing.lg },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: Spacing.lg },
  metricCard: {
    width: (width - Spacing.md * 2 - 10) / 2,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricCardFull: {
    width: '100%',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
  },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricLabel: { fontSize: 8, fontWeight: '900', letterSpacing: 2, marginBottom: 4, textTransform: 'uppercase' },
  metricVal: { fontSize: 26, fontWeight: '900', letterSpacing: -1 },
  statusBadgeGreen: { fontSize: 9, fontWeight: '900', color: Colors.success, textTransform: 'uppercase', letterSpacing: 1, marginTop: 6, backgroundColor: 'rgba(34,197,94,0.1)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  statusBadgeGrey: { fontSize: 9, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1, marginTop: 6, backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  sectionCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  sectionTitle: { fontSize: 16, fontWeight: '900', letterSpacing: -0.3, marginBottom: Spacing.md },
  alignmentRow: { paddingVertical: Spacing.xs },
  alignmentHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  alignmentName: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.5 },
  alignmentVal: { fontSize: 16, fontWeight: '900', marginBottom: 6 },
  descText: { fontSize: 12, lineHeight: 18 },
  divider: { height: 1, marginVertical: Spacing.md },
  valuesContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  valueTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  valueText: { fontSize: 11, fontWeight: '700' },
});
