import React, { useState } from 'react';
import {
  StyleSheet, Text, TouchableOpacity, View, SafeAreaView, ScrollView, Dimensions, Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import Purchases from 'react-native-purchases';

import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import { Colors, Spacing, BorderRadius } from '../theme/colors';
import { RootStackParamList, SubscriptionTier } from '../types';
import { formatTierPrice, getTierPriceUSD } from '../services/currencyService';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type PayRoute = RouteProp<RootStackParamList, 'Payment'>;

const { width } = Dimensions.get('window');

const TIERS = [
  {
    id: SubscriptionTier.Essential,
    title: 'Knot Essential',
    subtitle: 'New users exploring the platform',
    features: [
      '3 AI-Curated Matches / Day',
      'Basic Matchmaking',
      'Basic Messaging',
      'Identity Verification',
      'Basic Compatibility Score',
      'Limited AI Insights',
    ],
    colors: ['#2A2A2A', '#4A4A4A', '#2A2A2A'] as [string, string, string],
  },
  {
    id: SubscriptionTier.Premium,
    title: 'Knot Premium',
    subtitle: 'For Serious Active Users',
    features: [
      '15 AI-Curated Matches / Day',
      'Unlimited Messaging',
      'AI Relationship Coach',
      'Advanced Filters',
      'Detailed Compatibility Breakdowns',
      'AI-Powered Profile Optimization',
    ],
    colors: ['#3A1C71', '#D76D77', '#FFAF7B'] as [string, string, string],
  },
  {
    id: SubscriptionTier.Elite,
    title: 'Knot Elite',
    subtitle: 'The Luxury Tier for Professionals',
    features: [
      '25 Elite-Curated Matches / Day',
      'Elite Verification Badge',
      'Deep Relationship Intelligence',
      'Highest Trust Visibility',
      'Invisible & Incognito Mode',
      'Priority Matchmaking Placement',
    ],
    colors: ['#0F2027', '#203A43', '#2C5364'] as [string, string, string],
  },
  {
    id: SubscriptionTier.Executive,
    title: 'Knot Executive',
    subtitle: 'VIP Concierge Service',
    features: [
      'Unlimited Concierge Matches',
      'Human Matchmaking Assistance',
      'Private Relationship Advisors',
      'White-Glove Onboarding',
      'Psychological Compatibility Reviews',
    ],
    colors: ['#000000', '#434343', '#000000'] as [string, string, string],
  }
];

export default function PaymentScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<PayRoute>();
  const { setUserProfile } = useAuth();
  const { isDarkMode } = useTheme();
  const { addToast } = useToast();
  const user = params.user;

  const [activeTierIdx, setActiveTierIdx] = useState(0);
  const [processing, setProcessing] = useState(false);

  const country = user.residenceCountry || 'Nigeria';
  const activeTier = TIERS[activeTierIdx];
  const monthlyFormatted = formatTierPrice(activeTier.id as any, country);
  const usdVal = getTierPriceUSD(activeTier.id as any, country);

  const handleSubscribe = async () => {
    Alert.alert(
      'Confirm Subscription',
      `Are you sure you want to subscribe to ${activeTier.title} for ${monthlyFormatted}/month?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Subscribe',
          onPress: async () => {
            setProcessing(true);
            try {
              // Initialize RevenueCat here when configured
              // await Purchases.purchasePackage(package);
              
              // MOCK SUCCESS FOR NOW
              setTimeout(() => {
                setUserProfile({
                  ...user,
                  subscriptionTier: activeTier.id,
                  subscriptionAmount: usdVal,
                  subscriptionDate: new Date().toISOString(),
                  isPremium: true,
                });
                addToast(`Welcome to ${activeTier.title}!`, 'success');
                setProcessing(false);
                navigation.goBack();
              }, 1500);

            } catch (error: any) {
              addToast(error.message || 'Payment failed.', 'error');
              setProcessing(false);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={[s.root, { backgroundColor: isDarkMode ? Colors.dark : Colors.gray100 }]}>
      <View style={[s.header, { backgroundColor: isDarkMode ? Colors.darkCard : Colors.white }]}>
        <Text style={[s.headerTitle, { color: isDarkMode ? Colors.white : Colors.dark }]}>Upgrade Registry</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={Colors.gray400} />
        </TouchableOpacity>
      </View>

      <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} onScroll={(e) => {
        const x = e.nativeEvent.contentOffset.x;
        setActiveTierIdx(Math.round(x / width));
      }} scrollEventThrottle={16}>
        {TIERS.map((tier, idx) => (
          <View key={tier.id} style={{ width, padding: Spacing.md }}>
            <LinearGradient
              colors={tier.colors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.premiumCard}
            >
              <View style={s.premiumBadge}>
                <Text style={s.premiumBadgeText}>{tier.id} TIER</Text>
              </View>
              <Text style={s.premiumTitle}>{tier.title}</Text>
              <Text style={s.premiumSub}>{tier.subtitle}</Text>
              
              <View style={s.priceBox}>
                <Text style={s.priceLabel}>Monthly Investment</Text>
                <Text style={s.priceAmount}>{formatTierPrice(tier.id as any, country)}</Text>
                <Text style={s.priceSub}>Billed securely via Apple/Google</Text>
              </View>
            </LinearGradient>

            <View style={[s.benefitsCard, { backgroundColor: isDarkMode ? Colors.darkCard : Colors.white }]}>
              <Text style={s.benefitsTitle}>{tier.id} Features</Text>
              {tier.features.map((f, i) => (
                <View key={i} style={s.benefitRow}>
                  <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                  <Text style={[s.benefitText, { color: isDarkMode ? Colors.gray300 : Colors.gray700 }]}>{f}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={s.indicatorRow}>
        {TIERS.map((_, i) => (
          <View key={i} style={[s.indicator, i === activeTierIdx ? s.indicatorActive : { backgroundColor: isDarkMode ? Colors.gray700 : Colors.gray300 }]} />
        ))}
      </View>

      <View style={[s.footer, { backgroundColor: isDarkMode ? Colors.darkCard : Colors.white }]}>
        <TouchableOpacity style={{ width: '100%' }} onPress={handleSubscribe} disabled={processing}>
          <LinearGradient
            colors={processing ? [Colors.gray200, Colors.gray200] : [Colors.primary, '#8C52FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={s.payBtn}
          >
            {processing ? (
              <Text style={s.payBtnText}>Processing...</Text>
            ) : (
              <>
                <Ionicons name="logo-apple" size={18} color={Colors.white} />
                <Text style={s.payBtnText}>Subscribe to {activeTier.id}</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
        <Text style={s.secureNote}>Secure In-App Purchase</Text>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.gray200 },
  headerTitle: { fontSize: 16, fontWeight: '900', textTransform: 'uppercase', letterSpacing: -0.5 },
  premiumCard: { borderRadius: 32, padding: 32, alignItems: 'center', marginBottom: 16, overflow: 'hidden' },
  premiumBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 4, borderRadius: 20, marginBottom: 16 },
  premiumBadgeText: { fontSize: 10, fontWeight: '900', color: Colors.white, textTransform: 'uppercase', letterSpacing: 2 },
  premiumTitle: { fontSize: 30, fontWeight: '900', color: Colors.white, letterSpacing: -1 },
  premiumSub: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.8)', marginTop: 4, marginBottom: 24, textAlign: 'center' },
  priceBox: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 24, padding: 20, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  priceLabel: { fontSize: 10, fontWeight: '900', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 },
  priceAmount: { fontSize: 36, fontWeight: '900', color: Colors.white },
  priceSub: { fontSize: 9, fontWeight: '600', color: 'rgba(255,255,255,0.5)', marginTop: 4, textTransform: 'uppercase' },
  benefitsCard: { padding: 20, borderRadius: 24, marginBottom: 16, borderWidth: 1, borderColor: Colors.gray200 },
  benefitsTitle: { fontSize: 11, fontWeight: '900', color: Colors.primary, textTransform: 'uppercase', letterSpacing: 2, borderBottomWidth: 1, borderBottomColor: Colors.gray50, paddingBottom: 8, marginBottom: 16 },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  benefitText: { fontSize: 13, fontWeight: '600', flex: 1 },
  indicatorRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 16 },
  indicator: { width: 8, height: 8, borderRadius: 4 },
  indicatorActive: { backgroundColor: Colors.primary, width: 24 },
  footer: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 32, borderTopWidth: 1, borderTopColor: Colors.gray100, alignItems: 'center' },
  payBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, width: '100%', paddingVertical: 18, borderRadius: BorderRadius.lg },
  payBtnText: { color: Colors.white, fontSize: 13, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2 },
  secureNote: { fontSize: 8, fontWeight: '900', color: Colors.gray400, textTransform: 'uppercase', letterSpacing: 3, marginTop: 12 },
});
