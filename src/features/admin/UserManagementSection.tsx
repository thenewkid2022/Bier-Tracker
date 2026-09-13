import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { adminStyles } from './adminStyles';
import { Avatar, Badge, Button, EmptyState, IconButton, SectionHeader, TextField } from '../../components/ui';
import { colors, formatChf } from '../../theme';
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
    <View style={adminStyles.section}>
      <SectionHeader
        title="Benutzer"
        subtitle={`${users.length} ${users.length === 1 ? 'Person' : 'Personen'}`}
        action={
          <IconButton
            icon={showAddForm ? 'close' : 'person-add'}
            tone="primary"
            onPress={() => setShowAddForm((v) => !v)}
            accessibilityLabel={showAddForm ? 'Formular schließen' : 'Benutzer hinzufügen'}
          />
        }
      />

      {showAddForm && (
        <View style={adminStyles.addForm}>
          <Text style={adminStyles.addFormTitle}>Neuer Benutzer</Text>
          <TextField label="Name" placeholder="z. B. Anna Muster" value={name} onChangeText={setName} autoFocus />
          <TextField
            label="E-Mail (optional)"
            placeholder="anna@example.ch"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <View style={adminStyles.formButtons}>
            <Button label="Abbrechen" variant="secondary" onPress={resetForm} style={adminStyles.formButton} />
            <Button
              label="Hinzufügen"
              icon="check"
              onPress={handleAdd}
              loading={isSaving}
              disabled={name.trim().length === 0}
              style={adminStyles.formButton}
            />
          </View>
        </View>
      )}

      {users.length === 0 && !showAddForm ? (
        <EmptyState
          icon="person-add"
          title="Noch keine Benutzer"
          message="Füge über das Plus oben rechts die erste Person hinzu."
        />
      ) : (
        users.map((user) => {
          const hasDebt = user.balance < 0;
          const debt = Math.abs(user.balance);
          return (
            <View key={user.id} style={adminStyles.card}>
              <View style={adminStyles.cardHeader}>
                <Avatar name={user.name} size={44} />
                <View style={adminStyles.cardInfo}>
                  <Text style={adminStyles.cardTitle} numberOfLines={1}>
                    {user.name}
                  </Text>
                  <Text style={adminStyles.cardSubtitle} numberOfLines={1}>
                    {user.email || 'Keine E-Mail'}
                  </Text>
                </View>
                <View style={adminStyles.cardMetric}>
                  <Text style={adminStyles.cardMetricLabel}>{hasDebt ? 'Offen' : 'Guthaben'}</Text>
                  <Text style={[adminStyles.cardMetricValue, hasDebt ? styles.debt : styles.ok]}>
                    {formatChf(hasDebt ? debt : user.balance)}
                  </Text>
                </View>
              </View>

              <View style={adminStyles.cardFooter}>
                <View style={adminStyles.metaRow}>
                  <MaterialIcons name="local-bar" size={16} color={colors.textMuted} />
                  <Text style={adminStyles.metaText} numberOfLines={1}>
                    {user.monthlyCount} Getränke diesen Monat
                  </Text>
                </View>
                {hasDebt ? (
                  <Badge label="Zahlung offen" tone="danger" />
                ) : (
                  <Badge label="Ausgeglichen" tone="success" />
                )}
              </View>

              <View style={styles.actions}>
                <Button
                  label={hasDebt ? `TWINT-Anfrage · ${formatChf(debt)}` : 'Kein offener Betrag'}
                  icon="qr-code-2"
                  variant="twint"
                  size="sm"
                  disabled={!hasDebt}
                  onPress={() => onRequestTwintPayment(user)}
                  style={styles.twintButton}
                />
                <IconButton
                  icon="delete-outline"
                  tone="danger"
                  onPress={() => onDeleteUser(user.id)}
                  accessibilityLabel={`${user.name} löschen`}
                />
              </View>
            </View>
          );
        })
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  ok: {
    color: colors.success,
  },
  debt: {
    color: colors.danger,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  twintButton: {
    flex: 1,
    minHeight: 40,
  },
});
