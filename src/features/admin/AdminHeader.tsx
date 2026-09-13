import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../../theme';

type Props = {
  isRefreshing: boolean;
  onRefresh: () => void;
  onLogout: () => void;
};

export const AdminHeader: React.FC<Props> = ({ isRefreshing, onRefresh, onLogout }) => (
  <View style={styles.header}>
    <Text style={styles.headerTitle}>Admin-Bereich</Text>
    <View style={styles.headerButtons}>
      <TouchableOpacity
        style={[styles.refreshButton, isRefreshing && styles.refreshButtonActive]}
        onPress={onRefresh}
        disabled={isRefreshing}
        accessibilityLabel="Daten aktualisieren"
      >
        <MaterialIcons name="refresh" size={24} color={colors.primary} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.logoutButton} onPress={onLogout} accessibilityLabel="Abmelden">
        <MaterialIcons name="logout" size={24} color={colors.danger} />
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textStrong,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  refreshButton: {
    padding: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
  },
  refreshButtonActive: {
    backgroundColor: colors.surfaceActive,
  },
  logoutButton: {
    padding: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceDanger,
  },
});
