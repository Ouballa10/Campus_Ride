import React from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../utils/theme';
import TripCard from '../components/TripCard';
import { tripOptions, currentUser, reservations, publishedTrips } from '../data/mockData';

export default function HomeScreen({ navigation }) {
  const [mode, setMode] = React.useState('passenger');
  const isDriver = mode === 'driver';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Card */}
      <LinearGradient
        colors={[Colors.backgroundCard, Colors.backgroundElevated]}
        style={styles.heroCard}
      >
        <View style={styles.heroTop}>
          <Image source={require('../../assets/images/logo.png')} style={styles.heroLogo} resizeMode="contain" />
          <View style={{ flex: 1 }}>
            <View style={styles.modeBanner}>
              <Ionicons name={isDriver ? 'car' : 'person'} size={14} color={Colors.accent} />
              <Text style={styles.modeBannerText}>
                {isDriver ? 'Mode driver' : 'Mode passager'}
              </Text>
            </View>
            <Text style={styles.heroTitle}>
              {isDriver ? 'Espace Driver' : 'CampusRide'}
            </Text>
            <Text style={styles.heroSubtitle}>
              {isDriver
                ? 'Publie et gere tes trajets sans stress.'
                : 'Trouve un trajet campus propre et rapide.'}
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{isDriver ? publishedTrips.length : tripOptions.length}</Text>
            <Text style={styles.statLabel}>{isDriver ? 'annonces' : 'trajets'}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{reservations.length}</Text>
            <Text style={styles.statLabel}>reservations</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{currentUser.rating}</Text>
            <Text style={styles.statLabel}>note</Text>
          </View>
        </View>

        {/* Mode Switch */}
        <View style={styles.modeSwitch}>
          <TouchableOpacity
            style={[styles.modeBtn, !isDriver && styles.modeBtnActive]}
            onPress={() => setMode('passenger')}
          >
            <Ionicons name="person" size={15} color={!isDriver ? '#fff' : Colors.textMuted} />
            <Text style={[styles.modeBtnText, !isDriver && { color: '#fff' }]}>Passager</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, isDriver && styles.modeBtnActive]}
            onPress={() => setMode('driver')}
          >
            <Ionicons name="car" size={15} color={isDriver ? '#fff' : Colors.textMuted} />
            <Text style={[styles.modeBtnText, isDriver && { color: '#fff' }]}>Driver</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Quick Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionCard, { borderColor: Colors.accent + '44' }]}
          onPress={() => navigation.navigate(isDriver ? 'Publish' : 'Search')}
        >
          <LinearGradient colors={[Colors.accent + '22', 'transparent']} style={styles.actionIcon}>
            <Ionicons name={isDriver ? 'add-circle' : 'search'} size={24} color={Colors.accent} />
          </LinearGradient>
          <Text style={styles.actionTitle}>{isDriver ? 'Publier' : 'Rechercher'}</Text>
          <Text style={styles.actionSub}>{isDriver ? 'Nouveau trajet' : 'Trouver un trajet'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { borderColor: Colors.warning + '44' }]}
          onPress={() => navigation.navigate(isDriver ? 'MyTrips' : 'MyReservations')}
        >
          <LinearGradient colors={[Colors.warning + '22', 'transparent']} style={styles.actionIcon}>
            <Ionicons name={isDriver ? 'map' : 'bookmark'} size={24} color={Colors.warning} />
          </LinearGradient>
          <Text style={styles.actionTitle}>{isDriver ? 'Mes trajets' : 'Reservations'}</Text>
          <Text style={styles.actionSub}>{isDriver ? 'Gerer' : 'Mes demandes'}</Text>
        </TouchableOpacity>
      </View>

      {/* Section: Available Trips */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              {isDriver ? 'Mes annonces' : 'Trajets disponibles'}
            </Text>
            <Text style={styles.sectionSub}>
              {isDriver ? 'Tes prochains departs.' : 'Departs verifies autour du campus.'}
            </Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate(isDriver ? 'MyTrips' : 'Search')}>
            <Text style={styles.seeAll}>Voir tout</Text>
          </TouchableOpacity>
        </View>

        {tripOptions.slice(0, 3).map(trip => (
          <TripCard
            key={trip.id}
            trip={trip}
            ctaLabel="Voir"
            onPress={() => navigation.navigate('Reservation', { trip })}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  heroCard: {
    margin: Spacing.lg,
    marginTop: Spacing.xl,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.large,
  },
  heroTop: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.lg, marginBottom: Spacing.xl },
  heroLogo: { width: 48, height: 48 },
  modeBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.accent + '15', alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.full,
  },
  modeBannerText: { color: Colors.accent, fontSize: FontSize.xs, fontWeight: '600' },
  heroTitle: { color: Colors.text, fontSize: FontSize.xxl, fontWeight: '800', marginTop: 4 },
  heroSubtitle: { color: Colors.textSecondary, fontSize: FontSize.sm, marginTop: 4 },
  statsRow: {
    flexDirection: 'row', justifyContent: 'space-around',
    backgroundColor: Colors.backgroundElevated, borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md, marginBottom: Spacing.lg,
  },
  statItem: { alignItems: 'center' },
  statValue: { color: Colors.text, fontSize: FontSize.xl, fontWeight: '700' },
  statLabel: { color: Colors.textMuted, fontSize: FontSize.xs },
  modeSwitch: {
    flexDirection: 'row', backgroundColor: Colors.background,
    borderRadius: BorderRadius.md, padding: 3,
  },
  modeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: Spacing.sm, borderRadius: BorderRadius.sm, gap: 4,
  },
  modeBtnActive: { backgroundColor: Colors.primary },
  modeBtnText: { color: Colors.textMuted, fontSize: FontSize.sm, fontWeight: '600' },
  actionsRow: {
    flexDirection: 'row', gap: Spacing.md,
    paddingHorizontal: Spacing.lg, marginBottom: Spacing.xl,
  },
  actionCard: {
    flex: 1, backgroundColor: Colors.backgroundCard, borderRadius: BorderRadius.lg,
    padding: Spacing.lg, borderWidth: 1, ...Shadow.small,
  },
  actionIcon: {
    width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  actionTitle: { color: Colors.text, fontSize: FontSize.md, fontWeight: '700' },
  actionSub: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 2 },
  section: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxxl },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  sectionTitle: { color: Colors.text, fontSize: FontSize.lg, fontWeight: '700' },
  sectionSub: { color: Colors.textMuted, fontSize: FontSize.sm, marginTop: 2 },
  seeAll: { color: Colors.primary, fontSize: FontSize.sm, fontWeight: '600' },
});
