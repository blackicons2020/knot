import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Colors } from '../theme/colors';
import { useTheme } from '../contexts/ThemeContext';

interface KnotLogoProps {
  style?: ViewStyle;
  size?: 'sm' | 'md' | 'lg';
}

export default function KnotLogo({ style, size = 'md' }: KnotLogoProps) {
  const { isDarkMode } = useTheme();
  const fontSize = size === 'sm' ? 22 : size === 'lg' ? 42 : 32;
  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.text, { fontSize }]}>
        <Text style={[styles.knot, { color: isDarkMode ? Colors.white : Colors.dark }]}>Knot</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  text: {
    letterSpacing: -1,
  },
  knot: {
    fontWeight: 'bold',
    fontFamily: 'Georgia',
  },
});
