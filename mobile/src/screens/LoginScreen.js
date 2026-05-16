import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Image,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../utils/theme';
import GradientButton from '../components/GradientButton';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const { signIn, isConfigured } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin() {
    if (!email.trim() || !password) {
      setError('Remplis tous les champs.');
      return;
    }
    if (!isConfigured) {
      setError('Supabase non configure. Ajoute les variables .env');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await signIn({ email: email.trim(), password });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient colors={[Colors.background, '#0a0a1a']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Back button */}
          <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color={Colors.textSecondary} />
            <Text style={styles.backText}>Retour</Text>
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <Image source={require('../../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
            <Text style={styles.eyebrow}>CampusRide</Text>
            <Text style={styles.title}>Connexion</Text>
            <Text style={styles.subtitle}>
              Reconnecte-toi pour gerer tes trajets et reservations.
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            <View style={styles.field}>
              <Text style={styles.label}>Adresse email</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="mail-outline" size={18} color={Colors.textMuted} />
                <TextInput
                  style={styles.input}
                  placeholder="etu@campusride.ma"
                  placeholderTextColor={Colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Mot de passe</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} />
                <TextInput
                  style={styles.input}
                  placeholder="Votre mot de passe"
                  placeholderTextColor={Colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={Colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color={Colors.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <GradientButton
              title={loading ? 'Connexion...' : 'Se connecter'}
              onPress={handleLogin}
              disabled={loading}
              style={{ marginTop: Spacing.lg }}
            />

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google */}
            <TouchableOpacity style={styles.googleBtn}>
              <Text style={styles.googleMark}>G</Text>
              <Text style={styles.googleText}>Continuer avec Google</Text>
            </TouchableOpacity>

            {/* Demo mode */}
            <TouchableOpacity
              style={[styles.googleBtn, { marginTop: Spacing.sm, borderColor: Colors.accent + '44' }]}
              onPress={() => navigation.navigate('MainTabs')}
            >
              <Ionicons name="flash" size={18} color={Colors.accent} />
              <Text style={[styles.googleText, { color: Colors.accent }]}>Mode Demo (sans compte)</Text>
            </TouchableOpacity>
          </View>

          {/* Footer link */}
          <TouchableOpacity style={styles.footerLink} onPress={() => navigation.navigate('Register')}>
            <Text style={styles.footerText}>Je n'ai pas de compte</Text>
            <Ionicons name="arrow-forward" size={14} color={Colors.primary} />
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.huge,
    paddingBottom: Spacing.xxxl,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xxl,
  },
  backText: { color: Colors.textSecondary, fontSize: FontSize.md },
  header: { alignItems: 'center', marginBottom: Spacing.xxl },
  logo: { width: 56, height: 56, marginBottom: Spacing.md },
  eyebrow: { color: Colors.primary, fontSize: FontSize.sm, fontWeight: '600', letterSpacing: 1 },
  title: { color: Colors.text, fontSize: FontSize.xxxl, fontWeight: '800', marginTop: 4 },
  subtitle: { color: Colors.textSecondary, fontSize: FontSize.md, textAlign: 'center', marginTop: Spacing.sm },
  card: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xxl,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.medium,
  },
  field: { marginBottom: Spacing.lg },
  label: { color: Colors.textSecondary, fontSize: FontSize.sm, fontWeight: '500', marginBottom: Spacing.sm },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundElevated,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  input: { flex: 1, color: Colors.text, fontSize: FontSize.md },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.danger + '15',
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  errorText: { color: Colors.danger, fontSize: FontSize.sm, flex: 1 },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { color: Colors.textMuted, fontSize: FontSize.sm, marginHorizontal: Spacing.md },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundElevated,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  googleMark: { color: Colors.primary, fontSize: FontSize.xl, fontWeight: '700' },
  googleText: { color: Colors.text, fontSize: FontSize.md, fontWeight: '500' },
  footerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xxl,
    gap: Spacing.xs,
  },
  footerText: { color: Colors.primary, fontSize: FontSize.md, fontWeight: '500' },
});
