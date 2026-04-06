import React, { useState } from 'react';
import {
  ActivityIndicator, Alert, Image, StyleSheet, Text, TouchableOpacity, View,
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
type MPRoute = RouteProp<RootStackParamList, 'ManagePhotos'>;

export default function ManagePhotosScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<MPRoute>();
  const { setUserProfile } = useAuth();
  const { isDarkMode } = useTheme();
  const [photos, setPhotos] = useState<string[]>(params.user.profileImageUrls || []);
  const [uploading, setUploading] = useState(false);

  const pickPhoto = async () => {
    if (photos.length >= 6) {
      Alert.alert('Limit', 'Maximum 6 photos allowed.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setUploading(true);
      try {
        const serverUrl = await db.uploadPhoto(result.assets[0].uri);
        setPhotos((prev) => [...prev, serverUrl]);
      } catch (err: any) {
        Alert.alert('Upload Failed', err.message || 'Could not upload photo.');
      } finally {
        setUploading(false);
      }
    }
  };

  const takePhoto = async () => {
    if (photos.length >= 6) {
      Alert.alert('Limit', 'Maximum 6 photos allowed.');
      return;
    }
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission Required', 'Camera access is needed to take photos.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setUploading(true);
      try {
        const serverUrl = await db.uploadPhoto(result.assets[0].uri);
        setPhotos((prev) => [...prev, serverUrl]);
      } catch (err: any) {
        Alert.alert('Upload Failed', err.message || 'Could not upload photo.');
      } finally {
        setUploading(false);
      }
    }
  };

  const removePhoto = (idx: number) => {
    if (photos.length <= 1) {
      Alert.alert('Required', 'At least one photo is required.');
      return;
    }
    setPhotos(photos.filter((_, i) => i !== idx));
  };

  const save = async () => {
    const updated = { ...params.user, profileImageUrls: photos };
    await db.saveUser(updated);
    setUserProfile(updated);
    navigation.goBack();
  };

  return (
    <View style={[s.root, { backgroundColor: isDarkMode ? Colors.dark : Colors.gray50 }]}>
      {/* Header */}
      <View style={[s.header, { backgroundColor: isDarkMode ? Colors.darkCard : Colors.white }]}>
        <Text style={[s.headerTitle, { color: isDarkMode ? Colors.white : Colors.dark }]}>Manage Photos</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={Colors.gray400} />
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1, padding: Spacing.md }}>
        <Text style={s.subtitle}>Your Registry Photos</Text>
        <Text style={s.hint}>The first photo is shown to potential matches. Up to 6 images.</Text>

        <View style={s.grid}>
          {photos.map((photo, idx) => (
            <View key={idx} style={s.photoCell}>
              <Image source={{ uri: photo }} style={s.photoImg} />
              {idx === 0 && (
                <View style={s.mainBadge}>
                  <Text style={s.mainBadgeText}>Main</Text>
                </View>
              )}
              <TouchableOpacity style={s.removeBtn} onPress={() => removePhoto(idx)}>
                <Ionicons name="trash" size={18} color="#dc2626" />
              </TouchableOpacity>
            </View>
          ))}
          {photos.length < 6 && !uploading && (
            <TouchableOpacity style={[s.addCell, { borderColor: isDarkMode ? Colors.darkBorder : Colors.light }]} onPress={pickPhoto}>
              <Ionicons name="images" size={28} color={Colors.primary} />
              <Text style={s.addText}>Gallery</Text>
            </TouchableOpacity>
          )}
          {photos.length < 6 && !uploading && (
            <TouchableOpacity style={[s.addCell, { borderColor: isDarkMode ? Colors.darkBorder : Colors.light }]} onPress={takePhoto}>
              <Ionicons name="camera" size={28} color={Colors.primary} />
              <Text style={s.addText}>Camera</Text>
            </TouchableOpacity>
          )}
          {uploading && (
            <View style={[s.addCell, { borderColor: Colors.primary }]}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={s.addText}>Uploading...</Text>
            </View>
          )}
        </View>
      </View>

      {/* Footer */}
      <View style={[s.footer, { backgroundColor: isDarkMode ? Colors.darkCard : Colors.white }]}>
        <TouchableOpacity style={s.saveBtn} onPress={save}>
          <Text style={s.saveBtnText}>Update Registry</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.gray200 },
  headerTitle: { fontSize: 18, fontWeight: '900', textTransform: 'uppercase', letterSpacing: -0.5 },
  subtitle: { fontSize: 12, fontWeight: '700', color: Colors.gray400, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 },
  hint: { fontSize: 11, color: Colors.gray500, marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  photoCell: { width: '30%', aspectRatio: 1, borderRadius: BorderRadius.lg, overflow: 'hidden', position: 'relative' },
  photoImg: { width: '100%', height: '100%' },
  mainBadge: { position: 'absolute', top: 6, left: 6, backgroundColor: Colors.primary, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  mainBadgeText: { fontSize: 8, fontWeight: '900', color: Colors.white, textTransform: 'uppercase' },
  removeBtn: { position: 'absolute', bottom: 6, right: 6, backgroundColor: Colors.white, borderRadius: 16, padding: 6, elevation: 4 },
  addCell: { width: '30%', aspectRatio: 1, borderRadius: BorderRadius.lg, borderWidth: 2, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  addText: { fontSize: 10, fontWeight: '900', color: Colors.primary, textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 },
  footer: { padding: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.gray200 },
  saveBtn: { backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: BorderRadius.lg, alignItems: 'center', elevation: 4 },
  saveBtnText: { color: Colors.white, fontSize: 16, fontWeight: '900' },
});
