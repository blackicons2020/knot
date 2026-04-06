import React, { useState, useEffect, useRef } from 'react';
import {
  Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../theme/colors';
import { RootStackParamList } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type VCRoute = RouteProp<RootStackParamList, 'VideoCall'>;

export default function VideoCallScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<VCRoute>();
  const { match, user } = params;

  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [status, setStatus] = useState(`Connecting to ${match.name}...`);

  useEffect(() => {
    const t = setTimeout(() => setStatus('Connected'), 2000);
    return () => clearTimeout(t);
  }, []);

  const photo = match.profileImageUrls?.[0] || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800';

  return (
    <View style={s.root}>
      {/* Background - match photo blurred */}
      <ImageBackground source={{ uri: photo }} style={StyleSheet.absoluteFill} blurRadius={20}>
        <View style={s.overlay} />
      </ImageBackground>

      {/* Match info center */}
      <View style={s.centerInfo}>
        <Image source={{ uri: photo }} style={s.matchAvatar} />
        <Text style={s.matchName}>{match.name}</Text>
        <Text style={s.matchStatus}>{status}</Text>
      </View>

      {/* Local camera preview placeholder */}
      <View style={s.localPreview}>
        {isCameraOff ? (
          <View style={s.cameraOff}>
            <Ionicons name="videocam-off" size={24} color={Colors.gray400} />
          </View>
        ) : (
          <View style={s.cameraOn}>
            <Ionicons name="person" size={28} color={Colors.gray400} />
          </View>
        )}
      </View>

      {/* Controls */}
      <View style={s.controls}>
        <View style={s.controlsBar}>
          <TouchableOpacity
            style={[s.controlBtn, isMuted && s.controlBtnActive]}
            onPress={() => setIsMuted(!isMuted)}
          >
            <Ionicons name={isMuted ? 'mic-off' : 'mic'} size={24} color={Colors.white} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.controlBtn, isCameraOff && s.controlBtnActive]}
            onPress={() => setIsCameraOff(!isCameraOff)}
          >
            <Ionicons name={isCameraOff ? 'videocam-off' : 'videocam'} size={24} color={Colors.white} />
          </TouchableOpacity>
          <TouchableOpacity style={s.endCallBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="call" size={28} color={Colors.white} style={{ transform: [{ rotate: '135deg' }] }} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.dark },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  centerInfo: { flex: 1, alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  matchAvatar: { width: 128, height: 128, borderRadius: 64, borderWidth: 4, borderColor: Colors.white, elevation: 8 },
  matchName: { fontSize: 24, fontWeight: '700', color: Colors.white, marginTop: 16 },
  matchStatus: { fontSize: 14, color: Colors.gray300, marginTop: 4 },
  localPreview: { position: 'absolute', top: 50, right: 16, width: 100, height: 140, borderRadius: 12, overflow: 'hidden', borderWidth: 2, borderColor: Colors.white, zIndex: 20 },
  cameraOff: { flex: 1, backgroundColor: Colors.gray800, alignItems: 'center', justifyContent: 'center' },
  cameraOn: { flex: 1, backgroundColor: Colors.gray700, alignItems: 'center', justifyContent: 'center' },
  controls: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingBottom: 48, zIndex: 20 },
  controlsBar: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 24, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 40, marginHorizontal: 48, paddingVertical: 16 },
  controlBtn: { padding: 12, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.2)' },
  controlBtnActive: { backgroundColor: 'rgba(255,255,255,0.4)' },
  endCallBtn: { padding: 16, borderRadius: 28, backgroundColor: '#dc2626' },
});
