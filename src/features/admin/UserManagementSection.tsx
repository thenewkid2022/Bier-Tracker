import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { adminStyles } from './adminStyles';
import { colors, radius, spacing } from '../../theme';
import type { UserProfile } from '../../domain/schemas';

type Props = {
  users: UserProfile[];
  onAddUser: (input: { name: string; email: string }) => Promise<void>;
  onDeleteUser: (userId: string) => void;
  onRequestTwintPayment: (user: UserProfile) => void;
};

export const UserManagementSection: React.FC<Props> = ({ users, onAddUser, onDeleteUser, onRequestTwintPayment }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const resetForm = () => {
    setName('');
    setEmail('');
    setShowAddForm(false);
  };

  const handleAdd = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      await onAddUser({ name, email });
      resetForm();
    } catch {
      // Fehler wurde vom Parent bereits gemeldet; Eingaben bleiben zur Korrektur erhalten.
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={adminStyles.sectionContainer}>
      <View style={adminStyles.sectionHeader}>
        <Text style={adminStyles.sectionTitle}>Benutzer-Verwaltung</Text>
        <TouchableOpacity style={adminStyles.iconButton} onPress={() => setShowAddForm((v) => !v)}>
          <MaterialIcons name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {showAddForm && (
        <View style={adminStyles.addForm}>
          <TextInput style={adminStyles.input} placeholder="Benutzername" value={name} onChangeText={setName} />
          <TextInput
            style={adminStyles.input}
            placeholder="E-Mail (optional)"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <View style={adminStyles.formButtons}>
            <TouchableOpacity style={adminStyles.cancelButton} onPress={resetForm}>
              <Text style={adminStyles.cancelButtonText}>Abbrechen</Text>
            </TouchableOpacity>
            <TouchableOpacity style={adminStyles.saveButton} onPress={handleAdd} disabled={isSaving}>
              <Text style={adminStyles.saveButtonText}>Hinzufügen</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {users.map((user) => {
        const hasDebt = user.balance < 0;
        const debt = Math.abs(user.balance).toFixed(2);
        return (
          <View key={user.id} style={adminStyles.card}>
            <View style={adminStyles.cardHeader}>
              <View style={adminStyles.cardAvatar}>
                <MaterialIcons name="person" size={24} color={colors.primary} />
              </View>
              <View style={adminStyles.cardInfo}>
                <Text style={adminStyles.cardTitle}>{user.name}</Text>
                <Text style={adminStyles.cardSubtitle}>{user.email || 'Keine E-Mail'}</Text>
              </View>
              <View style={adminStyles.cardMetric}>
                <Text style={adminStyles.cardMetricLabel}>Offener Betrag</Text>
                <Text style={[adminStyles.cardMetricValue, hasDebt ? styles.balanceDebt : styles.balanceClear]}>
                  CHF {debt}
                </Text>
              </View>
            </View>

            <View style={styles.userCardDetails}>
              <View style={styles.userCardStat}>
                <MaterialIcons name="local-drink" size={16} color={colors.textSecondary} />
                <Text style={styles.userCardStatText}>{user.monthlyCount} Getränke diesen Monat</Text>
              </View>
              {hasDebt && (
                <View style={styles.userCardStat}>
                  <MaterialIcons name="payment" size={16} color={colors.success} />
                  <Text style={styles.userCardStatText}>Zahlung ausstehend</Text>
                </View>
              )}
            </View>

            <View style={styles.userCardActions}>
              <TouchableOpacity
                style={[styles.twintButton, hasDebt ? styles.twintButtonActive : styles.twintButtonDisabled]}
                onPress={() => {
                  if (hasDebt) {
                    onRequestTwintPayment(user);
                  } else {
                    Alert.alert('Info', `Kein offener Betrag. Balance: ${user.balance.toFixed(2)} CHF`);
                  }
                }}
              >
                <MaterialIcons name="payment" size={18} color={colors.textOnPrimary} />
                <Text style={styles.twintButtonText}>TWINT Zahlung ({hasDebt ? debt : '0'} CHF)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={adminStyles.deleteButton}
                onPress={() => onDeleteUser(user.id)}
                accessibilityLabel={`${user.name} löschen`}
              >
                <MaterialIcons name="delete" size={18} color={colors.danger} />
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  balanceClear: {
    color: colors.primary,
  },
  balanceDebt: {
    color: colors.danger,
  },
  userCardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  userCardStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userCardStatText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  userCardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  twintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    gap: spacing.sm,
  },
  twintButtonText: {
    color: colors.textOnPrimary,
    fontWeight: '600',
    fontSize: 14,
  },
  twintButtonActive: {
    backgroundColor: colors.twint,
  },
  twintButtonDisabled: {
    backgroundColor: colors.textSecondary,
    opacity: 0.6,
  },
});
