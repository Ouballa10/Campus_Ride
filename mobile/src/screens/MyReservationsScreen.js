import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../utils/theme';
import Avatar from '../components/Avatar';
import StatusBadge from '../components/StatusBadge';
import { reservations } from '../data/mockData';

function ReservationCard({ reservation }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardRoute}>{reservation.route}</Text>
          <Text style={styles.cardDate}>{reservation.date} - {reservation.time}</Text>
        </View>
        <StatusBadge status={reservation.status} />
      </View>

      {/* Timeline */}
      <View style={styles.timeline}>
        {['Demande', 'Validation', 'Trajet'].map((step, i) => {
          const isActive = i === 0 ||
            (i === 1 && ['Confirmee', 'Terminee'].includes(reservation.status)) ||
            (i === 2 && reservation.status === 'Terminee');
          return (
            <View key={step} style={styles.timelineStep}>
              <View style={[styles.timelineDot, isActive && styles.timelineDotActive]} />
              <Text style={[styles.timelineText, isActive && styles.timelineTextActive]}>{step}</Text>
            </View>
          );
        })}
      </View>

      {/* Driver */}
      <View style={styles.driverRow}>
        <Avatar initials={reservation.driverInitials} size={36} />
        <View style={{ flex: 1 }}>
          <Text style={styles.driverName}>{reservation.driver}</Text>
          <Text style={styles.driverPickup}>
            <Ionicons name="location" size={12} color={Colors.accent} /> {reservation.pickup}
          </Text>
        </View>
        <Text style={styles.price}>{reservation.price} DH</Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="eye-outline" size={14} color={Colors.primary} />
          <Text style={styles.actionText}>Details</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="call-outline" size={14} color={Colors.accent} />
          <Text style={[styles.actionText, { color: Colors.accent }]}>Contact</Text>
        </TouchableOpacity>
        {['En attente', 'Confirmee'].includes(reservation.status) && (
          <TouchableOpacity style={[styles.actionBtn, styles.actionDanger]}>
            <Ionicons name="close-outline" size={14} color={Colors.danger} />
            <Text style={[styles.actionText, { color: Colors.danger }]}>Annuler</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export default function MyReservationsScreen() {
  const confirmed = reservations.filter(r => r.status === 'Confirmee');
  const pending = reservations.filter(r => r.status === 'En attente');
  const history = reservations.filter(r => ['Terminee', 'Annulee', 'Refusee'].includes(r.status));

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero */}
      <LinearGradient colors={[Colors.backgroundCard, Colors.backgroundElevated]} style={styles.hero}>
        <Text style={styles.heroEyebrow}>Passager</Text>
        <Text style={styles.heroTitle}>Mes reservations</Text>
        <Text style={styles.heroSub}>Suis le statut de chaque demande et garde le contact.</Text>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statVal}>{reservations.length}</Text>
            <Text style={styles.statLabel}>total</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statVal}>{confirmed.length}</Text>
            <Text style={styles.statLabel}>confirmees</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statVal}>{pending.length}</Text>
            <Text style={styles.statLabel}>en attente</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Lists */}
      {pending.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>En attente ({pending.length})</Text>
          {pending.map(r => <ReservationCard key={r.id} reservation={r} />)}
        </View>
      )}

      {confirmed.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Confirmees ({confirmed.length})</Text>
          {confirmed.map(r => <ReservationCard key={r.id} reservation={r} />)}
        </View>
      )}

      {history.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Historique ({history.length})</Text>
          {history.map(r => <ReservationCard key={r.id} reservation={r} />)}
        </View>
      )}

      {reservations.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="bookmark-outline" size={44} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>Aucune reservation</Text>
          <Text style={styles.emptyText}>Reserve un trajet pour le voir ici.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  hero: {
    margin: Spacing.lg, borderRadius: BorderRadius.xl, padding: Spacing.xl,
    borderWidth: 1, borderColor: Colors.border,
  },
  heroEyebrow: { color: Colors.primary, fontSize: FontSize.xs, fontWeight: '600', letterSpacing: 1 },
  heroTitle: { color: Colors.text, fontSize: FontSize.xxl, fontWeight: '800', marginTop: 4 },
  heroSub: { color: Colors.textSecondary, fontSize: FontSize.sm, marginTop: 4 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: Spacing.xl },
  stat: { alignItems: 'center' },
  statVal: { color: Colors.text, fontSize: FontSize.xl, fontWeight: '700' },
  statLabel: { color: Colors.textMuted, fontSize: FontSize.xs },
  section: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.xl },
  sectionTitle: { color: Colors.textSecondary, fontSize: FontSize.sm, fontWeight: '600', marginBottom: Spacing.md },
  card: {
    backgroundColor: Colors.backgroundCard, borderRadius: BorderRadius.lg, padding: Spacing.lg,
    borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.md, ...Shadow.small,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.md },
  cardRoute: { color: Colors.text, fontSize: FontSize.md, fontWeight: '700' },
  cardDate: { color: Colors.textMuted, fontSize: FontSize.sm, marginTop: 2 },
  timeline: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.lg, paddingHorizontal: Spacing.md },
  timelineStep: { alignItems: 'center', gap: 4 },
  timelineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.border },
  timelineDotActive: { backgroundColor: Colors.accent },
  timelineText: { color: Colors.textMuted, fontSize: FontSize.xs },
  timelineTextActive: { color: Colors.accent },
  driverRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  driverName: { color: Colors.text, fontSize: FontSize.md, fontWeight: '600' },
  driverPickup: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 2 },
  price: { color: Colors.primaryLight, fontSize: FontSize.md, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: Spacing.sm },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.backgroundElevated, paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs, borderRadius: BorderRadius.sm,
  },
  actionDanger: { backgroundColor: Colors.danger + '15' },
  actionText: { color: Colors.primary, fontSize: FontSize.xs, fontWeight: '500' },
  emptyState: { alignItems: 'center', paddingVertical: Spacing.huge },
  emptyTitle: { color: Colors.text, fontSize: FontSize.lg, fontWeight: '600', marginTop: Spacing.lg },
  emptyText: { color: Colors.textMuted, fontSize: FontSize.sm, marginTop: Spacing.sm },
});
