import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '../utils/theme';
import GradientButton from '../components/GradientButton';

const { width, height } = Dimensions.get('window');

const highlights = [
  { icon: 'flash-outline', title: 'Rapide', text: 'Reserve en quelques clics' },
  { icon: 'shield-checkmark-outline', title: 'Securise', text: 'Trajets campus fiables' },
  { icon: 'location-outline', title: 'Partout', text: 'Disponible autour du campus' },
];

export default function SplashScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <LinearGradient colors={[Colors.background, '#0a0a1a']} style={styles.container}>
      {/* Decorative orbs */}
      <View style={styles.orb1} />
      <View style={styles.orb2} />

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {/* Logo */}
        <Animated.View style={[styles.logoWrap, { transform: [{ scale: scaleAnim }] }]}>
          <Image source={require('../../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
        </Animated.View>

        {/* Title */}
        <Text style={styles.title}>CampusRide</Text>
        <Text style={styles.subtitle}>
          Simplifie tes trajets universitaires.{'\n'}Trouve un conducteur fiable et voyage sereinement.
        </Text>

        {/* Highlights */}
        <View style={styles.highlights}>
          {highlights.map((item) => (
            <View key={item.title} style={styles.highlightCard}>
              <LinearGradient
                colors={[Colors.primary + '33', Colors.accent + '22']}
                style={styles.highlightIcon}
              >
                <Ionicons name={item.icon} size={22} color={Colors.accent} />
              </LinearGradient>
              <Text style={styles.highlightTitle}>{item.title}</Text>
              <Text style={styles.highlightText}>{item.text}</Text>
            </View>
          ))}
        </View>

        {/* CTA */}
        <View style={styles.ctaSection}>
          <GradientButton
            title="Commencer"
            onPress={() => navigation.navigate('Login')}
            icon={<Ionicons name="arrow-forward" size={18} color="#fff" />}
          />

          <View style={styles.dots}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xxl,
    paddingTop: height * 0.08,
    paddingBottom: Spacing.xxxl,
  },
  orb1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.primary + '15',
    top: -50,
    right: -50,
  },
  orb2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: Colors.accent + '10',
    bottom: 100,
    left: -40,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrap: {
    marginBottom: Spacing.xl,
  },
  logo: {
    width: 90,
    height: 90,
  },
  title: {
    fontSize: FontSize.hero,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: Spacing.sm,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xxxl,
    paddingHorizontal: Spacing.lg,
  },
  highlights: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xxxl,
  },
  highlightCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  highlightIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  highlightTitle: {
    color: Colors.text,
    fontSize: FontSize.sm,
    fontWeight: '700',
    marginBottom: 2,
  },
  highlightText: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    textAlign: 'center',
  },
  ctaSection: {
    width: '100%',
    alignItems: 'center',
    gap: Spacing.xl,
  },
  dots: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  dotActive: {
    width: 24,
    backgroundColor: Colors.primary,
  },
});
