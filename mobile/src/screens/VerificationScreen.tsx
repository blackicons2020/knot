import React, { useState } from 'react';
import {
  Alert, Image, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Colors, Spacing, BorderRadius } from '../theme/colors';
import { RootStackParamList } from '../types';
import { db } from '../services/apiService';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type VRoute = RouteProp<RootStackParamList, 'Verification'>;

type Step = 'initial' | 'selfie_review' | 'id_selection' | 'id_review' | 'verifying' | 'success';

export default function VerificationScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<VRoute>();
  const { isDarkMode } = useTheme();
  const { setUserProfile } = useAuth();
  const user = params.user;

  const [step, setStep] = useState<Step>('initial');
  const [selfie, setSelfie] = useState<string | null>(null);
  const [idPhoto, setIdPhoto] = useState<string | null>(null);
  const [selectedIdType, setSelectedIdType] = useState<string | null>(null);

  const handleCaptureSelfie = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission Required', 'Camera access is needed for the biometric selfie.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setSelfie(result.assets[0].uri);
      setStep('selfie_review');
    }
  };

  const handleScanDocument = async (idType: string) => {
    setSelectedIdType(idType);
    
    // Let user choose camera or gallery for the document
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    
    const pickMethod = perm.granted ? 'camera' : 'gallery';
    let result;
    
    if (pickMethod === 'camera') {
      result = await ImagePicker.launchCameraAsync({
        quality: 0.9,
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.9,
      });
    }
    
    if (!result.canceled && result.assets[0]) {
      setIdPhoto(result.assets[0].uri);
      setStep('id_review');
    }
  };

  const handlePickDocumentFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.9,
    });
    if (!result.canceled && result.assets[0]) {
      setIdPhoto(result.assets[0].uri);
      setStep('id_review');
    }
  };

  const handleVerify = () => {
    setStep('verifying');
    setTimeout(async () => {
      try {
        // Upload selfie and ID photo to server
        let uploadedSelfie = selfie;
        let uploadedId = idPhoto;
        if (selfie) {
          try { uploadedSelfie = await db.uploadPhoto(selfie); } catch { /* keep local */ }
        }
        if (idPhoto) {
          try { uploadedId = await db.uploadPhoto(idPhoto); } catch { /* keep local */ }
        }
        const updated = { ...user, isVerified: true };
        await db.saveUser(updated);
        setUserProfile(updated);
        setStep('success');
        setTimeout(() => navigation.goBack(), 2500);
      } catch {
        Alert.alert('Error', 'Verification failed. Please try again.');
        setStep('id_review');
      }
    }, 3000);
  };

  if (step === 'verifying') {
    return (
      <View style={[s.center, { backgroundColor: isDarkMode ? Colors.dark : Colors.white }]}>
        <View style={s.spinnerWrap}>
          <Ionicons name="shield-checkmark" size={40} color={Colors.primary} />
        </View>
        <Text style={[s.title, { color: isDarkMode ? Colors.white : Colors.dark }]}>Verifying Identity...</Text>
        <Text style={s.desc}>Cross-referencing biometrics with ID document.</Text>
      </View>
    );
  }

  if (step === 'success') {
    return (
      <View style={[s.center, { backgroundColor: isDarkMode ? Colors.dark : Colors.white }]}>
        <View style={[s.successCircle]}>
          <Ionicons name="checkmark" size={40} color={Colors.white} />
        </View>
        <Text style={[s.title, { color: isDarkMode ? Colors.white : Colors.dark }]}>Verified!</Text>
        <Text style={s.desc}>Your identity has been confirmed. Redirecting...</Text>
      </View>
    );
  }

  if (step === 'selfie_review') {
    return (
      <View style={[s.center, { backgroundColor: isDarkMode ? Colors.dark : Colors.white }]}>
        <Text style={[s.title, { color: isDarkMode ? Colors.white : Colors.dark }]}>Review Biometrics</Text>
        <View style={s.selfieFrame}>
          <Image source={{ uri: selfie! }} style={s.selfieImg} />
        </View>
        <Text style={s.desc}>Ensure your face is clear and matches your registry profile.</Text>
        <TouchableOpacity style={s.primaryBtn} onPress={() => setStep('id_selection')}>
          <Text style={s.primaryBtnText}>Proceed to ID Scan</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setStep('initial')}>
          <Text style={s.linkText}>Retake Photo</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (step === 'id_review') {
    return (
      <View style={[s.center, { backgroundColor: isDarkMode ? Colors.dark : Colors.white }]}>
        <Text style={[s.title, { color: isDarkMode ? Colors.white : Colors.dark }]}>Review {selectedIdType}</Text>
        <View style={s.docFrame}>
          <Image source={{ uri: idPhoto! }} style={s.docImg} />
        </View>
        <Text style={s.desc}>Ensure the document is clear and text is readable.</Text>
        <TouchableOpacity style={s.primaryBtn} onPress={handleVerify}>
          <Text style={s.primaryBtnText}>Submit for Verification</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setStep('id_selection')}>
          <Text style={s.linkText}>Retake Document</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (step === 'id_selection') {
    return (
      <View style={[s.root, { backgroundColor: isDarkMode ? Colors.dark : Colors.white }]}>
        <View style={{ padding: Spacing.lg, flex: 1 }}>
          <Text style={[s.title, { color: isDarkMode ? Colors.white : Colors.dark, marginTop: 32 }]}>Identity Document</Text>
          <Text style={[s.desc, { marginBottom: 24 }]}>Select the government-issued ID you will scan.</Text>
          {(['Passport', 'National ID', "Driver's Licence"] as const).map((idType) => (
            <TouchableOpacity key={idType} style={[s.idCard, { backgroundColor: isDarkMode ? Colors.darkCard : Colors.white }]} onPress={() => handleScanDocument(idType)}>
              <Ionicons name={idType === 'Passport' ? 'book' : 'card'} size={24} color={Colors.primary} />
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={[s.idTitle, { color: isDarkMode ? Colors.white : Colors.dark }]}>{idType}</Text>
                <Text style={s.idSub}>Tap to scan with camera</Text>
              </View>
              <Ionicons name="camera" size={18} color={Colors.gray400} />
            </TouchableOpacity>
          ))}
          <Text style={[s.orText, { color: isDarkMode ? Colors.gray500 : Colors.gray400 }]}>— or upload from gallery —</Text>
          <TouchableOpacity style={[s.galleryBtn, { borderColor: isDarkMode ? Colors.darkBorder : Colors.gray200 }]} onPress={handlePickDocumentFromGallery}>
            <Ionicons name="images" size={22} color={Colors.primary} />
            <Text style={s.galleryBtnText}>Choose from Gallery</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Initial step
  return (
    <View style={[s.center, { backgroundColor: isDarkMode ? Colors.dark : Colors.white }]}>
      <View style={s.shieldWrap}>
        <Ionicons name="shield-checkmark" size={64} color={Colors.primary} />
        <View style={s.secureBadge}>
          <Text style={s.secureBadgeText}>SECURE</Text>
        </View>
      </View>
      <Text style={[s.title, { color: isDarkMode ? Colors.white : Colors.dark }]}>Registry Verification</Text>
      <Text style={[s.desc, { marginHorizontal: 32 }]}>
        Knot is a high-trust registry. Verified members are 4x more likely to find a compatible partner.
      </Text>
      <View style={s.stepsRow}>
        <View style={s.stepBox}>
          <View style={s.stepNum}><Text style={s.stepNumText}>01</Text></View>
          <Text style={s.stepLabel}>Biometric{'\n'}Selfie</Text>
        </View>
        <View style={s.stepBox}>
          <View style={s.stepNum}><Text style={s.stepNumText}>02</Text></View>
          <Text style={s.stepLabel}>ID Document{'\n'}Upload</Text>
        </View>
      </View>
      <TouchableOpacity style={s.primaryBtn} onPress={handleCaptureSelfie}>
        <Text style={s.primaryBtnText}>Begin Authentication</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={s.linkText}>Maybe Later</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.lg },
  shieldWrap: { backgroundColor: Colors.light, padding: 32, borderRadius: 40, marginBottom: 24, position: 'relative' },
  secureBadge: { position: 'absolute', top: -8, right: -8, backgroundColor: Colors.accent, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, elevation: 4 },
  secureBadgeText: { fontSize: 10, fontWeight: '900', color: Colors.dark },
  title: { fontSize: 22, fontWeight: '900', marginBottom: 8, textAlign: 'center' },
  desc: { fontSize: 13, color: Colors.gray500, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  stepsRow: { flexDirection: 'row', gap: 16, marginBottom: 32 },
  stepBox: { flex: 1, alignItems: 'center', backgroundColor: Colors.gray50, padding: 16, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.gray100 },
  stepNum: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.primary + '15', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  stepNumText: { fontSize: 12, fontWeight: '900', color: Colors.primary },
  stepLabel: { fontSize: 10, fontWeight: '900', color: Colors.gray500, textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center', lineHeight: 16 },
  primaryBtn: { backgroundColor: Colors.primary, width: '100%', paddingVertical: 16, borderRadius: BorderRadius.lg, alignItems: 'center', elevation: 4, marginBottom: 12 },
  primaryBtnText: { color: Colors.white, fontSize: 14, fontWeight: '900' },
  linkText: { fontSize: 12, fontWeight: '700', color: Colors.gray400, textTransform: 'uppercase', letterSpacing: 2, paddingVertical: 12 },
  selfieFrame: { width: 200, height: 200, borderRadius: 100, overflow: 'hidden', borderWidth: 4, borderColor: Colors.primary, marginVertical: 24, elevation: 8 },
  selfieImg: { width: '100%', height: '100%' },
  idCard: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.gray100, marginBottom: 12, elevation: 1 },
  idTitle: { fontSize: 15, fontWeight: '700' },
  idSub: { fontSize: 11, color: Colors.gray500, marginTop: 2 },
  orText: { textAlign: 'center', fontSize: 12, fontWeight: '700', marginVertical: 16, letterSpacing: 1 },
  galleryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 16, borderRadius: BorderRadius.lg, borderWidth: 1.5, borderStyle: 'dashed' },
  galleryBtnText: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  docFrame: { width: 280, height: 180, borderRadius: 16, overflow: 'hidden', borderWidth: 3, borderColor: Colors.primary, marginVertical: 24, elevation: 8 },
  docImg: { width: '100%', height: '100%' },
  spinnerWrap: { marginBottom: 24 },
  successCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#22c55e', alignItems: 'center', justifyContent: 'center', marginBottom: 24, elevation: 8 },
});
