import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { RootStackParamList } from '../types';
import { Colors } from '../theme/colors';

type LegalRoute = RouteProp<RootStackParamList, 'Legal'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function LegalScreen() {
  const { params } = useRoute<LegalRoute>();
  const navigation = useNavigation<Nav>();
  const { isDarkMode } = useTheme();

  const isTOS = params.type === 'tos';
  const title = isTOS ? 'Terms of Service' : 'Privacy Policy';

  const tosContent = `
Terms of Service

Effective Date: January 1, 2026

Welcome to Knot! These Terms of Service ("Terms") govern your use of the Knot dating application (the "App"). By accessing or using our App, you agree to comply with and be bound by these Terms.

1. Eligibility
You must be at least 18 years of age to create an account and use the App. By creating an account, you represent and warrant that you are 18 or older.

2. Account Security
You are responsible for maintaining the confidentiality of your login credentials. Knot is not responsible for any unauthorized access to your account.

3. User Conduct
You agree not to use the App for any unlawful or prohibited purpose. You must not:
- Harass, abuse, or harm another person.
- Use the App for commercial purposes without our consent.
- Post inappropriate, explicit, or copyrighted content.

4. Content Ownership
By posting content on Knot, you grant us a worldwide, royalty-free license to use, reproduce, and display that content in connection with the App.

5. Termination
We reserve the right to suspend or terminate your account at any time, for any reason, including violation of these Terms.

6. Disclaimers
Knot provides the App on an "as is" and "as available" basis. We do not guarantee that the App will be secure, error-free, or function without interruption.

7. Changes to Terms
We may modify these Terms at any time. Your continued use of the App constitutes acceptance of the revised Terms.
  `;

  const privacyContent = `
Privacy Policy

Effective Date: January 1, 2026

At Knot, we prioritize your privacy. This Privacy Policy outlines how we collect, use, and protect your personal information when you use our App.

1. Information We Collect
- **Account Information:** Name, email, date of birth, gender, and photos.
- **Profile Data:** Interests, bio, location, cultural background, and relationship preferences.
- **Usage Data:** How you interact with the App, including messages, matches, and app settings.

2. How We Use Your Information
- To provide, maintain, and improve our matchmaking services.
- To personalize your experience using our AI compatibility algorithms.
- To communicate with you regarding updates, security alerts, and support.

3. Sharing Your Information
We do not sell your personal data. We may share your information:
- With other users as part of your public profile (e.g., matches).
- With third-party service providers (e.g., AWS, OpenAI) strictly for operating the App.
- When required by law or to protect our rights.

4. Data Security
We implement robust security measures to protect your data, but no method of transmission over the internet is 100% secure.

5. Your Rights
You have the right to access, update, or delete your personal information. You can delete your account entirely from the "Edit Profile" screen in the App. 
Additionally, you may request complete account and data deletion externally without logging in by visiting our portal at: http://16.192.76.171/data-deletion

6. Contact Us
If you have questions about this Privacy Policy, please contact our support team at cleanconnectng@gmail.com.
  `;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: isDarkMode ? Colors.dark : Colors.white }]}>
      <View style={[styles.header, { borderBottomColor: isDarkMode ? Colors.darkBorder : Colors.gray100 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={isDarkMode ? Colors.white : Colors.dark} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDarkMode ? Colors.white : Colors.dark }]}>{title}</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.text, { color: isDarkMode ? Colors.gray200 : Colors.gray800 }]}>
          {isTOS ? tosContent.trim() : privacyContent.trim()}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  text: {
    fontSize: 15,
    lineHeight: 24,
  },
});
