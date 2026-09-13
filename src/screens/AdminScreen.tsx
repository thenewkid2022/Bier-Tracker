import React, { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore, ValidationError } from '../state/appStore';
import { colors, spacing, typography } from '../theme';
import type { UserProfile } from '../domain/schemas';
import { Button, Card, Screen } from '../components/ui';
import { useAdminPin } from '../features/admin/useAdminPin';
import { PinGate } from '../features/admin/PinGate';
import { AdminHeader } from '../features/admin/AdminHeader';
import { DatabaseStatusCard } from '../features/admin/DatabaseStatusCard';
import { UserManagementSection } from '../features/admin/UserManagementSection';
import { DrinkManagementSection } from '../features/admin/DrinkManagementSection';
import { TwintSection } from '../features/admin/TwintSection';

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof ValidationError ? error.message : fallback;
}

function confirmDestructive(title: string, message: string, confirmLabel: string, onConfirm: () => Promise<void>) {
  Alert.alert(title, message, [
    { text: 'Abbrechen', style: 'cancel' },
    {
      text: confirmLabel,
      style: 'destructive',
      onPress: () => {
        onConfirm().catch((error) => console.error(`${title} fehlgeschlagen:`, error));
      },
    },
  ]);
}

export const AdminScreen: React.FC = () => {
  const { isAuthenticated, isPinReady, verifyPin, logout } = useAdminPin();
  const [twintPaymentUser, setTwintPaymentUser] = useState<UserProfile | null>(null);

  const {
    users,
    drinks,
    dbStatus,
    isHydrating,
    hydrate,
    refreshAdminStatus,
    addUser,
    addDrink,
    deleteUser,
    deleteDrink,
    resetDemoData,
  } = useAppStore(
    useShallow((s) => ({
      users: s.users,
      drinks: s.drinks,
      dbStatus: s.dbStatus,
      isHydrating: s.isHydrating,
      hydrate: s.hydrate,
      refreshAdminStatus: s.refreshAdminStatus,
      addUser: s.addUser,
      addDrink: s.addDrink,
      deleteUser: s.deleteUser,
      deleteDrink: s.deleteDrink,
      resetDemoData: s.resetDemoData,
    }))
  );

  const loadData = useCallback(async () => {
    try {
      await hydrate();
      await refreshAdminStatus();
    } catch (error) {
      console.error('Fehler beim Laden der Daten:', error);
    }
  }, [hydrate, refreshAdminStatus]);

  useEffect(() => {
    if (isAuthenticated) {
      void loadData();
    }
  }, [isAuthenticated, loadData]);

  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        void loadData();
      }
    }, [isAuthenticated, loadData])
  );

  // Falls der gerade ausgewählte TWINT-User zwischenzeitlich gelöscht wurde, Modal schließen.
  useEffect(() => {
    if (twintPaymentUser && !users.some((u) => u.id === twintPaymentUser.id)) {
      setTwintPaymentUser(null);
    }
  }, [users, twintPaymentUser]);

  const handleAddUser = async (input: { name: string; email: string }) => {
    try {
      await addUser(input);
      await refreshAdminStatus();
    } catch (error) {
      console.error('Fehler beim Hinzufügen des Benutzers:', error);
      Alert.alert('Fehler', errorMessage(error, 'Benutzer konnte nicht hinzugefügt werden.'));
      throw error;
    }
  };

  const handleAddDrink = async (input: { name: string; price: string; stock: string; iconKey: string }) => {
    try {
      await addDrink(input);
      await refreshAdminStatus();
    } catch (error) {
      console.error('Fehler beim Hinzufügen des Getränks:', error);
      Alert.alert('Fehler', errorMessage(error, 'Getränk konnte nicht hinzugefügt werden.'));
      throw error;
    }
  };

  const handleDeleteUser = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    confirmDestructive(
      'Benutzer löschen',
      `${user?.name ?? 'Diesen Benutzer'} und alle zugehörigen Buchungen unwiderruflich löschen?`,
      'Löschen',
      async () => {
        try {
          await deleteUser(userId);
          await refreshAdminStatus();
        } catch (error) {
          console.error('Fehler beim Löschen des Benutzers:', error);
          Alert.alert('Fehler', 'Benutzer konnte nicht gelöscht werden.');
        }
      }
    );
  };

  const handleDeleteDrink = (drinkId: string) => {
    const drink = drinks.find((d) => d.id === drinkId);
    confirmDestructive(
      'Getränk löschen',
      `${drink?.name ?? 'Dieses Getränk'} aus dem Sortiment entfernen?`,
      'Löschen',
      async () => {
        try {
          await deleteDrink(drinkId);
          await refreshAdminStatus();
        } catch (error) {
          console.error('Fehler beim Löschen des Getränks:', error);
          Alert.alert('Fehler', 'Getränk konnte nicht gelöscht werden.');
        }
      }
    );
  };

  const handleResetAllData = () =>
    confirmDestructive(
      'Alle Daten zurücksetzen',
      'Alle Benutzer, Getränke und Buchungen werden gelöscht und durch Demo-Daten ersetzt. Das kann nicht rückgängig gemacht werden.',
      'Zurücksetzen',
      async () => {
        try {
          await resetDemoData();
        } catch (error) {
          console.error('Fehler beim Zurücksetzen der Daten:', error);
          Alert.alert('Fehler', 'Daten konnten nicht zurückgesetzt werden.');
        }
      }
    );

  const handleTwintPaymentRequestSent = async (_userId: string, _amount: number, _message: string) => {
    // Die eigentliche Verbuchung passiert über den Deep-Link-Return (app/_layout.tsx).
    await loadData();
  };

  if (!isAuthenticated) {
    return <PinGate isPinReady={isPinReady} onSubmit={verifyPin} />;
  }

  return (
    <Screen>
      <AdminHeader isRefreshing={isHydrating} onRefresh={() => void loadData()} onLogout={logout} />

      <DatabaseStatusCard dbStatus={dbStatus} userCount={users.length} drinkCount={drinks.length} />

      <UserManagementSection
        users={users}
        onAddUser={handleAddUser}
        onDeleteUser={handleDeleteUser}
        onRequestTwintPayment={setTwintPaymentUser}
      />

      <DrinkManagementSection drinks={drinks} onAddDrink={handleAddDrink} onDeleteDrink={handleDeleteDrink} />

      <TwintSection
        paymentUser={twintPaymentUser}
        onClosePayment={() => setTwintPaymentUser(null)}
        onPaymentRequestSent={handleTwintPaymentRequestSent}
      />

      <Card style={styles.dangerZone}>
        <Text style={styles.dangerTitle}>Gefahrenzone</Text>
        <Text style={styles.dangerText}>Setzt alle Daten auf den Auslieferungszustand mit Demo-Daten zurück.</Text>
        <Button
          label="Alle Daten zurücksetzen"
          icon="restart-alt"
          variant="dangerSoft"
          onPress={handleResetAllData}
          fullWidth
        />
      </Card>
    </Screen>
  );
};

const styles = StyleSheet.create({
  dangerZone: {
    borderWidth: 1,
    borderColor: colors.dangerSoft,
    gap: spacing.sm,
  },
  dangerTitle: {
    ...typography.heading,
    color: colors.danger,
  },
  dangerText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
});
