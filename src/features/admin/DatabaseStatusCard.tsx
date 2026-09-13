import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Badge, StatTile } from '../../components/ui';
import { colors, spacing, typography } from '../../theme';
import type { DbStatus } from '../../state/appStore';

type Props = {
  dbStatus: DbStatus | null;
  userCount: number;
  drinkCount: number;
};

export const DatabaseStatusCard: React.FC<Props> = ({ dbStatus, userCount, drinkCount }) => {
  const consumptionCount = dbStatus?.tableCounts.consumptions ?? 0;
  const ok = dbStatus?.isInitialized ?? false;

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <StatTile icon="group" label="Benutzer" value={String(userCount)} tone="primary" />
        <StatTile icon="sports-bar" label="Getränke" value={String(drinkCount)} tone="accent" />
        <StatTile icon="receipt-long" label="Buchungen" value={String(consumptionCount)} />
      </View>
      {dbStatus && (
        <View style={styles.statusRow}>
          <Text style={styles.statusText}>Lokale Datenbank</Text>
          <Badge label={ok ? 'Aktiv' : 'Fehler'} tone={ok ? 'success' : 'danger'} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  statusText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
