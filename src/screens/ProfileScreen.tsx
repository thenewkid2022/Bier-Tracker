import React, { useCallback, useEffect } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useShallow } from 'zustand/react/shallow';
import { DrinkIcon } from '../components/DrinkIcon';
import {
  Avatar,
  Button,
  Card,
  EmptyState,
  IconButton,
  Screen,
  SectionHeader,
  StatTile,
  UserChip,
} from '../components/ui';
import { useAppStore } from '../state/appStore';
import { colors, formatChf, spacing, typography } from '../theme';
import type { Consumption } from '../domain/schemas';

const RECENT_LIMIT = 10;

function nameOf(c: Consumption): string {
  return c.drinkName ?? 'Getränk';
}

function formatDate(timestamp: Consumption['timestamp']): string {
  const d = new Date(timestamp);
  return `${d.toLocaleDateString('de-CH')} · ${d.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' })}`;
}

export const ProfileScreen: React.FC = () => {
  const {
    users,
    drinks,
    selectedUserId,
    profileConsumptions,
    profileTotalSpent,
    hydrate,
    loadProfile,
    resetBalance,
    deleteConsumption,
  } = useAppStore(
    useShallow((s) => ({
      users: s.users,
      drinks: s.drinks,
      selectedUserId: s.selectedUserId,
      profileConsumptions: s.profileConsumptions,
      profileTotalSpent: s.profileTotalSpent,
      hydrate: s.hydrate,
      loadProfile: s.loadProfile,
      resetBalance: s.resetBalance,
      deleteConsumption: s.deleteConsumption,
    }))
  );

  const selectedUser = selectedUserId ? (users.find((u) => u.id === selectedUserId) ?? null) : null;
  const { width } = useWindowDimensions();
  const horizontalPadding = width >= 600 ? spacing.xxl : spacing.lg;

  useEffect(() => {
    hydrate().catch((error) => console.error('Fehler beim Hydraten:', error));
  }, [hydrate]);

  useFocusEffect(
    useCallback(() => {
      const run = async () => {
        try {
          if (selectedUserId) {
            await loadProfile(selectedUserId);
          } else {
            await hydrate();
          }
        } catch (error) {
          console.error('Fehler beim Laden des Profils:', error);
        }
      };
      void run();
    }, [selectedUserId, hydrate, loadProfile])
  );

  const iconKeyForDrink = (drinkId: string, fallbackName: string): string =>
    drinks.find((d) => d.id === drinkId)?.iconKey ?? (fallbackName.toLowerCase().includes('bier') ? 'beer' : 'default');

  const handleResetBalance = () => {
    if (!selectedUser) return;
    const hasDebt = selectedUser.balance < 0;
    Alert.alert(
      hasDebt ? 'Schulden begleichen' : 'Guthaben zurücksetzen',
      hasDebt
        ? `${formatChf(Math.abs(selectedUser.balance))} von ${selectedUser.name} als bezahlt markieren?`
        : `Guthaben von ${selectedUser.name} auf CHF 0.00 setzen?`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: hasDebt ? 'Als bezahlt markieren' : 'Zurücksetzen',
          style: hasDebt ? 'default' : 'destructive',
          onPress: async () => {
            try {
              await resetBalance(selectedUser.id);
            } catch (error) {
              console.error('Fehler beim Zurücksetzen der Balance:', error);
              Alert.alert('Fehler', 'Balance konnte nicht zurückgesetzt werden.');
            }
          },
        },
      ]
    );
  };

  const handleDeleteConsumption = (consumption: Consumption) => {
    Alert.alert('Einkauf löschen', `${nameOf(consumption)} (${formatChf(consumption.price)}) stornieren?`, [
      { text: 'Abbrechen', style: 'cancel' },
      {
        text: 'Löschen',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteConsumption(consumption.id);
            if (selectedUser) await loadProfile(selectedUser.id);
          } catch (error) {
            console.error('Fehler beim Löschen des Einkaufs:', error);
            Alert.alert('Fehler', 'Einkauf konnte nicht gelöscht werden.');
          }
        },
      },
    ]);
  };

  if (users.length === 0) {
    return (
      <Screen>
        <EmptyState
          icon="person-off"
          title="Noch keine Benutzer"
          message="Lege im Admin-Bereich einen Benutzer an, um hier Guthaben und Einkäufe zu sehen."
        />
      </Screen>
    );
  }

  const hasDebt = (selectedUser?.balance ?? 0) < 0;
  const recent = profileConsumptions.slice(0, RECENT_LIMIT);

  return (
    <Screen>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.chipScroll, { marginHorizontal: -horizontalPadding }]}
        contentContainerStyle={[styles.chipRow, { paddingHorizontal: horizontalPadding }]}
      >
        {users.map((user) => (
          <UserChip
            key={user.id}
            name={user.name}
            selected={selectedUser?.id === user.id}
            onPress={() => void loadProfile(user.id)}
          />
        ))}
      </ScrollView>

      {selectedUser && (
        <>
          {/* Kopfbereich */}
          <Card style={styles.headerCard}>
            <View style={styles.headerRow}>
              <Avatar name={selectedUser.name} size={64} />
              <View style={styles.headerTexts}>
                <Text style={styles.userName} numberOfLines={1}>
                  {selectedUser.name}
                </Text>
                <Text style={styles.userEmail} numberOfLines={1}>
                  {selectedUser.email || 'Keine E-Mail hinterlegt'}
                </Text>
              </View>
              <IconButton
                icon="refresh"
                tone="primary"
                accessibilityLabel="Profil aktualisieren"
                onPress={() => void loadProfile(selectedUser.id)}
              />
            </View>

            <View style={[styles.balanceBox, hasDebt ? styles.balanceBoxDebt : styles.balanceBoxOk]}>
              <Text style={[styles.balanceLabel, hasDebt ? styles.balanceTextDebt : styles.balanceTextOk]}>
                {hasDebt ? 'Offener Betrag' : 'Guthaben'}
              </Text>
              <Text
                style={[styles.balanceValue, hasDebt ? styles.balanceTextDebt : styles.balanceTextOk]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
              >
                {formatChf(Math.abs(selectedUser.balance))}
              </Text>
            </View>
          </Card>

          {/* Kennzahlen */}
          <View style={styles.statRow}>
            <StatTile
              icon="local-bar"
              label="Getränke diesen Monat"
              value={String(selectedUser.monthlyCount)}
              tone="primary"
            />
            <StatTile
              icon="receipt-long"
              label="Gesamt ausgegeben"
              value={formatChf(profileTotalSpent)}
              tone="accent"
            />
          </View>

          <Button
            label={hasDebt ? 'Als bezahlt markieren' : 'Guthaben zurücksetzen'}
            icon={hasDebt ? 'check-circle' : 'restart-alt'}
            variant={hasDebt ? 'primary' : 'secondary'}
            onPress={handleResetBalance}
            fullWidth
            style={styles.resetButton}
          />

          {/* Verlauf */}
          <SectionHeader
            title="Letzte Einkäufe"
            subtitle={recent.length > 0 ? `Die letzten ${recent.length} Buchungen` : undefined}
          />
          {recent.length === 0 ? (
            <EmptyState
              icon="receipt"
              title="Noch keine Einkäufe"
              message="Buchungen erscheinen hier, sobald etwas gekauft wurde."
            />
          ) : (
            <Card flush>
              {recent.map((c, index) => (
                <View key={c.id} style={[styles.row, index < recent.length - 1 && styles.rowDivider]}>
                  <DrinkIcon iconKey={iconKeyForDrink(c.drinkId, nameOf(c))} size={20} boxed />
                  <View style={styles.rowTexts}>
                    <Text style={styles.rowTitle} numberOfLines={1}>
                      {nameOf(c)}
                    </Text>
                    <Text style={styles.rowMeta} numberOfLines={1}>
                      {formatDate(c.timestamp)}
                    </Text>
                  </View>
                  <Text style={styles.rowPrice}>{formatChf(c.price)}</Text>
                  <IconButton
                    icon="delete-outline"
                    tone="danger"
                    size={18}
                    accessibilityLabel={`${nameOf(c)} löschen`}
                    onPress={() => handleDeleteConsumption(c)}
                    style={styles.rowDelete}
                  />
                </View>
              ))}
            </Card>
          )}
        </>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  chipScroll: {
    marginBottom: spacing.lg,
  },
  chipRow: {
    gap: spacing.sm + 2,
  },

  headerCard: {
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerTexts: {
    flex: 1,
    minWidth: 0,
  },
  userName: {
    ...typography.title,
    color: colors.textPrimary,
  },
  userEmail: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  balanceBox: {
    marginTop: spacing.lg,
    borderRadius: 14,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  balanceBoxOk: {
    backgroundColor: colors.successSoft,
  },
  balanceBoxDebt: {
    backgroundColor: colors.dangerSoft,
  },
  balanceLabel: {
    ...typography.bodyStrong,
  },
  balanceValue: {
    ...typography.title,
    flexShrink: 1,
    textAlign: 'right',
  },
  balanceTextOk: {
    color: colors.success,
  },
  balanceTextDebt: {
    color: colors.danger,
  },

  statRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  resetButton: {
    marginBottom: spacing.xl,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowTexts: {
    flex: 1,
    minWidth: 0,
  },
  rowTitle: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
  },
  rowMeta: {
    ...typography.small,
    fontWeight: '400',
    color: colors.textMuted,
    marginTop: 1,
  },
  rowPrice: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
    flexShrink: 0,
  },
  rowDelete: {
    width: 36,
    height: 36,
  },
});
