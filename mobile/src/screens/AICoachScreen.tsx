import React, { useState, useRef, useEffect } from 'react';
import {
  FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text,
  TextInput, TouchableOpacity, View, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import AppHeader from '../components/AppHeader';
import { Colors, Spacing, BorderRadius } from '../theme/colors';

interface CoachMsg {
  role: 'ai' | 'user';
  text: string;
}

export default function AICoachScreen() {
  const { isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<CoachMsg[]>([
    {
      role: 'ai',
      text: 'Hello! I am your KNOT Relationship Coach. Ask me anything about attachment styles, conflict resolution, or first-date suggestions.'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;

    setMessages((prev) => [...prev, { role: 'user', text }]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = 'As your relationship coach, I recommend focusing on emotional availability. In serious partnerships, alignment on family structures and timelines resolves 80% of conflict early.';
      
      const query = text.toLowerCase();
      if (query.includes('date')) {
        reply = "For a successful first date, choose a quiet, premium environment like a botanical garden or a quiet lounge. Ask open-ended questions like: 'What does a fulfilling life look like for you in five years?'";
      } else if (query.includes('relocate')) {
        reply = 'Discussing relocation requires collaborative transparency. Emphasize that your primary goal is finding mutual alignment where both partners feel emotionally safe, productive, and connected to family circles.';
      }

      setMessages((prev) => [...prev, { role: 'ai', text: reply }]);
      setIsTyping(false);
    }, 1000);
  };

  const renderItem = ({ item }: { item: CoachMsg }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.msgRow, isUser && styles.msgRowUser]}>
        {!isUser && (
          <View style={[styles.aiIcon, { backgroundColor: 'rgba(212,175,55,0.1)' }]}>
            <Text style={{ color: Colors.accent, fontSize: 10, fontWeight: '900' }}>AI</Text>
          </View>
        )}
        <View style={[styles.bubble, isUser ? styles.bubbleUser : { backgroundColor: isDarkMode ? Colors.darkSurface : Colors.white, borderColor: isDarkMode ? Colors.darkBorder : Colors.gray200, borderWidth: 1 }]}>
          <Text style={[styles.msgText, isUser ? { color: Colors.white } : { color: isDarkMode ? Colors.white : Colors.dark }]}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: isDarkMode ? Colors.dark : Colors.gray50 }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <AppHeader />

      {/* Top counselor profile card */}
      <View style={[styles.coachHeader, { backgroundColor: isDarkMode ? Colors.darkCard : Colors.white, borderBottomColor: isDarkMode ? Colors.darkBorder : Colors.gray200 }]}>
        <View style={[styles.coachAvatar, { backgroundColor: isDarkMode ? 'rgba(212,175,55,0.1)' : 'rgba(212,175,55,0.05)' }]}>
          <Ionicons name="sparkles" size={20} color={Colors.accent} />
        </View>
        <View>
          <Text style={[styles.coachName, { color: isDarkMode ? Colors.white : Colors.dark }]}>Counselor KNOT</Text>
          <Text style={[styles.coachStatus, { color: Colors.accent }]}>Active Coaching Session</Text>
        </View>
      </View>

      {/* Messages Feed */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(_, i) => i.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={
          isTyping ? (
            <View style={styles.msgRow}>
              <View style={[styles.aiIcon, { backgroundColor: 'rgba(212,175,55,0.1)' }]}>
                <Text style={{ color: Colors.accent, fontSize: 10, fontWeight: '900' }}>AI</Text>
              </View>
              <View style={[styles.bubble, { backgroundColor: isDarkMode ? Colors.darkSurface : Colors.white, borderColor: isDarkMode ? Colors.darkBorder : Colors.gray200, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 12 }]}>
                <ActivityIndicator size="small" color={Colors.accent} />
                <Text style={[styles.msgText, { color: isDarkMode ? Colors.gray400 : Colors.gray500, fontStyle: 'italic' }]}>Counselor is typing...</Text>
              </View>
            </View>
          ) : null
        }
      />

      {/* Input Bar */}
      <View style={[styles.inputBar, { paddingBottom: insets.bottom + 8, backgroundColor: isDarkMode ? Colors.darkCard : Colors.white, borderTopColor: isDarkMode ? Colors.darkBorder : Colors.gray200 }]}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask about attachment, relocation, timelines..."
          placeholderTextColor={Colors.gray400}
          onSubmitEditing={handleSend}
          returnKeyType="send"
          style={[styles.input, { backgroundColor: isDarkMode ? Colors.darkSurface : Colors.gray50, color: isDarkMode ? Colors.white : Colors.dark }]}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
          <Ionicons name="send" size={18} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  coachHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  coachAvatar: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.2)',
  },
  coachName: { fontSize: 14, fontWeight: '900' },
  coachStatus: { fontSize: 9, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },
  listContent: { padding: Spacing.md, paddingBottom: 24 },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: Spacing.md },
  msgRowUser: { justifyContent: 'flex-end' },
  aiIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.2)',
  },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleUser: {
    backgroundColor: 'rgba(226,125,141,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(226,125,141,0.3)',
    borderBottomRightRadius: 4,
  },
  msgText: { fontSize: 12, lineHeight: 18 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 13,
  },
  sendBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 22,
    padding: 10,
  },
});
