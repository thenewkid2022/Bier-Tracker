import React, { useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Button } from '../../components/ui';
import { colors, radius, shadow, spacing, typography } from '../../theme';

type Props = {
  isPinReady: boolean;
  onSubmit: (pin: string) => boolean;
};

const PIN_LENGTH = 4;

export const PinGate: React.FC<Props> = ({ isPinReady, onSubmit }) => {
  const [pinCode, setPinCode] = useState('');
  const [shake, setShake] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleSubmit = () => {
    const ok = onSubmit(pinCode);
    if (!ok) {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      Alert.alert('Falscher PIN', 'Bitte versuche es erneut.');
    }
    setPinCode('');
  };

  const canSubmit = pinCode.length === PIN_LENGTH && isPinReady;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <MaterialIcons name="lock-outline" size={30} color={colors.primary} />
        </View>
        <Text style={styles.title}>Admin-Bereich</Text>
        <Text style={styles.subtitle}>
          Gib den vierstelligen PIN ein, um Benutzer, Getränke und TWINT zu verwalten.
        </Text>

        {/* PIN-Anzeige als Punkte; Antippen fokussiert das (unsichtbare) Eingabefeld */}
        <Pressable
          onPress={() => inputRef.current?.focus()}
          accessibilityRole="button"
          accessibilityLabel="PIN eingeben"
          style={[styles.dots, shake && styles.dotsError]}
        >
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <View key={i} style={[styles.dot, i < pinCode.length && styles.dotFilled]} />
          ))}
        </Pressable>
        <TextInput
          ref={inputRef}
          style={styles.hiddenInput}
          value={pinCode}
          onChangeText={(t) => setPinCode(t.replace(/\D/g, '').slice(0, PIN_LENGTH))}
          keyboardType="number-pad"
          secureTextEntry
          maxLength={PIN_LENGTH}
          autoFocus
          onSubmitEditing={handleSubmit}
          accessibilityLabel="PIN-Code"
          caretHidden
        />

        <Button label="Entsperren" icon="lock-open" onPress={handleSubmit} disabled={!canSubmit} fullWidth size="lg" />
        <Text style={styles.hint}>Der PIN ist sicher im Keychain des Geräts gespeichert.</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xxl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 380,
    ...shadow.elevated,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.title,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  dots: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.sm,
  },
  dotsError: {
    transform: [{ translateX: 4 }],
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  dotFilled: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  hiddenInput: {
    // Bleibt fokussierbar, aber visuell unauffällig.
    width: 1,
    height: 1,
    opacity: 0.01,
    marginBottom: spacing.lg,
  },
  hint: {
    ...typography.small,
    fontWeight: '400',
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
