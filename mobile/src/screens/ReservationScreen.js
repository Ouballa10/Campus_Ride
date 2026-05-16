import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../utils/theme';
import Avatar from '../components/Avatar';
import GradientButton from '../components/GradientButton';

export default function ReservationScreen({ route, navigation }) {
  const { trip } = route.params || {};
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  if (!trip) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="car-outline" size={48} color={Colors.textMuted} />
        <Text style={styles.emptyText}>Selectionne un trajet d'abord</Text>
      </View>
    );
  }

  function handleReserve() {
    Alert.alert('Reservation envoyee!', 'Le conducteur sera notifie de ta demande.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Trip Detail Card */}
      <LinearGradient
        colors={[Colors.backgroundCard, Colors.backgroundElevated]}
        style={styles.detailCard}
      >
        {/* Driver section */}
        <View style={styles.driverSection}>
          <Avatar initials={trip.driverInitials} size={56} />
          <View style={{ flex: 1 }}>
            <Text style={styles.driverName}>{trip.driver}</Text>
            <Text style={styles.driverRole}>{trip.role}</Text>
            <Text style={styles.driverCar}>{trip.car}</Text>
          </View>
          <View style={styles.priceBadge}>
            <Text style={styles.priceText}>{trip.price} DH</Text>
          </View>
        </View>

        {/* Rating */}
        <View style={styles.ratingRow}>
          {[1, 2, 3, 4, 5].map(i => (
            <Ionicons key={i} name={i <= Math.round(trip.rating) ? 'star' : 'star-outline'} size={16} color={i <= Math.round(trip.rating) ? '#FFD700' : Colors.textMuted} />
          ))}
          <Text style={styles.ratingVal}>{trip.rating}/5</Text>
        </View>

        {/* Meta */}
        <View style={styles.metaGrid}>
          <View style={styles.metaItem}>
            <Ionicons name="people-outline" size={16} color={Colors.accent} />
            <Text style={styles.metaText}>{trip.seats} places</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={16} color={Colors.accent} />
            <Text style={styles.metaText}>{trip.duration}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={16} color={Colors.accent} />
            <Text style={styles.metaText}>{trip.pickup}</Text>
          </View>
        </View>

        {/* Route Visual */}
        <View style={styles.routeVisual}>
          <View style={styles.routeStop}>
            <View style={[styles.routeDot, { backgroundColor: Colors.accent }]} />
            <View>
              <Text style={styles.routeLabel}>Depart</Text>
              <Text style={styles.routePlace}>{trip.depart}</Text>
            </View>
          </View>
          <View style={styles.routeLine} />
          <View style={styles.routeStop}>
            <View style={[styles.routeDot, { backgroundColor: Colors.primary }]} />
            <View>
              <Text style={styles.routeLabel}>Arrivee</Text>
              <Text style={styles.routePlace}>{trip.destination}</Text>
            </View>
          </View>
        </View>

        {trip.description ? (
          <View style={styles.noteBox}>
            <Text style={styles.noteTitle}>Note conducteur</Text>
            <Text style={styles.noteText}>{trip.description}</Text>
          </View>
        ) : null}
      </LinearGradient>

      {/* Message to Driver */}
      <View style={styles.messageCard}>
        <Text style={styles.messageLabel}>Message au conducteur</Text>
        <TextInput
          style={styles.messageInput}
          placeholder="Optionnel: point de rendez-vous, bagage, info utile..."
          placeholderTextColor={Colors.textMuted}
          value={note}
          onChangeText={setNote}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      {/* CTA */}
      <View style={styles.ctaSection}>
        <GradientButton
          title={loading ? 'Envoi...' : 'Envoyer la demande'}
          onPress={handleReserve}
          disabled={loading || trip.seats <= 0}
          icon={<Ionicons name="send" size={16} color="#fff" />}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
  emptyText: { color: Colors.textMuted, fontSize: FontSize.md, marginTop: Spacing.lg },
  detailCard: {
    margin: Spacing.lg, borderRadius: BorderRadius.xl, padding: Spacing.xl,
    borderWidth: 1, borderColor: Colors.border, ...Shadow.large,
  },
  driverSection: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.lg },
  driverName: { color: Colors.text, fontSize: FontSize.lg, fontWeight: '700' },
  driverRole: { color: Colors.textSecondary, fontSize: FontSize.sm },
  driverCar: { color: Colors.textMuted, fontSize: FontSize.xs },
  priceBadge: {
    backgroundColor: Colors.primary + '22', paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.primary + '44',
  },
  priceText: { color: Colors.primaryLight, fontSize: FontSize.lg, fontWeight: '700' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: Spacing.lg },
  ratingVal: { color: Colors.textSecondary, fontSize: FontSize.sm, marginLeft: Spacing.sm },
  metaGrid: { flexDirection: 'row', gap: Spacing.md, flexWrap: 'wrap', marginBottom: Spacing.xl },
  metaItem: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.backgroundElevated, paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm, borderRadius: BorderRadius.sm,
  },
  metaText: { color: Colors.textSecondary, fontSize: FontSize.sm },
  routeVisual: { marginBottom: Spacing.lg },
  routeStop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  routeDot: { width: 12, height: 12, borderRadius: 6 },
  routeLine: { width: 2, height: 24, backgroundColor: Colors.border, marginLeft: 5, marginVertical: 4 },
  routeLabel: { color: Colors.textMuted, fontSize: FontSize.xs },
  routePlace: { color: Colors.text, fontSize: FontSize.md, fontWeight: '600' },
  noteBox: {
    backgroundColor: Colors.backgroundElevated, borderRadius: BorderRadius.md,
    padding: Spacing.md, borderLeftWidth: 3, borderLeftColor: Colors.primary,
  },
  noteTitle: { color: Colors.textSecondary, fontSize: FontSize.xs, fontWeight: '600', marginBottom: 4 },
  noteText: { color: Colors.text, fontSize: FontSize.sm },
  messageCard: {
    marginHorizontal: Spacing.lg, marginBottom: Spacing.lg,
    backgroundColor: Colors.backgroundCard, borderRadius: BorderRadius.lg,
    padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border,
  },
  messageLabel: { color: Colors.textSecondary, fontSize: FontSize.sm, fontWeight: '600', marginBottom: Spacing.sm },
  messageInput: {
    color: Colors.text, fontSize: FontSize.md, backgroundColor: Colors.backgroundElevated,
    borderRadius: BorderRadius.md, padding: Spacing.md, minHeight: 80,
    borderWidth: 1, borderColor: Colors.border,
  },
  ctaSection: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxxl },
});
