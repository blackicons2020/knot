import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../contexts/AuthContext';
import { Colors, BorderRadius, Spacing } from '../theme/colors';
import { useToast } from '../contexts/ToastContext';
import KnotLogo from '../components/KnotLogo';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { login, register } = useAuth();
  const { addToast } = useToast();
  const insets = useSafeAreaInsets();

  const handleGoogleSignIn = async () => {
    addToast('Google Sign-In: coming soon', 'info');
  };

  const handleEmailSubmit = async () => {
    if (!email || !password) {
      addToast('Please enter email and password', 'error');
      return;
    }
    setIsProcessing(true);
    try {
      if (isLogin) {
        await login(email, password);
        addToast('Welcome back!', 'success');
      } else {
        await register(email, password);
        addToast('Welcome to Knot Registry', 'success');
      }
    } catch (error: any) {
      addToast(error.message || 'Authentication failed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Decorative background blobs */}
        <View style={styles.blobTopRight} />
        <View style={styles.blobBottomLeft} />

        <KnotLogo style={styles.logo} />

        <Text style={styles.headline}>
          {isLogin ? 'Welcome Back' : 'Join the Registry'}
        </Text>
        <Text style={styles.subheadline}>
          Where true relationships lead to vows
        </Text>

        {/* Social Buttons */}
        <View style={styles.socialContainer}>
          <TouchableOpacity style={styles.socialBtn} onPress={handleGoogleSignIn} activeOpacity={0.8}>
            <Ionicons name="logo-google" size={20} color={Colors.gray700} />
            <Text style={styles.socialBtnText}>Continue with Google</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.divider} />
        </View>

        {!showEmailForm ? (
          <TouchableOpacity
            style={styles.emailToggleBtn}
            onPress={() => setShowEmailForm(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="mail-outline" size={20} color={Colors.primary} />
            <Text style={styles.emailToggleBtnText}>Continue with Email</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.form}>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={16} color={Colors.gray400} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email address"
                placeholderTextColor={Colors.gray400}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={16} color={Colors.gray400} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={Colors.gray400}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
            <TouchableOpacity
              style={[styles.submitBtn, isProcessing && styles.submitBtnDisabled]}
              onPress={handleEmailSubmit}
              disabled={isProcessing}
              activeOpacity={0.8}
            >
              {isProcessing ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.submitBtnText}>
                  {isLogin ? 'Sign In' : 'Create Account'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity onPress={() => { setIsLogin(!isLogin); setShowEmailForm(false); }} style={styles.toggleRow}>
          <Text style={styles.toggleText}>
            {isLogin ? "Don't have an account? " : 'Already registered? '}
            <Text style={styles.toggleLink}>{isLogin ? 'Sign Up' : 'Sign In'}</Text>
          </Text>
        </TouchableOpacity>

        <View style={styles.trustRow}>
          <Ionicons name="shield-checkmark-outline" size={14} color={Colors.gray400} />
          <Text style={styles.trustText}>Verified profiles · Secure registry · Real connections</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light,
  },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  blobTopRight: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.primary + '12',
  },
  blobBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: Colors.accent + '20',
  },
  logo: {
    marginTop: 60,
    marginBottom: 24,
  },
  headline: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.dark,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subheadline: {
    fontSize: 13,
    color: Colors.gray500,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 40,
    fontStyle: 'italic',
  },
  socialContainer: {
    width: '100%',
    gap: 12,
  },
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.gray200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  socialBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.gray700,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 20,
    gap: 12,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.gray200,
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '900',
    color: Colors.gray400,
    letterSpacing: 1,
  },
  emailToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  emailToggleBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  form: {
    width: '100%',
    gap: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.gray200,
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: 14,
    color: Colors.dark,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginTop: 4,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    color: Colors.white,
    fontWeight: '900',
    fontSize: 15,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  toggleRow: {
    marginTop: 24,
  },
  toggleText: {
    fontSize: 13,
    color: Colors.gray500,
    textAlign: 'center',
  },
  toggleLink: {
    color: Colors.primary,
    fontWeight: '900',
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 32,
  },
  trustText: {
    fontSize: 11,
    color: Colors.gray400,
    fontWeight: '600',
  },
});
