import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, radius, shadow, spacing } from '../../theme';

type Props = {
  isPinReady: boolean;
  onSubmit: (pin: string) => boolean;
};

export const PinGate: React.FC<Props> = ({ isPinReady, onSubmit }) => {
  const [pinCode, setPinCode] = useState('');

  const handleSubmit = () => {
    const ok = onSubmit(pinCode);
    if (!ok) {
      Alert.alert('Fehler', 'Falscher PIN-Code. Bitte versuchen Sie es erneut.');
    }
    setPinCode('');
  };

  return (
    <View style={styles.loginContainer}>
      <View style={styles.loginCard}>
        <MaterialIcons name="admin-panel-settings" size={64} color={colors.primary} />
        <Text style={styles.loginTitle}>Admin-Zugang</Text>
        <Text style={styles.loginSubtitle}>Bitte geben Sie den PIN-Code ein</Text>

        <TextInput
          style={styles.pinInput}
          value={pinCode}
          onChangeText={setPinCode}
          placeholder="PIN-Code eingeben"
          keyboardType="numeric"
          secureTextEntry
          maxLength={4}
          textAlign="center"
          onSubmitEditing={handleSubmit}
        />

        <TouchableOpacity
          style={[styles.loginButton, (pinCode.length !== 4 || !isPinReady) && styles.loginButtonDisabled]}
          onPress={handleSubmit}
          disabled={pinCode.length !== 4 || !isPinReady}
        >
          <Text style={styles.loginButtonText}>Anmelden</Text>
        </TouchableOpacity>

        <Text style={styles.pinHint}>PIN in Secure Store gespeichert</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loginCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xxl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 350,
    ...shadow.elevated,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textStrong,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  loginSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: spacing.xl + spacing.xs,
    textAlign: 'center',
  },
  pinInput: {
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.lg,
    fontSize: 20,
    fontWeight: '600',
    width: '100%',
    marginBottom: spacing.xl + spacing.xs,
  },
  loginButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    borderRadius: radius.md,
    width: '100%',
    marginBottom: spacing.lg,
  },
  loginButtonDisabled: {
    opacity: 0.5,
  },
  loginButtonText: {
    color: colors.textOnPrimary,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  pinHint: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
