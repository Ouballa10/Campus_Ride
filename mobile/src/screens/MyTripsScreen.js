import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../utils/theme';
import StatusBadge from '../components/StatusBadge';
import { publishedTrips } from '../data/mockData';

export default function MyTripsScreen({ navigation }) {
  const activeTrips = publishedTrips.filter(t => t.status === 'Actif').length;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero */}
      <LinearGradient colors={[Colors.backgroundCard, Colors.backgroundElevated]} style={styles.hero}>
        <Text style={styles.heroEyebrow}>Conducteur</Text>
        <Text style={styles.heroTitle}>Driver Dashboard</Text>
        <Text style={styles.heroSub}>Gere tes trajets, demandes et passagers.</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="car-sport" size={20} color={Colors.accent} />
            <Text style={styles.statVal}>{publishedTrips.length}</Text>
            <Text style={styles.statLabel}>annonces</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
            <Text style={styles.statVal}>{activeTrips}</Text>
            <Text style={styles.statLabel}>actifs</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="people" size={20} color={Colors.primary} />
            <Text style={styles.statVal}>2</Text>
            <Text style={styles.statLabel}>passagers</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Published Trips */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Mes annonces</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Publish')}>
            <View style={styles.addBtn}>
              <Ionicons name="add" size={16} color={Colors.text} />
              <Text style={styles.addBtnText}>Publier</Text>
            </View>
          </TouchableOpacity>
        </View>

        {publishedTrips.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="map-outline" size={44} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>Aucun trajet publie</Text>
            <Text style={styles.emptyText}>Publie ton premier depart!</Text>
          </View>
        ) : (
          publishedTrips.map(trip => (
            <View key={trip.id} style={styles.tripCard}>
              <View style={styles.tripTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.tripRoute}>{trip.route}</Text>
                  <Text style={styles.tripDate}>{trip.date} - {trip.time}</Text>
                </View>
                <StatusBadge status={trip.status} />
              </View>

              <View style={styles.tripMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="people-outline" size={14} color={Colors.accent} />
                  <Text style={styles.metaText}>{trip.seats}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="cash-outline" size={14} color={Colors.accent} />
                  <Text style={styles.metaText}>{trip.price} DH</Text>
                </View>
              </View>

              <Text style={styles.passengers}>{trip.passengers}</Text>

              <View style={styles.tripActions}>
                <TouchableOpacity style={styles.tripAction}>
                  <Ionicons name="create-outline" size={14} color={Colors.primary} />
                  <Text style={[styles.tripActionText, { color: Colors.primary }]}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tripAction}>
                  <Ionicons name="lock-closed-outline" size={14} color={Colors.warning} />
                  <Text style={[styles.tripActionText, { color: Colors.warning }]}>Fermer</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tripAction, styles.tripActionDanger]}>
                  <Ionicons name="trash-outline" size={14} color={Colors.danger} />
                  <Text style={[styles.tripActionText, { color: Colors.danger }]}>Supprimer</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>
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
  statsGrid: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.xl },
  statCard: {
    flex: 1, backgroundColor: Colors.backgroundElevated, borderRadius: BorderRadius.md,
    padding: Spacing.md, alignItems: 'center', gap: 4,
  },
  statVal: { color: Colors.text, fontSize: FontSize.lg, fontWeight: '700' },
  statLabel: { color: Colors.textMuted, fontSize: FontSize.xs },
  section: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxxl },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  sectionTitle: { color: Colors.text, fontSize: FontSize.lg, fontWeight: '700' },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.primary, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  addBtnText: { color: Colors.text, fontSize: FontSize.sm, fontWeight: '600' },
  tripCard: {
    backgroundColor: Colors.backgroundCard, borderRadius: BorderRadius.lg, padding: Spacing.lg,
    borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.md, ...Shadow.small,
  },
  tripTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.md },
  tripRoute: { color: Colors.text, fontSize: FontSize.md, fontWeight: '700' },
  tripDate: { color: Colors.textMuted, fontSize: FontSize.sm, marginTop: 2 },
  tripMeta: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.sm },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { color: Colors.textSecondary, fontSize: FontSize.sm },
  passengers: { color: Colors.textMuted, fontSize: FontSize.sm, marginBottom: Spacing.md },
  tripActions: { flexDirection: 'row', gap: Spacing.sm },
  tripAction: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.backgroundElevated, paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs, borderRadius: BorderRadius.sm,
  },
  tripActionDanger: { backgroundColor: Colors.danger + '15' },
  tripActionText: { fontSize: FontSize.xs, fontWeight: '500' },
  emptyState: { alignItems: 'center', paddingVertical: Spacing.huge },
  emptyTitle: { color: Colors.text, fontSize: FontSize.lg, fontWeight: '600', marginTop: Spacing.lg },
  emptyText: { color: Colors.textMuted, fontSize: FontSize.sm, marginTop: Spacing.sm },
});
