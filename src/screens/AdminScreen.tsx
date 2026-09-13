import React, { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore, ValidationError } from '../state/appStore';
import { colors, radius, spacing } from '../theme';
import type { UserProfile } from '../domain/schemas';
import { useAdminPin } from '../features/admin/useAdminPin';
import { PinGate } from '../features/admin/PinGate';
import { AdminHeader } from '../features/admin/AdminHeader';
import { DatabaseStatusCard } from '../features/admin/DatabaseStatusCard';
import { UserManagementSection } from '../features/admin/UserManagementSection';
import { DrinkManagementSection } from '../features/admin/DrinkManagementSection';
import { TwintSection } from '../features/admin/TwintSection';
import { adminStyles } from '../features/admin/adminStyles';

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

  // Falls der gerade ausgewählte TWINT-User zwischenzeitlich gelöscht wurde, Overlay schließen.
  useEffect(() => {
    if (twintPaymentUser && !users.some((u) => u.id === twintPaymentUser.id)) {
      setTwintPaymentUser(null);
    }
  }, [users, twintPaymentUser]);

  const handleAddUser = async (input: { name: string; email: string }) => {
    try {
      await addUser(input);
      await refreshAdminStatus();
      Alert.alert('Erfolg', 'Benutzer wurde hinzugefügt.');
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
      Alert.alert('Erfolg', 'Getränk wurde hinzugefügt.');
    } catch (error) {
      console.error('Fehler beim Hinzufügen des Getränks:', error);
      Alert.alert('Fehler', errorMessage(error, 'Getränk konnte nicht hinzugefügt werden.'));
      throw error;
    }
  };

  const handleDeleteUser = (userId: string) =>
    confirmDestructive('Benutzer löschen', 'Möchten Sie diesen Benutzer wirklich löschen?', 'Löschen', async () => {
      try {
        await deleteUser(userId);
        await refreshAdminStatus();
        Alert.alert('Erfolg', 'Benutzer wurde gelöscht.');
      } catch (error) {
        console.error('Fehler beim Löschen des Benutzers:', error);
        Alert.alert('Fehler', 'Benutzer konnte nicht gelöscht werden.');
      }
    });

  const handleDeleteDrink = (drinkId: string) =>
    confirmDestructive('Getränk löschen', 'Möchten Sie dieses Getränk wirklich löschen?', 'Löschen', async () => {
      try {
        await deleteDrink(drinkId);
        await refreshAdminStatus();
        Alert.alert('Erfolg', 'Getränk wurde gelöscht.');
      } catch (error) {
        console.error('Fehler beim Löschen des Getränks:', error);
        Alert.alert('Fehler', 'Getränk konnte nicht gelöscht werden.');
      }
    });

  const handleResetAllData = () =>
    confirmDestructive(
      'Alle Daten zurücksetzen',
      'Möchten Sie wirklich alle Daten zurücksetzen? Dies kann nicht rückgängig gemacht werden!',
      'Zurücksetzen',
      async () => {
        try {
          await resetDemoData();
          Alert.alert('Erfolg', 'Alle Daten wurden zurückgesetzt.');
        } catch (error) {
          console.error('Fehler beim Zurücksetzen der Daten:', error);
          Alert.alert('Fehler', 'Daten konnten nicht zurückgesetzt werden.');
        }
      }
    );

  const handleTwintPaymentRequestSent = async (userId: string, amount: number, message: string) => {
    // Die eigentliche Verbuchung passiert über den Deep-Link-Return (app/_layout.tsx).
    console.log(`TWINT-Zahlungsanfrage für Benutzer ${userId}: ${amount} CHF - ${message}`);
    await loadData();
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <PinGate isPinReady={isPinReady} onSubmit={verifyPin} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <AdminHeader isRefreshing={isHydrating} onRefresh={loadData} onLogout={logout} />

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

        <View style={adminStyles.sectionContainer}>
          <TouchableOpacity style={styles.resetButton} onPress={handleResetAllData}>
            <MaterialIcons name="refresh" size={24} color={colors.danger} />
            <Text style={styles.resetButtonText}>Alle Daten zurücksetzen</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceDanger,
    padding: spacing.lg,
    borderRadius: radius.sm,
    gap: spacing.md,
  },
  resetButtonText: {
    color: colors.danger,
    fontWeight: '600',
    fontSize: 16,
  },
});
