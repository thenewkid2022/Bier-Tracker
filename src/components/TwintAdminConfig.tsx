import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { TwintService } from '../services/TwintService';
import { Button, IconButton, TextField } from './ui';
import { colors, radius, spacing, typography } from '../theme';

interface TwintAdminConfigProps {
  isVisible: boolean;
  onClose: () => void;
  onConfigSaved: () => void;
}

const MESSAGE_MAX = 140;

export const TwintAdminConfig: React.FC<TwintAdminConfigProps> = ({ isVisible, onClose, onConfigSaved }) => {
  const insets = useSafeAreaInsets();
  const [iban, setIban] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [defaultMessage, setDefaultMessage] = useState('');
  const [merchantName, setMerchantName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const twintService = TwintService.getInstance();

  const loadCurrentConfig = useCallback(async () => {
    try {
      const config = await twintService.getAdminConfig();
      setIban(config?.iban || '');
      setPhoneNumber(config?.phoneNumber || '');
      setDefaultMessage(config?.defaultMessage || '');
      setMerchantName(config?.merchantName || '');
    } catch (error) {
      console.error('Fehler beim Laden der Konfiguration:', error);
    }
  }, [twintService]);

  useEffect(() => {
    if (isVisible) {
      void loadCurrentConfig();
    }
  }, [isVisible, loadCurrentConfig]);

  const handleSave = async () => {
    try {
      setIsLoading(true);

      if (iban && !twintService.validateIBAN(iban)) {
        Alert.alert('Ungültige IBAN', 'Bitte gib eine gültige Schweizer IBAN ein (z. B. CH93 0076 2011 6238 5295 7).');
        return;
      }
      if (phoneNumber && !twintService.validatePhoneNumber(phoneNumber)) {
        Alert.alert(
          'Ungültige Telefonnummer',
          'Bitte gib eine Schweizer Nummer ein (z. B. +41 79 123 45 67 oder 079 123 45 67).'
        );
        return;
      }
      if (defaultMessage && !twintService.validateMessage(defaultMessage)) {
        Alert.alert('Nachricht zu lang', `Maximal ${MESSAGE_MAX} Zeichen.`);
        return;
      }

      await twintService.saveAdminConfig({
        iban: iban.trim() || undefined,
        phoneNumber: phoneNumber.trim() || undefined,
        defaultMessage: defaultMessage.trim() || undefined,
        merchantName: merchantName.trim() || undefined,
      });

      onConfigSaved();
      onClose();
    } catch (error) {
      console.error('Fehler beim Speichern der Konfiguration:', error);
      Alert.alert('Fehler', 'Konfiguration konnte nicht gespeichert werden.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    Alert.alert('Felder leeren', 'Alle TWINT-Einstellungen in diesem Formular zurücksetzen?', [
      { text: 'Abbrechen', style: 'cancel' },
      {
        text: 'Leeren',
        style: 'destructive',
        onPress: () => {
          setIban('');
          setPhoneNumber('');
          setDefaultMessage('');
          setMerchantName('');
        },
      },
    ]);
  };

  const formatIBAN = (text: string) => {
    const cleaned = text.replace(/\s/g, '').toUpperCase();
    if (cleaned.startsWith('CH')) {
      return cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    }
    return text;
  };

  const formatPhoneNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    if (cleaned.startsWith('+41')) {
      return cleaned.replace(/(\+41)(\d{2})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
    }
    if (cleaned.startsWith('0')) {
      return cleaned.replace(/(0\d{2})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4');
    }
    return text;
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <MaterialIcons name="settings" size={22} color={colors.textOnPrimary} />
            </View>
            <View style={styles.headerTexts}>
              <Text style={styles.title}>TWINT-Konfiguration</Text>
              <Text style={styles.subtitle}>Wird nur lokal auf diesem Gerät gespeichert</Text>
            </View>
            <IconButton icon="close" accessibilityLabel="Schließen" onPress={onClose} />
          </View>

          <ScrollView
            style={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <TextField
              label="Anzeigename"
              value={merchantName}
              onChangeText={setMerchantName}
              placeholder="z. B. Vereinskasse"
              maxLength={50}
              hint="Erscheint als Empfänger in der Zahlungsanfrage."
            />
            <TextField
              label="IBAN (optional)"
              value={iban}
              onChangeText={(text) => setIban(formatIBAN(text))}
              placeholder="CH93 0076 2011 6238 5295 7"
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={27}
              hint="Wird automatisch formatiert."
            />
            <TextField
              label="Telefonnummer (optional)"
              value={phoneNumber}
              onChangeText={(text) => setPhoneNumber(formatPhoneNumber(text))}
              placeholder="+41 79 123 45 67"
              keyboardType="phone-pad"
              maxLength={16}
              hint="Für die TWINT-Identifikation."
            />
            <TextField
              label="Standard-Nachricht"
              value={defaultMessage}
              onChangeText={setDefaultMessage}
              placeholder="Getränke Tracker"
              maxLength={MESSAGE_MAX}
              hint="Wird jeder Zahlungsanfrage vorangestellt."
              trailingHint={`${defaultMessage.length}/${MESSAGE_MAX}`}
            />

            <View style={styles.infoBox}>
              <MaterialIcons name="lock-outline" size={18} color={colors.primary} />
              <Text style={styles.infoText}>
                Die IBAN liegt verschlüsselt im Keychain, die übrigen Angaben im lokalen Speicher. Es werden keine Daten
                an Server übertragen.
              </Text>
            </View>

            <Button
              label="Felder leeren"
              variant="ghost"
              icon="backspace"
              size="sm"
              onPress={handleReset}
              style={styles.resetButton}
            />
          </ScrollView>

          <View style={styles.actions}>
            <Button label="Abbrechen" variant="secondary" onPress={onClose} style={styles.actionSecondary} />
            <Button
              label="Speichern"
              icon="check"
              size="lg"
              onPress={handleSave}
              loading={isLoading}
              style={styles.actionPrimary}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  sheet: {
    width: '100%',
    maxWidth: 560,
    maxHeight: '92%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTexts: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    ...typography.heading,
    fontSize: 18,
    lineHeight: 24,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingBottom: spacing.sm,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm + 2,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.sm,
    padding: spacing.md,
  },
  infoText: {
    ...typography.caption,
    color: colors.primaryDark,
    flex: 1,
  },
  resetButton: {
    alignSelf: 'flex-start',
    marginTop: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  actionSecondary: {
    flex: 1,
    minHeight: 52,
  },
  actionPrimary: {
    flex: 2,
  },
});
