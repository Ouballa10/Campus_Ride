import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../utils/theme';
import Avatar from '../components/Avatar';
import { currentUser } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

const menuItems = [
  { id: 'trips', label: 'Mes trajets', icon: 'car-sport-outline', route: 'MyTrips', color: Colors.accent },
  { id: 'reservations', label: 'Mes reservations', icon: 'bookmark-outline', route: 'MyReservations', color: Colors.warning },
  { id: 'publish', label: 'Publier un trajet', icon: 'add-circle-outline', route: 'Publish', color: Colors.success },
  { id: 'search', label: 'Rechercher', icon: 'search-outline', route: 'Search', color: Colors.primary },
  { id: 'notifications', label: 'Notifications', icon: 'notifications-outline', route: 'Notifications', color: Colors.secondary },
];

export default function ProfileScreen({ navigation }) {
  const { signOut } = useAuth();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Hero */}
      <LinearGradient
        colors={[Colors.backgroundCard, Colors.backgroundElevated]}
        style={styles.heroCard}
      >
        <View style={styles.profileHeader}>
          <Avatar initials={currentUser.initials} size={72} />
          <View style={{ flex: 1, marginLeft: Spacing.lg }}>
            <Text style={styles.name}>{currentUser.name}</Text>
            <Text style={styles.role}>{currentUser.role}</Text>
            <View style={styles.campusBadge}>
              <Ionicons name="school" size={12} color={Colors.accent} />
              <Text style={styles.campusText}>{currentUser.campus}</Text>
            </View>
          </View>
        </View>

        {/* Rating */}
        <View style={styles.ratingRow}>
          {[1, 2, 3, 4, 5].map(i => (
            <Ionicons key={i} name={i <= Math.round(currentUser.rating) ? 'star' : 'star-outline'} size={16} color={i <= Math.round(currentUser.rating) ? '#FFD700' : Colors.textMuted} />
          ))}
          <Text style={styles.ratingVal}>{currentUser.rating}/5</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statVal}>{currentUser.tripsCount}</Text>
            <Text style={styles.statLabel}>trajets</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statVal}>{currentUser.reservationsCount}</Text>
            <Text style={styles.statLabel}>reservations</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statVal}>{currentUser.rating}</Text>
            <Text style={styles.statLabel}>note</Text>
          </View>
        </View>

        {/* Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={16} color={Colors.textMuted} />
            <Text style={styles.infoText}>{currentUser.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={16} color={Colors.textMuted} />
            <Text style={styles.infoText}>{currentUser.phone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="car-outline" size={16} color={Colors.textMuted} />
            <Text style={styles.infoText}>{currentUser.car}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Menu */}
      <View style={styles.menuSection}>
        <Text style={styles.menuTitle}>Mon espace</Text>
        {menuItems.map(item => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => navigation.navigate(item.route)}
          >
            <View style={[styles.menuIcon, { backgroundColor: item.color + '22' }]}>
              <Ionicons name={item.icon} size={20} color={item.color} />
            </View>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={signOut}>
        <Ionicons name="log-out-outline" size={18} color={Colors.danger} />
        <Text style={styles.logoutText}>Se deconnecter</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>CampusRide - UPM Marrakech</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  heroCard: {
    margin: Spacing.lg, borderRadius: BorderRadius.xl, padding: Spacing.xl,
    borderWidth: 1, borderColor: Colors.border, ...Shadow.large,
  },
  profileHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg },
  name: { color: Colors.text, fontSize: FontSize.xl, fontWeight: '800' },
  role: { color: Colors.textSecondary, fontSize: FontSize.sm, marginTop: 2 },
  campusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.accent + '15', alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.full, marginTop: 4,
  },
  campusText: { color: Colors.accent, fontSize: FontSize.xs, fontWeight: '500' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: Spacing.lg },
  ratingVal: { color: Colors.textSecondary, fontSize: FontSize.sm, marginLeft: Spacing.sm },
  statsRow: {
    flexDirection: 'row', justifyContent: 'space-around',
    backgroundColor: Colors.backgroundElevated, borderRadius: BorderRadius.md,
    paddingVertical: Spacing.lg, marginBottom: Spacing.lg,
  },
  stat: { alignItems: 'center' },
  statVal: { color: Colors.text, fontSize: FontSize.xl, fontWeight: '700' },
  statLabel: { color: Colors.textMuted, fontSize: FontSize.xs },
  infoSection: { gap: Spacing.sm },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  infoText: { color: Colors.textSecondary, fontSize: FontSize.sm },
  menuSection: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.xl },
  menuTitle: { color: Colors.text, fontSize: FontSize.lg, fontWeight: '700', marginBottom: Spacing.lg },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.backgroundCard, borderRadius: BorderRadius.lg,
    padding: Spacing.lg, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.border,
  },
  menuIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, color: Colors.text, fontSize: FontSize.md, fontWeight: '500' },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    marginHorizontal: Spacing.lg, padding: Spacing.lg,
    backgroundColor: Colors.danger + '12', borderRadius: BorderRadius.lg,
    borderWidth: 1, borderColor: Colors.danger + '33',
  },
  logoutText: { color: Colors.danger, fontSize: FontSize.md, fontWeight: '600' },
  footer: { textAlign: 'center', color: Colors.textMuted, fontSize: FontSize.xs, paddingVertical: Spacing.xxl },
});
