import React, { useState, useEffect, useRef } from 'react';
import {
  FlatList, Image, KeyboardAvoidingView, Platform, StyleSheet, Text,
  TextInput, TouchableOpacity, View,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import { Colors, Spacing, BorderRadius } from '../theme/colors';
import { RootStackParamList, Message } from '../types';
import { db } from '../services/apiService';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type ChatRoute = RouteProp<RootStackParamList, 'Chat'>;

export default function ChatScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<ChatRoute>();
  const { isDarkMode } = useTheme();
  const { addToast } = useToast();
  const insets = useSafeAreaInsets();
  const { match, user } = params;

  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const unsub = db.subscribeToMessages(match.id, setMessages);
    return () => unsub();
  }, [match.id]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  const send = async () => {
    const msg = text.trim();
    if (!msg) return;
    setText('');
    try {
      await db.sendMessage(match.id, user.id, msg);
    } catch {
      addToast('Failed to send message', 'error');
      setText(msg);
    }
  };

  const photo = match.profileImageUrls?.[0] || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400';

  const renderMsg = ({ item }: { item: Message }) => {
    const isMine = item.senderId === user.id;
    return (
      <View style={[s.msgRow, isMine && s.msgRowMine]}>
        {!isMine && <Image source={{ uri: photo }} style={s.msgAvatar} />}
        <View style={[s.bubble, isMine ? s.bubbleMine : s.bubbleTheirs]}>
          <Text style={[s.bubbleText, isMine ? { color: Colors.white } : { color: isDarkMode ? Colors.white : Colors.gray900 }]}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[s.root, { backgroundColor: isDarkMode ? Colors.dark : Colors.light + '50' }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={[s.header, { paddingTop: insets.top + 8, backgroundColor: isDarkMode ? Colors.darkCard : Colors.white }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.headerBack}>
          <Ionicons name="chevron-back" size={24} color={isDarkMode ? Colors.white : Colors.gray600} />
        </TouchableOpacity>
        <Image source={{ uri: photo }} style={s.headerAvatar} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[s.headerName, { color: isDarkMode ? Colors.white : Colors.dark }]}>{match.name}</Text>
          <Text style={s.headerSub}>Online</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('VideoCall', { match, user })}>
          <Ionicons name="videocam" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={renderMsg}
        contentContainerStyle={{ padding: Spacing.md, paddingBottom: 16 }}
        ListEmptyComponent={
          <View style={s.emptyWrap}>
            <Text style={s.emptyText}>Start of conversation</Text>
          </View>
        }
      />

      {/* Input */}
      <View style={[s.inputBar, { paddingBottom: insets.bottom + 8, backgroundColor: isDarkMode ? Colors.darkCard : Colors.white }]}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Type a message..."
          placeholderTextColor={Colors.gray400}
          style={[s.input, { backgroundColor: isDarkMode ? Colors.darkSurface : Colors.gray50, color: isDarkMode ? Colors.white : Colors.gray900 }]}
          onSubmitEditing={send}
          returnKeyType="send"
        />
        <TouchableOpacity style={s.sendBtn} onPress={send}>
          <Ionicons name="send" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: Colors.gray100, elevation: 2 },
  headerBack: { padding: 4, marginRight: 4 },
  headerAvatar: { width: 40, height: 40, borderRadius: 20 },
  headerName: { fontSize: 16, fontWeight: '700' },
  headerSub: { fontSize: 11, color: Colors.gray500 },
  emptyWrap: { alignItems: 'center', paddingVertical: 80 },
  emptyText: { fontSize: 11, fontWeight: '700', color: Colors.gray400, textTransform: 'uppercase', letterSpacing: 2 },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 12 },
  msgRowMine: { justifyContent: 'flex-end' },
  msgAvatar: { width: 24, height: 24, borderRadius: 12 },
  bubble: { maxWidth: '75%', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 18 },
  bubbleMine: { backgroundColor: Colors.primary, borderBottomRightRadius: 4 },
  bubbleTheirs: { backgroundColor: Colors.white, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: Colors.gray200 },
  bubbleText: { fontSize: 14, fontWeight: '500' },
  inputBar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingTop: 8, borderTopWidth: 1, borderTopColor: Colors.gray100 },
  input: { flex: 1, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14 },
  sendBtn: { backgroundColor: Colors.primary, borderRadius: 22, padding: 10 },
});
