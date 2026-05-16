import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Image,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../utils/theme';
import GradientButton from '../components/GradientButton';
import { useAuth } from '../context/AuthContext';

export default function RegisterScreen({ navigation }) {
  const { signUp, isConfigured } = useAuth();
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', password: '', confirmPassword: '', mode: 'passenger',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function update(key, val) {
    setForm(f => ({ ...f, [key]: val }));
    if (error) setError('');
  }

  async function handleRegister() {
    if (form.password !== form.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (!isConfigured) {
      setError('Configure Supabase dans .env');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const data = await signUp({
        email: form.email.trim(),
        password: form.password,
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        role: form.mode === 'driver' ? 'conducteur' : 'passager',
      });
      if (!data.session) {
        setSuccess('Compte cree! Verifie ton email pour confirmer.');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient colors={[Colors.background, '#0a0a1a']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color={Colors.textSecondary} />
            <Text style={styles.backText}>Retour</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Image source={require('../../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
            <Text style={styles.eyebrow}>CampusRide</Text>
            <Text style={styles.title}>Creer un compte</Text>
          </View>

          {/* Mode Switch */}
          <View style={styles.modeSwitch}>
            <TouchableOpacity
              style={[styles.modeBtn, form.mode === 'passenger' && styles.modeBtnActive]}
              onPress={() => update('mode', 'passenger')}
            >
              <Ionicons name="person" size={16} color={form.mode === 'passenger' ? Colors.text : Colors.textMuted} />
              <Text style={[styles.modeBtnText, form.mode === 'passenger' && styles.modeBtnTextActive]}>Passager</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeBtn, form.mode === 'driver' && styles.modeBtnActive]}
              onPress={() => update('mode', 'driver')}
            >
              <Ionicons name="car" size={16} color={form.mode === 'driver' ? Colors.text : Colors.textMuted} />
              <Text style={[styles.modeBtnText, form.mode === 'driver' && styles.modeBtnTextActive]}>Driver</Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.card}>
            {[
              { key: 'fullName', label: 'Nom complet', icon: 'person-outline', placeholder: 'Nom et prenom', type: 'default' },
              { key: 'email', label: 'Email', icon: 'mail-outline', placeholder: 'etu@campusride.ma', type: 'email-address' },
              { key: 'phone', label: 'Telephone', icon: 'call-outline', placeholder: '+212 6 00 00 00 00', type: 'phone-pad' },
              { key: 'password', label: 'Mot de passe', icon: 'lock-closed-outline', placeholder: 'Min 6 caracteres', type: 'default', secure: true },
              { key: 'confirmPassword', label: 'Confirmer', icon: 'lock-closed-outline', placeholder: 'Retape le mot de passe', type: 'default', secure: true },
            ].map(field => (
              <View key={field.key} style={styles.field}>
                <Text style={styles.label}>{field.label}</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name={field.icon} size={18} color={Colors.textMuted} />
                  <TextInput
                    style={styles.input}
                    placeholder={field.placeholder}
                    placeholderTextColor={Colors.textMuted}
                    value={form[field.key]}
                    onChangeText={(v) => update(field.key, v)}
                    keyboardType={field.type}
                    autoCapitalize={field.key === 'email' ? 'none' : 'words'}
                    secureTextEntry={field.secure}
                  />
                </View>
              </View>
            ))}

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color={Colors.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {success ? (
              <View style={[styles.errorBox, { backgroundColor: Colors.success + '15' }]}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                <Text style={[styles.errorText, { color: Colors.success }]}>{success}</Text>
              </View>
            ) : null}

            <GradientButton
              title={loading ? 'Creation...' : 'Creer mon compte'}
              onPress={handleRegister}
              disabled={loading}
              style={{ marginTop: Spacing.lg }}
            />
          </View>

          <TouchableOpacity style={styles.footerLink} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerText}>J'ai deja un compte</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: Spacing.xxl, paddingTop: Spacing.huge, paddingBottom: Spacing.xxxl },
  back: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xl },
  backText: { color: Colors.textSecondary, fontSize: FontSize.md },
  header: { alignItems: 'center', marginBottom: Spacing.xl },
  logo: { width: 48, height: 48, marginBottom: Spacing.sm },
  eyebrow: { color: Colors.primary, fontSize: FontSize.sm, fontWeight: '600', letterSpacing: 1 },
  title: { color: Colors.text, fontSize: FontSize.xxl, fontWeight: '800', marginTop: 4 },
  modeSwitch: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xs,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: Spacing.md, borderRadius: BorderRadius.md, gap: Spacing.xs,
  },
  modeBtnActive: { backgroundColor: Colors.primary },
  modeBtnText: { color: Colors.textMuted, fontSize: FontSize.md, fontWeight: '600' },
  modeBtnTextActive: { color: Colors.text },
  card: {
    backgroundColor: Colors.backgroundCard, borderRadius: BorderRadius.xl,
    padding: Spacing.xxl, borderWidth: 1, borderColor: Colors.border, ...Shadow.medium,
  },
  field: { marginBottom: Spacing.md },
  label: { color: Colors.textSecondary, fontSize: FontSize.sm, fontWeight: '500', marginBottom: Spacing.xs },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.backgroundElevated,
    borderRadius: BorderRadius.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    borderWidth: 1, borderColor: Colors.border, gap: Spacing.sm,
  },
  input: { flex: 1, color: Colors.text, fontSize: FontSize.md },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.danger + '15', borderRadius: BorderRadius.sm, padding: Spacing.md, marginTop: Spacing.sm,
  },
  errorText: { color: Colors.danger, fontSize: FontSize.sm, flex: 1 },
  footerLink: { alignItems: 'center', marginTop: Spacing.xl },
  footerText: { color: Colors.primary, fontSize: FontSize.md, fontWeight: '500' },
});
