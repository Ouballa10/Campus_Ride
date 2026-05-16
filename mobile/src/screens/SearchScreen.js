import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../utils/theme';
import TripCard from '../components/TripCard';
import { tripOptions } from '../data/mockData';

export default function SearchScreen({ navigation }) {
  const [filters, setFilters] = useState({ depart: '', destination: '', date: '', time: '' });
  const [showFilters, setShowFilters] = useState(false);

  const filtered = tripOptions.filter(trip => {
    const d = filters.depart.toLowerCase();
    const dest = filters.destination.toLowerCase();
    if (d && !trip.depart.toLowerCase().includes(d)) return false;
    if (dest && !trip.destination.toLowerCase().includes(dest)) return false;
    return true;
  });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <Text style={styles.title}>Recherche</Text>
        <Text style={styles.subtitle}>Trouve ton trajet campus ideal</Text>

        {/* Main Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={Colors.primary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Depart (ex: Gueliz, Semlalia...)"
            placeholderTextColor={Colors.textMuted}
            value={filters.depart}
            onChangeText={(v) => setFilters(f => ({ ...f, depart: v }))}
          />
          <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
            <Ionicons name="options-outline" size={20} color={Colors.accent} />
          </TouchableOpacity>
        </View>

        {/* Destination filter */}
        <View style={styles.searchBar}>
          <Ionicons name="location-outline" size={18} color={Colors.accent} />
          <TextInput
            style={styles.searchInput}
            placeholder="Destination (ex: UPM)"
            placeholderTextColor={Colors.textMuted}
            value={filters.destination}
            onChangeText={(v) => setFilters(f => ({ ...f, destination: v }))}
          />
        </View>
      </View>

      {/* Quick Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
        {['Campus', 'Gueliz', 'Semlalia', 'Marrakech', 'Budget'].map(chip => (
          <TouchableOpacity
            key={chip}
            style={styles.chip}
            onPress={() => setFilters(f => ({ ...f, depart: chip === 'Campus' ? '' : chip }))}
          >
            <Text style={styles.chipText}>{chip}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results Summary */}
      <View style={styles.resultSummary}>
        <View style={styles.resultLeft}>
          <Ionicons name="car-sport" size={18} color={Colors.primary} />
          <Text style={styles.resultCount}>{filtered.length} trajets</Text>
        </View>
        <TouchableOpacity onPress={() => setFilters({ depart: '', destination: '', date: '', time: '' })}>
          <Text style={styles.resetText}>Reinitialiser</Text>
        </TouchableOpacity>
      </View>

      {/* Results */}
      <View style={styles.results}>
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={44} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>Aucun trajet trouve</Text>
            <Text style={styles.emptyText}>Essaie une autre zone ou reinitialise.</Text>
          </View>
        ) : (
          filtered.map(trip => (
            <TripCard
              key={trip.id}
              trip={trip}
              onPress={() => navigation.navigate('Reservation', { trip })}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  searchHeader: {
    padding: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  title: { color: Colors.text, fontSize: FontSize.xxl, fontWeight: '800' },
  subtitle: { color: Colors.textSecondary, fontSize: FontSize.sm, marginTop: 2, marginBottom: Spacing.lg },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  searchInput: { flex: 1, color: Colors.text, fontSize: FontSize.md },
  chipScroll: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg },
  chip: {
    backgroundColor: Colors.primary + '22',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.primary + '44',
  },
  chipText: { color: Colors.primaryLight, fontSize: FontSize.sm, fontWeight: '500' },
  resultSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  resultLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  resultCount: { color: Colors.text, fontSize: FontSize.md, fontWeight: '600' },
  resetText: { color: Colors.accent, fontSize: FontSize.sm, fontWeight: '500' },
  results: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxxl },
  empty: {
    alignItems: 'center', paddingVertical: Spacing.huge,
    backgroundColor: Colors.backgroundCard, borderRadius: BorderRadius.xl, padding: Spacing.xxxl,
  },
  emptyTitle: { color: Colors.text, fontSize: FontSize.lg, fontWeight: '600', marginTop: Spacing.lg },
  emptyText: { color: Colors.textMuted, fontSize: FontSize.sm, marginTop: Spacing.sm },
});
