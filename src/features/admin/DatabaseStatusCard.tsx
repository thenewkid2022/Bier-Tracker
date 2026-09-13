import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../../theme';
import type { DbStatus } from '../../state/appStore';

type Props = {
  dbStatus: DbStatus | null;
  userCount: number;
  drinkCount: number;
};

export const DatabaseStatusCard: React.FC<Props> = ({ dbStatus, userCount, drinkCount }) => (
  <>
    {dbStatus && (
      <View style={styles.dbStatusContainer}>
        <Text style={styles.dbStatusTitle}>Datenbank-Status</Text>
        <View style={styles.dbStatusInfo}>
          <Text style={styles.dbStatusText}>Status: {dbStatus.isInitialized ? '✅ Aktiv' : '❌ Fehler'}</Text>
          <Text style={styles.dbStatusText}>
            Benutzer: {dbStatus.tableCounts.users ?? 0} | Getränke: {dbStatus.tableCounts.drinks ?? 0} | Konsum:{' '}
            {dbStatus.tableCounts.consumptions ?? 0}
          </Text>
        </View>
      </View>
    )}

    <View style={styles.overviewContainer}>
      <View style={styles.overviewItem}>
        <Text style={styles.overviewValue}>{userCount}</Text>
        <Text style={styles.overviewLabel}>Benutzer</Text>
      </View>
      <View style={styles.overviewItem}>
        <Text style={styles.overviewValue}>{drinkCount}</Text>
        <Text style={styles.overviewLabel}>Getränke</Text>
      </View>
    </View>
  </>
);

const styles = StyleSheet.create({
  dbStatusContainer: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  dbStatusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  dbStatusInfo: {
    alignItems: 'center',
  },
  dbStatusText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  overviewContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.lg,
  },
  overviewItem: {
    flex: 1,
    alignItems: 'center',
  },
  overviewValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  overviewLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
