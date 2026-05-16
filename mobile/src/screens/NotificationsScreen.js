import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, FontSize, BorderRadius } from '../utils/theme';
import { reservations } from '../data/mockData';

function getNotifData(reservation) {
  if (reservation.status === 'Confirmee') {
    return { icon: 'checkmark-circle', color: Colors.success, title: 'Reservation acceptee' };
  }
  if (reservation.status === 'En attente') {
    return { icon: 'time', color: Colors.warning, title: 'Demande envoyee' };
  }
  return { icon: 'information-circle', color: Colors.textMuted, title: 'Reservation mise a jour' };
}

export default function NotificationsScreen() {
  const notifications = reservations.map(r => ({
    ...getNotifData(r),
    id: r.id,
    message: `${r.driver} - ${r.route}`,
    time: `${r.date} - ${r.time}`,
    pickup: r.pickup,
    status: r.status,
  }));

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={[Colors.backgroundCard, Colors.backgroundElevated]} style={styles.hero}>
        <Text style={styles.heroEyebrow}>Centre d'activite</Text>
        <Text style={styles.heroTitle}>Notifications</Text>
        <Text style={styles.heroSub}>Messages, demandes et changements de statut.</Text>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statVal}>{notifications.length}</Text>
            <Text style={styles.statLabel}>total</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statVal}>{notifications.filter(n => n.status === 'En attente').length}</Text>
            <Text style={styles.statLabel}>en attente</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statVal}>{notifications.filter(n => n.status === 'Confirmee').length}</Text>
            <Text style={styles.statLabel}>confirmees</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.list}>
        {notifications.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={44} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>Aucune notification</Text>
          </View>
        ) : (
          notifications.map(notif => (
            <View key={notif.id} style={styles.notifCard}>
              <View style={[styles.iconWrap, { backgroundColor: notif.color + '22' }]}>
                <Ionicons name={notif.icon} size={20} color={notif.color} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.notifTop}>
                  <Text style={styles.notifTitle}>{notif.title}</Text>
                  <Text style={styles.notifTime}>{notif.time}</Text>
                </View>
                <Text style={styles.notifMessage}>{notif.message}</Text>
                {notif.pickup && <Text style={styles.notifNote}>{notif.pickup}</Text>}
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
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: Spacing.xl },
  stat: { alignItems: 'center' },
  statVal: { color: Colors.text, fontSize: FontSize.xl, fontWeight: '700' },
  statLabel: { color: Colors.textMuted, fontSize: FontSize.xs },
  list: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxxl },
  notifCard: {
    flexDirection: 'row', gap: Spacing.md,
    backgroundColor: Colors.backgroundCard, borderRadius: BorderRadius.lg, padding: Spacing.lg,
    borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.sm,
  },
  iconWrap: {
    width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center',
  },
  notifTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  notifTitle: { color: Colors.text, fontSize: FontSize.md, fontWeight: '600' },
  notifTime: { color: Colors.textMuted, fontSize: FontSize.xs },
  notifMessage: { color: Colors.textSecondary, fontSize: FontSize.sm, marginTop: 2 },
  notifNote: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 4 },
  empty: { alignItems: 'center', paddingVertical: Spacing.huge },
  emptyTitle: { color: Colors.text, fontSize: FontSize.lg, fontWeight: '600', marginTop: Spacing.lg },
});
