import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { adminStyles } from './adminStyles';
import { TwintAdminConfig } from '../../components/TwintAdminConfig';
import { TwintPaymentRequest } from '../../components/TwintPaymentRequest';
import { colors, radius, shadow, spacing } from '../../theme';
import type { UserProfile } from '../../domain/schemas';

type Props = {
  /** Benutzer, für den gerade eine TWINT-Anfrage offen ist (null = kein Modal). */
  paymentUser: UserProfile | null;
  onClosePayment: () => void;
  onPaymentRequestSent: (userId: string, amount: number, message: string) => Promise<void>;
};

/**
 * TWINT-Konfigurationssektion inkl. Konfigurations-Modal und Zahlungsanfrage-Overlay.
 * Das Zahlungs-Overlay wird vom Parent über `paymentUser` gesteuert, damit die
 * Benutzerliste den Trigger auslösen kann, ohne UI-State zu teilen.
 */
export const TwintSection: React.FC<Props> = ({ paymentUser, onClosePayment, onPaymentRequestSent }) => {
  const [showConfig, setShowConfig] = useState(false);

  return (
    <>
      <View style={adminStyles.sectionContainer}>
        <View style={adminStyles.sectionHeader}>
          <Text style={adminStyles.sectionTitle}>TWINT-Konfiguration</Text>
          <TouchableOpacity style={adminStyles.iconButton} onPress={() => setShowConfig(true)}>
            <MaterialIcons name="settings" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <Text style={adminStyles.sectionDescription}>
          Konfigurieren Sie Ihre privaten TWINT-Daten für Zahlungsanfragen.
        </Text>
      </View>

      <TwintAdminConfig
        isVisible={showConfig}
        onClose={() => setShowConfig(false)}
        onConfigSaved={() => setShowConfig(false)}
      />

      {paymentUser && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>TWINT-Zahlungsanfrage</Text>
              <TouchableOpacity style={styles.modalCloseButton} onPress={onClosePayment} accessibilityLabel="Schließen">
                <MaterialIcons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <TwintPaymentRequest
              userId={paymentUser.id}
              userName={paymentUser.name}
              currentBalance={paymentUser.balance}
              onPaymentRequestSent={async (amount, message) => {
                await onPaymentRequestSent(paymentUser.id, amount, message);
                onClosePayment();
              }}
            />
          </View>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    margin: spacing.xl,
    maxWidth: 400,
    width: '90%',
    ...shadow.modal,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  modalCloseButton: {
    padding: spacing.xs,
  },
});
