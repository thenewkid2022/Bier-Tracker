import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Linking,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { TwintService } from '../services/TwintService';

interface TwintPaymentRequestProps {
  userId: string;
  userName: string;
  currentBalance: number;
  onPaymentRequestSent: (amount: number, message: string) => void;
}

export const TwintPaymentRequest: React.FC<TwintPaymentRequestProps> = ({
  userId,
  userName,
  currentBalance,
  onPaymentRequestSent,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [amount, setAmount] = useState(currentBalance > 0 ? currentBalance.toString() : '');
  const [message, setMessage] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);
  const [adminConfig, setAdminConfig] = useState<any>(null);

  const twintService = TwintService.getInstance();

  useEffect(() => {
    // Admin-Konfiguration laden
    const config = twintService.getAdminConfig();
    setAdminConfig(config);
  }, []);

  const handleSendPaymentRequest = () => {
    const numAmount = parseFloat(amount);
    
    if (!twintService.validateAmount(numAmount)) {
      Alert.alert('Fehler', 'Bitte geben Sie einen gültigen Betrag ein (0.01 - 999999.99 CHF)');
      return;
    }

    if (!twintService.validateMessage(message)) {
      Alert.alert('Fehler', 'Nachricht ist zu lang (max. 140 Zeichen)');
      return;
    }

    try {
      const paymentRequest = twintService.generateUserPaymentRequest(
        userId,
        numAmount,
        message || `Offener Betrag für ${userName}`
      );

      // QR-Code anzeigen
      setShowQRCode(true);
      
      // Callback aufrufen
      onPaymentRequestSent(numAmount, message);
      
      Alert.alert(
        'TWINT-Zahlungsanfrage gesendet',
        `Zahlungsanfrage für ${numAmount.toFixed(2)} CHF wurde generiert.`,
        [
          {
            text: 'OK',
            onPress: () => {
              setShowQRCode(false);
              setIsModalVisible(false);
              // Formular zurücksetzen
              setAmount(currentBalance > 0 ? currentBalance.toString() : '');
              setMessage('');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Fehler beim Generieren der TWINT-Zahlungsanfrage:', error);
      Alert.alert('Fehler', 'Zahlungsanfrage konnte nicht generiert werden.');
    }
  };

  const openTwintApp = async () => {
    try {
      const numAmount = parseFloat(amount);
      
      // Prüfen ob TWINT-App verfügbar ist
      const canOpen = await twintService.canOpenTwintApp();
      
      if (canOpen) {
        const success = await twintService.openTwintApp(
          numAmount,
          message || `Offener Betrag für ${userName}`
        );
        
        if (success) {
          Alert.alert(
            'TWINT geöffnet', 
            'TWINT-App wurde geöffnet. Bitte führen Sie die Zahlung durch.',
            [
              {
                text: 'OK',
                onPress: () => {
                  console.log(`TWINT-Zahlung für ${userName}: ${numAmount} CHF gestartet`);
                }
              }
            ]
          );
        } else {
          throw new Error('TWINT-App konnte nicht geöffnet werden');
        }
      } else {
        // Fallback: TWINT im Browser öffnen
        const webUrl = `https://www.twint.ch/pay?amount=${numAmount.toFixed(2)}&message=${encodeURIComponent(message || `Offener Betrag für ${userName}`)}`;
        await Linking.openURL(webUrl);
        
        Alert.alert(
          'TWINT im Browser geöffnet',
          'TWINT wurde im Browser geöffnet. Bitte führen Sie die Zahlung durch.',
          [
            {
              text: 'OK',
              onPress: () => {
                console.log(`TWINT-Web-Zahlung für ${userName}: ${numAmount} CHF gestartet`);
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Fehler beim Öffnen von TWINT:', error);
      Alert.alert(
        'Fehler',
        'TWINT konnte nicht geöffnet werden. Bitte stellen Sie sicher, dass TWINT installiert ist oder verwenden Sie den QR-Code.',
        [{ text: 'OK' }]
      );
    }
  };

  const handlePaymentReturn = (paymentData: any) => {
    if (paymentData && paymentData.userId === userId) {
      Alert.alert(
        'Zahlungsrückkehr',
        `Zahlung für ${paymentData.amount} CHF wurde verarbeitet. Status: ${paymentData.status}`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Hier könnte man den Zahlungsstatus aktualisieren
              console.log('Zahlungsstatus aktualisiert:', paymentData);
            }
          }
        ]
      );
    }
  };

  return (
    <>
      <TouchableOpacity
        style={styles.paymentButton}
        onPress={() => setIsModalVisible(true)}
      >
        <MaterialIcons name="payment" size={20} color="#FFFFFF" />
        <Text style={styles.paymentButtonText}>TWINT Zahlungsanfrage</Text>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>TWINT-Zahlungsanfrage</Text>
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color="#000000" />
              </TouchableOpacity>
            </View>

            <Text style={styles.userInfo}>
              Benutzer: {userName}
            </Text>

            {/* Admin-Konfiguration anzeigen */}
            {adminConfig && (adminConfig.iban || adminConfig.merchantName) && (
              <View style={styles.adminConfigContainer}>
                <Text style={styles.adminConfigTitle}>Admin-Konfiguration</Text>
                {adminConfig.merchantName && (
                  <Text style={styles.adminConfigText}>
                    <Text style={styles.adminConfigLabel}>Name:</Text> {adminConfig.merchantName}
                  </Text>
                )}
                {adminConfig.iban && (
                  <Text style={styles.adminConfigText}>
                    <Text style={styles.adminConfigLabel}>IBAN:</Text> {adminConfig.iban}
                  </Text>
                )}
                {adminConfig.defaultMessage && (
                  <Text style={styles.adminConfigText}>
                    <Text style={styles.adminConfigLabel}>Standard-Nachricht:</Text> {adminConfig.defaultMessage}
                  </Text>
                )}
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Betrag (CHF)</Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                keyboardType="numeric"
                autoFocus
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Nachricht (optional)</Text>
              <TextInput
                style={styles.input}
                value={message}
                onChangeText={setMessage}
                placeholder={`Offener Betrag für ${userName}`}
                multiline
                maxLength={140}
              />
              <Text style={styles.characterCount}>
                {message.length}/140 Zeichen
              </Text>
            </View>

            {showQRCode && (
              <View style={styles.qrCodeContainer}>
                <Text style={styles.qrCodeTitle}>TWINT QR-Code</Text>
                <View style={styles.qrCodeWrapper}>
                  <QRCode
                    value={twintService.generatePaymentRequest(
                      parseFloat(amount),
                      message || `Offener Betrag für ${userName}`
                    )}
                    size={200}
                    color="#000000"
                    backgroundColor="#FFFFFF"
                  />
                </View>
                <Text style={styles.qrCodeInstructions}>
                  Scannen Sie diesen QR-Code mit der TWINT-App
                </Text>
              </View>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Abbrechen</Text>
              </TouchableOpacity>
              
              {!showQRCode ? (
                <TouchableOpacity
                  style={styles.sendButton}
                  onPress={handleSendPaymentRequest}
                >
                  <Text style={styles.sendButtonText}>Zahlungsanfrage senden</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.twintButton}
                  onPress={openTwintApp}
                >
                  <MaterialIcons name="open-in-new" size={20} color="#FFFFFF" />
                  <Text style={styles.twintButtonText}>TWINT öffnen</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  paymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00D4AA', // TWINT-Grün
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  paymentButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  closeButton: {
    padding: 4,
  },
  userInfo: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  characterCount: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'right',
    marginTop: 4,
  },
  qrCodeContainer: {
    alignItems: 'center',
    marginVertical: 20,
    padding: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  qrCodeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  qrCodeWrapper: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 12,
  },
  qrCodeInstructions: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#8E8E93',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  sendButton: {
    flex: 1,
    backgroundColor: '#00D4AA', // TWINT-Grün
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  twintButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00D4AA', // TWINT-Grün
    padding: 16,
    borderRadius: 8,
    justifyContent: 'center',
    gap: 8,
  },
  twintButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  adminConfigContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  adminConfigTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  adminConfigText: {
    fontSize: 14,
    color: '#000000',
    marginBottom: 4,
  },
  adminConfigLabel: {
    fontWeight: '500',
  },
});
