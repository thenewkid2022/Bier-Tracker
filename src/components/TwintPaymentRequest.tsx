import React, { useEffect, useState } from 'react';
import { Alert, Linking, Modal, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { TwintService, type TwintAdminConfig } from '../services/TwintService';
import { Button, IconButton, TextField } from './ui';
import { colors, formatChf, radius, spacing, typography } from '../theme';

interface TwintPaymentRequestProps {
  visible: boolean;
  userId: string;
  userName: string;
  currentBalance: number;
  onClose: () => void;
  onPaymentRequestSent: (amount: number, message: string) => void | Promise<void>;
}

const MESSAGE_MAX = 140;

/**
 * Modal für eine TWINT-Zahlungsanfrage: Betrag + Nachricht erfassen, QR-Code anzeigen,
 * teilen oder direkt die TWINT-App öffnen.
 */
export const TwintPaymentRequest: React.FC<TwintPaymentRequestProps> = ({
  visible,
  userId,
  userName,
  currentBalance,
  onClose,
  onPaymentRequestSent,
}) => {
  const insets = useSafeAreaInsets();
  const twintService = TwintService.getInstance();

  const defaultAmount = currentBalance < 0 ? Math.abs(currentBalance).toFixed(2) : '';
  const [amount, setAmount] = useState(defaultAmount);
  const [message, setMessage] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);
  const [adminConfig, setAdminConfig] = useState<TwintAdminConfig | null>(null);

  // Bei jedem Öffnen frisch starten (neuer Benutzer, neuer Betrag).
  useEffect(() => {
    if (!visible) return;
    setAmount(defaultAmount);
    setMessage('');
    setShowQRCode(false);
    twintService
      .getAdminConfig()
      .then(setAdminConfig)
      .catch((error) => console.error('Fehler beim Laden der Admin-Konfiguration:', error));
  }, [visible, defaultAmount, twintService]);

  const numAmount = parseFloat(amount.replace(',', '.'));
  const paymentMessage = message.trim() || `Offene Rechnung für ${userName}`;

  const handleGenerate = () => {
    if (!twintService.validateAmount(numAmount)) {
      Alert.alert('Ungültiger Betrag', 'Bitte gib einen Betrag zwischen CHF 0.01 und 999999.99 ein.');
      return;
    }
    if (!twintService.validateMessage(message)) {
      Alert.alert('Nachricht zu lang', `Maximal ${MESSAGE_MAX} Zeichen.`);
      return;
    }
    try {
      twintService.generateUserPaymentRequest(userId, numAmount, paymentMessage);
      setShowQRCode(true);
    } catch (error) {
      console.error('Fehler beim Generieren der TWINT-Zahlungsanfrage:', error);
      Alert.alert('Fehler', 'Zahlungsanfrage konnte nicht generiert werden.');
    }
  };

  const offerBrowserFallback = () => {
    Alert.alert('TWINT-App nicht gefunden', 'Möchtest du TWINT stattdessen im Browser öffnen?', [
      { text: 'Abbrechen', style: 'cancel' },
      {
        text: 'Im Browser öffnen',
        onPress: async () => {
          try {
            const webUrl = `https://www.twint.ch/pay?amount=${numAmount.toFixed(2)}&message=${encodeURIComponent(paymentMessage)}`;
            await Linking.openURL(webUrl);
          } catch (error) {
            console.error('Fehler beim Öffnen des Browsers:', error);
            Alert.alert('Fehler', 'Browser konnte nicht geöffnet werden.');
          }
        },
      },
    ]);
  };

  const openTwintApp = async () => {
    try {
      const success = await twintService.openTwintApp(numAmount, paymentMessage);
      if (!success) offerBrowserFallback();
    } catch (error) {
      console.error('Fehler beim Öffnen von TWINT:', error);
      offerBrowserFallback();
    }
  };

  const shareQRCode = async () => {
    try {
      const paymentUrl = twintService.generatePaymentRequest(numAmount, paymentMessage);
      await Share.share({
        title: `TWINT-Zahlungsanfrage – ${userName}`,
        message: `TWINT-Zahlungsanfrage für ${userName}\n\nBetrag: ${formatChf(numAmount)}\nNachricht: ${paymentMessage}\n\nQR-Code mit der TWINT-App scannen oder Link öffnen:\n${paymentUrl}`,
      });
    } catch (error) {
      console.error('Fehler beim Teilen des QR-Codes:', error);
      Alert.alert('Fehler', 'QR-Code konnte nicht geteilt werden.');
    }
  };

  const finish = async () => {
    if (showQRCode) {
      await onPaymentRequestSent(numAmount, message);
    }
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={() => void finish()}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <MaterialIcons name="qr-code-2" size={22} color={colors.textOnPrimary} />
            </View>
            <View style={styles.headerTexts}>
              <Text style={styles.title}>TWINT-Zahlungsanfrage</Text>
              <Text style={styles.subtitle} numberOfLines={1}>
                für {userName}
              </Text>
            </View>
            <IconButton icon="close" accessibilityLabel="Schließen" onPress={() => void finish()} />
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {adminConfig?.merchantName || adminConfig?.iban ? (
              <View style={styles.configBox}>
                <MaterialIcons name="account-balance" size={18} color={colors.textSecondary} />
                <View style={styles.configTexts}>
                  {adminConfig.merchantName ? (
                    <Text style={styles.configText} numberOfLines={1}>
                      Empfänger: <Text style={styles.configStrong}>{adminConfig.merchantName}</Text>
                    </Text>
                  ) : null}
                  {adminConfig.iban ? (
                    <Text style={styles.configText} numberOfLines={1}>
                      IBAN: <Text style={styles.configStrong}>{adminConfig.iban}</Text>
                    </Text>
                  ) : null}
                </View>
              </View>
            ) : null}

            {!showQRCode ? (
              <>
                <TextField
                  label="Betrag (CHF)"
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  autoFocus
                />
                <TextField
                  label="Nachricht (optional)"
                  value={message}
                  onChangeText={setMessage}
                  placeholder={`Offene Rechnung für ${userName}`}
                  multiline
                  maxLength={MESSAGE_MAX}
                  trailingHint={`${message.length}/${MESSAGE_MAX}`}
                />
              </>
            ) : (
              <View style={styles.qrBox}>
                <View style={styles.qrWrapper}>
                  <QRCode
                    value={twintService.generatePaymentRequest(numAmount, paymentMessage)}
                    size={200}
                    color={colors.textPrimary}
                    backgroundColor={colors.surface}
                  />
                </View>
                <Text style={styles.qrAmount}>{formatChf(numAmount)}</Text>
                <Text style={styles.qrMessage} numberOfLines={2}>
                  {paymentMessage}
                </Text>
                <Text style={styles.qrHint}>Mit der TWINT-App scannen, um die Zahlung auszulösen.</Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.actions}>
            {!showQRCode ? (
              <>
                <Button label="Abbrechen" variant="secondary" onPress={onClose} style={styles.actionSecondary} />
                <Button
                  label="QR-Code erzeugen"
                  icon="qr-code-2"
                  variant="twint"
                  size="lg"
                  onPress={handleGenerate}
                  disabled={!amount.trim()}
                  style={styles.actionPrimary}
                />
              </>
            ) : (
              <View style={styles.actionsStacked}>
                <Button
                  label="TWINT-App öffnen"
                  icon="open-in-new"
                  variant="twint"
                  size="lg"
                  onPress={openTwintApp}
                  fullWidth
                />
                <View style={styles.actionsRow}>
                  <Button
                    label="Teilen"
                    icon="share"
                    variant="secondary"
                    onPress={shareQRCode}
                    style={styles.actionSecondary}
                  />
                  <Button
                    label="Neue Anfrage"
                    icon="refresh"
                    variant="secondary"
                    onPress={() => setShowQRCode(false)}
                    style={styles.actionSecondary}
                  />
                </View>
                <Button label="Fertig" variant="ghost" onPress={() => void finish()} fullWidth />
              </View>
            )}
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
    maxWidth: 520,
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
    backgroundColor: colors.twint,
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
  configBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  configTexts: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  configText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  configStrong: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  qrBox: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  qrWrapper: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  qrAmount: {
    ...typography.display,
    color: colors.textPrimary,
  },
  qrMessage: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  qrHint: {
    ...typography.small,
    fontWeight: '400',
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  actionsStacked: {
    flex: 1,
    gap: spacing.sm + 2,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionSecondary: {
    flex: 1,
    minHeight: 52,
  },
  actionPrimary: {
    flex: 2,
  },
});
