import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { adminStyles } from './adminStyles';
import { TwintAdminConfig } from '../../components/TwintAdminConfig';
import { TwintPaymentRequest } from '../../components/TwintPaymentRequest';
import { Button, SectionHeader } from '../../components/ui';
import { colors, radius, spacing, typography } from '../../theme';
import type { UserProfile } from '../../domain/schemas';

type Props = {
  /** Benutzer, für den gerade eine TWINT-Anfrage offen ist (null = kein Modal). */
  paymentUser: UserProfile | null;
  onClosePayment: () => void;
  onPaymentRequestSent: (userId: string, amount: number, message: string) => Promise<void>;
};

/**
 * TWINT-Sektion: Konfigurations-Karte + Konfigurations-Modal + Zahlungsanfrage-Modal.
 * Das Zahlungs-Modal wird vom Parent über `paymentUser` gesteuert, damit die
 * Benutzerliste den Trigger auslösen kann, ohne UI-State zu teilen.
 */
export const TwintSection: React.FC<Props> = ({ paymentUser, onClosePayment, onPaymentRequestSent }) => {
  const [showConfig, setShowConfig] = useState(false);

  return (
    <View style={adminStyles.section}>
      <SectionHeader title="TWINT" subtitle="Zahlungsanfragen per QR-Code" />
      <View style={styles.card}>
        <View style={styles.badge}>
          <MaterialIcons name="qr-code-2" size={26} color={colors.textOnPrimary} />
        </View>
        <View style={styles.texts}>
          <Text style={styles.title}>Deine TWINT-Daten</Text>
          <Text style={styles.description}>
            Anzeigename, IBAN und Standard-Nachricht für Zahlungsanfragen. Alles bleibt lokal auf dem Gerät.
          </Text>
        </View>
        <Button
          label="Konfigurieren"
          icon="settings"
          variant="secondary"
          size="sm"
          onPress={() => setShowConfig(true)}
        />
      </View>

      <TwintAdminConfig
        isVisible={showConfig}
        onClose={() => setShowConfig(false)}
        onConfigSaved={() => setShowConfig(false)}
      />

      <TwintPaymentRequest
        visible={paymentUser !== null}
        userId={paymentUser?.id ?? ''}
        userName={paymentUser?.name ?? ''}
        currentBalance={paymentUser?.balance ?? 0}
        onClose={onClosePayment}
        onPaymentRequestSent={async (amount, message) => {
          if (!paymentUser) return;
          await onPaymentRequestSent(paymentUser.id, amount, message);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  badge: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.twint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: {
    gap: spacing.xs,
  },
  title: {
    ...typography.heading,
    color: colors.textPrimary,
  },
  description: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
