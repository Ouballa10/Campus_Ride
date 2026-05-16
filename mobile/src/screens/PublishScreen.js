import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../utils/theme';
import GradientButton from '../components/GradientButton';

export default function PublishScreen({ navigation }) {
  const [form, setForm] = useState({
    depart: '',
    destination: 'UPM',
    date: '',
    time: '07:30',
    seats: 3,
    price: 18,
    durationMinutes: 30,
    pickupNote: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  function update(key, val) {
    setForm(f => ({ ...f, [key]: val }));
  }

  function adjustNumber(field, delta, min, max) {
    setForm(f => ({ ...f, [field]: Math.min(max, Math.max(min, f[field] + delta)) }));
  }

  function handlePublish() {
    if (!form.depart.trim() || !form.destination.trim()) {
      Alert.alert('Erreur', 'Le depart et la destination sont obligatoires.');
      return;
    }
    Alert.alert('Publie!', 'Ton trajet est maintenant visible pour les passagers.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Publier un trajet</Text>
        <Text style={styles.subtitle}>Cree une offre claire et reservable</Text>
      </View>

      {/* Route Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="navigate" size={18} color={Colors.accent} />
          <Text style={styles.sectionTitle}>Itineraire</Text>
        </View>

        <View style={styles.fieldGroup}>
          <View style={styles.inputWrap}>
            <Ionicons name="location-outline" size={18} color={Colors.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="Point de depart (ex: Gueliz)"
              placeholderTextColor={Colors.textMuted}
              value={form.depart}
              onChangeText={(v) => update('depart', v)}
            />
          </View>
          <View style={styles.inputWrap}>
            <Ionicons name="flag-outline" size={18} color={Colors.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="Destination (ex: UPM)"
              placeholderTextColor={Colors.textMuted}
              value={form.destination}
              onChangeText={(v) => update('destination', v)}
            />
          </View>
          <View style={styles.inputWrap}>
            <Ionicons name="pin-outline" size={18} color={Colors.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="Point de rendez-vous exact"
              placeholderTextColor={Colors.textMuted}
              value={form.pickupNote}
              onChangeText={(v) => update('pickupNote', v)}
            />
          </View>
        </View>
      </View>

      {/* Schedule Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="time" size={18} color={Colors.primary} />
          <Text style={styles.sectionTitle}>Horaire et places</Text>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputWrap, { flex: 1 }]}>
            <Ionicons name="calendar-outline" size={18} color={Colors.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="Date (YYYY-MM-DD)"
              placeholderTextColor={Colors.textMuted}
              value={form.date}
              onChangeText={(v) => update('date', v)}
            />
          </View>
          <View style={[styles.inputWrap, { flex: 1 }]}>
            <Ionicons name="time-outline" size={18} color={Colors.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="Heure (HH:MM)"
              placeholderTextColor={Colors.textMuted}
              value={form.time}
              onChangeText={(v) => update('time', v)}
            />
          </View>
        </View>

        {/* Steppers */}
        <View style={styles.stepperRow}>
          <View style={styles.stepper}>
            <Text style={styles.stepperLabel}>Places</Text>
            <View style={styles.stepperControls}>
              <TouchableOpacity style={styles.stepperBtn} onPress={() => adjustNumber('seats', -1, 1, 8)}>
                <Ionicons name="remove" size={18} color={Colors.text} />
              </TouchableOpacity>
              <Text style={styles.stepperValue}>{form.seats}</Text>
              <TouchableOpacity style={styles.stepperBtn} onPress={() => adjustNumber('seats', 1, 1, 8)}>
                <Ionicons name="add" size={18} color={Colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.stepper}>
            <Text style={styles.stepperLabel}>Prix (DH)</Text>
            <View style={styles.stepperControls}>
              <TouchableOpacity style={styles.stepperBtn} onPress={() => adjustNumber('price', -2, 0, 200)}>
                <Ionicons name="remove" size={18} color={Colors.text} />
              </TouchableOpacity>
              <Text style={styles.stepperValue}>{form.price}</Text>
              <TouchableOpacity style={styles.stepperBtn} onPress={() => adjustNumber('price', 2, 0, 200)}>
                <Ionicons name="add" size={18} color={Colors.text} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Description */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="chatbubble-outline" size={18} color={Colors.warning} />
          <Text style={styles.sectionTitle}>Description</Text>
        </View>
        <TextInput
          style={styles.textarea}
          placeholder="Ex: Je pars a l'heure, trajet direct vers le campus..."
          placeholderTextColor={Colors.textMuted}
          value={form.description}
          onChangeText={(v) => update('description', v)}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      {/* Preview */}
      <LinearGradient colors={[Colors.primary + '15', Colors.accent + '10']} style={styles.preview}>
        <Text style={styles.previewTitle}>Apercu</Text>
        <View style={styles.previewRow}>
          <View style={styles.previewStat}>
            <Text style={styles.previewVal}>{form.seats}</Text>
            <Text style={styles.previewLabel}>places</Text>
          </View>
          <View style={styles.previewStat}>
            <Text style={styles.previewVal}>{form.price * form.seats} DH</Text>
            <Text style={styles.previewLabel}>max</Text>
          </View>
          <View style={styles.previewStat}>
            <Text style={styles.previewVal}>{form.durationMinutes}</Text>
            <Text style={styles.previewLabel}>min</Text>
          </View>
        </View>
      </LinearGradient>

      {/* CTA */}
      <View style={styles.ctaSection}>
        <GradientButton
          title={loading ? 'Publication...' : 'Publier maintenant'}
          onPress={handlePublish}
          disabled={loading}
          icon={<Ionicons name="rocket" size={16} color="#fff" />}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: Spacing.xl, paddingTop: Spacing.lg },
  title: { color: Colors.text, fontSize: FontSize.xxl, fontWeight: '800' },
  subtitle: { color: Colors.textSecondary, fontSize: FontSize.sm, marginTop: 2 },
  section: {
    marginHorizontal: Spacing.lg, marginBottom: Spacing.xl,
    backgroundColor: Colors.backgroundCard, borderRadius: BorderRadius.lg,
    padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.lg },
  sectionTitle: { color: Colors.text, fontSize: FontSize.md, fontWeight: '700' },
  fieldGroup: { gap: Spacing.sm },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.backgroundElevated,
    borderRadius: BorderRadius.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    borderWidth: 1, borderColor: Colors.border, gap: Spacing.sm,
  },
  input: { flex: 1, color: Colors.text, fontSize: FontSize.md },
  row: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  stepperRow: { flexDirection: 'row', gap: Spacing.md },
  stepper: {
    flex: 1, backgroundColor: Colors.backgroundElevated, borderRadius: BorderRadius.md,
    padding: Spacing.md, alignItems: 'center',
  },
  stepperLabel: { color: Colors.textMuted, fontSize: FontSize.xs, marginBottom: Spacing.sm },
  stepperControls: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  stepperBtn: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.primary + '33',
    alignItems: 'center', justifyContent: 'center',
  },
  stepperValue: { color: Colors.text, fontSize: FontSize.xl, fontWeight: '700' },
  textarea: {
    color: Colors.text, fontSize: FontSize.md, backgroundColor: Colors.backgroundElevated,
    borderRadius: BorderRadius.md, padding: Spacing.md, minHeight: 100,
    borderWidth: 1, borderColor: Colors.border,
  },
  preview: {
    marginHorizontal: Spacing.lg, marginBottom: Spacing.xl, borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  previewTitle: { color: Colors.text, fontSize: FontSize.sm, fontWeight: '600', marginBottom: Spacing.md },
  previewRow: { flexDirection: 'row', justifyContent: 'space-around' },
  previewStat: { alignItems: 'center' },
  previewVal: { color: Colors.text, fontSize: FontSize.xl, fontWeight: '700' },
  previewLabel: { color: Colors.textMuted, fontSize: FontSize.xs },
  ctaSection: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxxl },
});
