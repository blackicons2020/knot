import React, { useState } from 'react';
import {
  StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import { Colors, Spacing, BorderRadius } from '../theme/colors';
import { RootStackParamList } from '../types';
import { formatLocalPrice, getCurrencyForCountry, getPaystackCurrency } from '../services/currencyService';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type PayRoute = RouteProp<RootStackParamList, 'Payment'>;

const MONTHLY_RATE_USD = 19.99;

export default function PaymentScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<PayRoute>();
  const { setUserProfile } = useAuth();
  const { isDarkMode } = useTheme();
  const { addToast } = useToast();
  const user = params.user;

  const [months, setMonths] = useState(1);
  const [processing, setProcessing] = useState(false);

  const country = user.residenceCountry || 'Nigeria';
  const totalUsd = MONTHLY_RATE_USD * months;
  const monthlyFormatted = formatLocalPrice(MONTHLY_RATE_USD, country);
  const totalFormatted = formatLocalPrice(totalUsd, country);

  const inc = () => setMonths((p) => Math.min(p + 1, 24));
  const dec = () => setMonths((p) => Math.max(p - 1, 1));

  const handlePayment = () => {
    // In a real app this would use a native Paystack SDK
    setProcessing(true);
    setTimeout(() => {
      setUserProfile({ ...user, isPremium: true, subscriptionAmount: totalUsd, subscriptionDate: new Date().toISOString() });
      addToast('Registry Activated! Welcome to Premium.', 'success');
      setProcessing(false);
      navigation.goBack();
    }, 2000);
  };

  return (
    <View style={[s.root, { backgroundColor: isDarkMode ? Colors.dark : Colors.gray100 }]}>
      {/* Header */}
      <View style={[s.header, { backgroundColor: isDarkMode ? Colors.darkCard : Colors.white }]}>
        <Text style={[s.headerTitle, { color: isDarkMode ? Colors.white : Colors.dark }]}>Vow Registry Premium</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={Colors.gray400} />
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1, padding: Spacing.md }}>
        {/* Main premium card */}
        <View style={s.premiumCard}>
          <View style={s.premiumBadge}>
            <Text style={s.premiumBadgeText}>Localized Registry</Text>
          </View>
          <Text style={s.premiumTitle}>Knot Premium</Text>
          <Text style={s.premiumSub}>Access the Global Directory</Text>

          {/* Month selector */}
          <View style={s.selectorBox}>
            <Text style={s.selectorLabel}>Select Commitment Duration</Text>
            <View style={s.selectorRow}>
              <TouchableOpacity style={s.selectorBtn} onPress={dec}>
                <Text style={s.selectorBtnText}>−</Text>
              </TouchableOpacity>
              <View style={s.selectorCenter}>
                <Text style={s.selectorNum}>{months}</Text>
                <Text style={s.selectorUnit}>{months === 1 ? 'Month' : 'Months'}</Text>
              </View>
              <TouchableOpacity style={s.selectorBtn} onPress={inc}>
                <Ionicons name="add" size={24} color={Colors.white} />
              </TouchableOpacity>
            </View>
            <View style={s.selectorDivider} />
            <Text style={s.totalLabel}>Total Registry Fee</Text>
            <Text style={s.totalAmount}>{totalFormatted}</Text>
            <Text style={s.rateNote}>Local Rate: {monthlyFormatted}/mo</Text>
          </View>
        </View>

        {/* Benefits */}
        <View style={[s.benefitsCard, { backgroundColor: isDarkMode ? Colors.darkCard : Colors.white }]}>
          <Text style={s.benefitsTitle}>Exclusive Registry Access</Text>
          {['See who favorited your registry entry', 'Unlimited global directory communication', 'Priority verification badge', 'Advanced value-based filtering'].map((b, i) => (
            <View key={i} style={s.benefitRow}>
              <View style={s.benefitCheck}>
                <Text style={s.benefitCheckText}>✓</Text>
              </View>
              <Text style={[s.benefitText, { color: isDarkMode ? Colors.gray300 : Colors.gray700 }]}>{b}</Text>
            </View>
          ))}
        </View>

        <View style={s.footnoteBox}>
          <Text style={s.footnoteText}>Localized for {country}{'\n'}Payments secured via Paystack network</Text>
        </View>
      </View>

      {/* Bottom action */}
      <View style={[s.footer, { backgroundColor: isDarkMode ? Colors.darkCard : Colors.white }]}>
        <TouchableOpacity style={[s.payBtn, processing && { opacity: 0.6 }]} onPress={handlePayment} disabled={processing}>
          {processing ? (
            <Text style={s.payBtnText}>Verifying...</Text>
          ) : (
            <>
              <Ionicons name="lock-closed" size={18} color={Colors.accent} />
              <Text style={s.payBtnText}>Upgrade for {totalFormatted}</Text>
            </>
          )}
        </TouchableOpacity>
        <Text style={s.secureNote}>Secure Checkout</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.gray200 },
  headerTitle: { fontSize: 16, fontWeight: '900', textTransform: 'uppercase', letterSpacing: -0.5 },
  premiumCard: { backgroundColor: Colors.primary, borderRadius: 32, padding: 32, alignItems: 'center', marginBottom: 16, overflow: 'hidden' },
  premiumBadge: { backgroundColor: Colors.accent, paddingHorizontal: 16, paddingVertical: 4, borderRadius: 20, marginBottom: 16 },
  premiumBadgeText: { fontSize: 10, fontWeight: '900', color: Colors.dark, textTransform: 'uppercase', letterSpacing: 2 },
  premiumTitle: { fontSize: 30, fontWeight: '900', color: Colors.white, letterSpacing: -1 },
  premiumSub: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 3, marginTop: 4, marginBottom: 24 },
  selectorBox: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 24, padding: 24, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  selectorLabel: { fontSize: 10, fontWeight: '900', color: Colors.accent, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16 },
  selectorRow: { flexDirection: 'row', alignItems: 'center', gap: 32, marginBottom: 16 },
  selectorBtn: { width: 52, height: 52, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  selectorBtnText: { fontSize: 28, fontWeight: '900', color: Colors.white },
  selectorCenter: { alignItems: 'center', minWidth: 80 },
  selectorNum: { fontSize: 52, fontWeight: '900', color: Colors.white, letterSpacing: -2 },
  selectorUnit: { fontSize: 10, fontWeight: '900', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 3, marginTop: 4 },
  selectorDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', width: '100%', marginVertical: 16 },
  totalLabel: { fontSize: 10, fontWeight: '900', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 },
  totalAmount: { fontSize: 30, fontWeight: '900', color: Colors.accent },
  rateNote: { fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', marginTop: 8, textTransform: 'uppercase', letterSpacing: -0.5 },
  benefitsCard: { padding: 20, borderRadius: 24, marginBottom: 16 },
  benefitsTitle: { fontSize: 11, fontWeight: '900', color: Colors.primary, textTransform: 'uppercase', letterSpacing: 2, borderBottomWidth: 1, borderBottomColor: Colors.gray50, paddingBottom: 8, marginBottom: 16 },
  benefitRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  benefitCheck: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center' },
  benefitCheckText: { fontSize: 10, fontWeight: '900', color: '#16a34a' },
  benefitText: { fontSize: 13, fontWeight: '500', flex: 1, lineHeight: 18 },
  footnoteBox: { paddingVertical: 16, alignItems: 'center' },
  footnoteText: { fontSize: 10, fontWeight: '700', color: Colors.gray400, textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center', lineHeight: 16 },
  footer: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 32, borderTopWidth: 1, borderTopColor: Colors.gray100, alignItems: 'center' },
  payBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: Colors.primary, width: '100%', paddingVertical: 18, borderRadius: BorderRadius.lg, elevation: 6 },
  payBtnText: { color: Colors.white, fontSize: 13, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 3 },
  secureNote: { fontSize: 8, fontWeight: '900', color: Colors.gray300, textTransform: 'uppercase', letterSpacing: 3, marginTop: 12 },
});
