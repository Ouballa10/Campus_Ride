import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, BorderRadius, FontSize, Spacing } from '../utils/theme';

export default function GradientButton({
  title,
  onPress,
  disabled = false,
  variant = 'primary',
  icon,
  style,
}) {
  const gradients = {
    primary: [Colors.primary, Colors.primaryDark],
    accent: [Colors.accent, '#3BAFA8'],
    warm: [Colors.secondary, '#FF8E8E'],
    dark: [Colors.backgroundCard, Colors.background],
  };

  const colors = gradients[variant] || gradients.primary;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[styles.wrapper, style]}
    >
      <LinearGradient
        colors={disabled ? ['#4A5568', '#2D3748'] : colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        {icon && <View style={styles.iconWrap}>{icon}</View>}
        <Text style={[styles.text, disabled && styles.textDisabled]}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xxl,
    borderRadius: BorderRadius.lg,
  },
  iconWrap: {
    marginRight: Spacing.sm,
  },
  text: {
    color: Colors.text,
    fontSize: FontSize.lg,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  textDisabled: {
    opacity: 0.5,
  },
});
