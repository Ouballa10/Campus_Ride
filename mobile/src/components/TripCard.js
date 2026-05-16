import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../utils/theme';
import Avatar from './Avatar';

export default function TripCard({ trip, onPress, ctaLabel = 'Reserver' }) {
  const isUnavailable = trip.seats <= 0;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
      disabled={isUnavailable}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.routeLabel}>{trip.routeLabel}</Text>
          <Text style={styles.time}>{trip.time}</Text>
        </View>
        <View style={styles.priceBadge}>
          <Text style={styles.priceText}>{trip.price} DH</Text>
        </View>
      </View>

      {/* Driver Info */}
      <View style={styles.driverRow}>
        <Avatar initials={trip.driverInitials} size={36} />
        <View style={styles.driverInfo}>
          <Text style={styles.driverName}>{trip.driver}</Text>
          <Text style={styles.driverCar}>{trip.car}</Text>
        </View>
      </View>

      {/* Meta chips */}
      <View style={styles.metaRow}>
        <View style={styles.chip}>
          <Ionicons name="people-outline" size={13} color={Colors.accent} />
          <Text style={styles.chipText}>{trip.seats} places</Text>
        </View>
        <View style={styles.chip}>
          <Ionicons name="time-outline" size={13} color={Colors.accent} />
          <Text style={styles.chipText}>{trip.duration}</Text>
        </View>
        <View style={styles.chip}>
          <Ionicons name="shield-checkmark-outline" size={13} color={Colors.accent} />
          <Text style={styles.chipText}>Campus</Text>
        </View>
      </View>

      {/* Pickup note */}
      <Text style={styles.pickup} numberOfLines={1}>
        <Ionicons name="location-outline" size={12} color={Colors.textMuted} /> {trip.pickup}
      </Text>

      {/* Bottom: Rating + CTA */}
      <View style={styles.bottom}>
        <View style={styles.ratingRow}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Ionicons
              key={i}
              name={i <= Math.round(trip.rating) ? 'star' : 'star-outline'}
              size={14}
              color={i <= Math.round(trip.rating) ? '#FFD700' : Colors.textMuted}
            />
          ))}
          <Text style={styles.ratingText}>{trip.rating}</Text>
        </View>
        <TouchableOpacity
          style={[styles.ctaButton, isUnavailable && styles.ctaDisabled]}
          onPress={onPress}
          disabled={isUnavailable}
        >
          <Text style={styles.ctaText}>{isUnavailable ? 'Complet' : ctaLabel}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.medium,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  routeLabel: {
    color: Colors.text,
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  time: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  priceBadge: {
    backgroundColor: Colors.primary + '22',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primary + '44',
  },
  priceText: {
    color: Colors.primaryLight,
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  driverInfo: {
    marginLeft: Spacing.md,
  },
  driverName: {
    color: Colors.text,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  driverCar: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
  },
  metaRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundElevated,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  chipText: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
  },
  pickup: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    marginBottom: Spacing.md,
  },
  bottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    marginLeft: 4,
  },
  ctaButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  ctaDisabled: {
    backgroundColor: Colors.border,
  },
  ctaText: {
    color: Colors.text,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
});
