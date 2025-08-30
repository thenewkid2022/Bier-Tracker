import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { TwintService } from '../services/TwintService';

interface TwintAdminConfigProps {
  isVisible: boolean;
  onClose: () => void;
  onConfigSaved: () => void;
}

export const TwintAdminConfig: React.FC<TwintAdminConfigProps> = ({
  isVisible,
  onClose,
  onConfigSaved,
}) => {
  const [iban, setIban] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [defaultMessage, setDefaultMessage] = useState('');
  const [merchantName, setMerchantName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const twintService = TwintService.getInstance();

  useEffect(() => {
    console.log('TwintAdminConfig useEffect - isVisible:', isVisible); // Debug-Log
    if (isVisible) {
      loadCurrentConfig();
    }
  }, [isVisible]);

  const loadCurrentConfig = async () => {
    try {
      const config = twintService.getAdminConfig();
      console.log('Geladene TWINT-Konfiguration:', config); // Debug-Log
      setIban(config?.iban || '');
      setPhoneNumber(config?.phoneNumber || '');
      setDefaultMessage(config?.defaultMessage || '');
      setMerchantName(config?.merchantName || '');
    } catch (error) {
      console.error('Fehler beim Laden der Konfiguration:', error);
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);

      // Validierung
      if (iban && !twintService.validateIBAN(iban)) {
        Alert.alert('Fehler', 'Bitte geben Sie eine gültige Schweizer IBAN ein (z.B. CH93 0076 2011 6238 5295 7)');
        return;
      }

      if (phoneNumber && !twintService.validatePhoneNumber(phoneNumber)) {
        Alert.alert('Fehler', 'Bitte geben Sie eine gültige Schweizer Telefonnummer ein (z.B. +41 79 123 45 67 oder 079 123 45 67)');
        return;
      }

      if (defaultMessage && !twintService.validateMessage(defaultMessage)) {
        Alert.alert('Fehler', 'Die Standard-Nachricht ist zu lang (max. 140 Zeichen)');
        return;
      }

      // Konfiguration speichern
      await twintService.saveAdminConfig({
        iban: iban.trim() || undefined,
        phoneNumber: phoneNumber.trim() || undefined,
        defaultMessage: defaultMessage.trim() || undefined,
        merchantName: merchantName.trim() || undefined,
      });

      Alert.alert(
        'Erfolg',
        'TWINT-Admin-Konfiguration wurde gespeichert.',
        [
          {
            text: 'OK',
            onPress: () => {
              onConfigSaved();
              onClose();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Fehler beim Speichern der Konfiguration:', error);
      Alert.alert('Fehler', 'Konfiguration konnte nicht gespeichert werden.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Konfiguration zurücksetzen',
      'Möchten Sie wirklich alle TWINT-Einstellungen zurücksetzen?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Zurücksetzen',
          style: 'destructive',
          onPress: () => {
            setIban('');
            setPhoneNumber('');
            setDefaultMessage('');
            setMerchantName('');
          },
        },
      ]
    );
  };

  const formatIBAN = (text: string) => {
    // IBAN formatieren: CH93 0076 2011 6238 5295 7
    const cleaned = text.replace(/\s/g, '').toUpperCase();
    if (cleaned.startsWith('CH')) {
      const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
      return formatted;
    }
    return text;
  };

  const formatPhoneNumber = (text: string) => {
    // Telefonnummer formatieren: +41 79 123 45 67
    const cleaned = text.replace(/\s/g, '');
    if (cleaned.startsWith('+41')) {
      const formatted = cleaned.replace(/(\+41)(\d{2})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
      return formatted;
    } else if (cleaned.startsWith('0')) {
      const formatted = cleaned.replace(/(0\d{2})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4');
      return formatted;
    }
    return text;
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>TWINT-Admin-Konfiguration</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="#000000" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.scrollContent} 
            showsVerticalScrollIndicator={true}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            <Text style={styles.sectionTitle}>Persönliche TWINT-Daten</Text>
            <Text style={styles.sectionDescription}>
              Konfigurieren Sie Ihre privaten TWINT-Daten für Zahlungsanfragen.
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>IBAN (optional)</Text>
              <TextInput
                style={styles.input}
                value={iban}
                onChangeText={(text) => setIban(formatIBAN(text))}
                placeholder="CH93 0076 2011 6238 5295 7"
                autoCapitalize="characters"
                maxLength={27}
              />
              <Text style={styles.inputHint}>
                Für direkte Überweisungen. Wird automatisch formatiert.
              </Text>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Telefonnummer (optional)</Text>
              <TextInput
                style={styles.input}
                value={phoneNumber}
                onChangeText={(text) => setPhoneNumber(formatPhoneNumber(text))}
                placeholder="+41 79 123 45 67"
                keyboardType="phone-pad"
                maxLength={16}
              />
              <Text style={styles.inputHint}>
                Für TWINT-Identifikation. Wird automatisch formatiert.
              </Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Standard-Nachricht</Text>
              <TextInput
                style={styles.input}
                value={defaultMessage}
                onChangeText={setDefaultMessage}
                placeholder="Getränke Tracker"
                maxLength={140}
              />
              <Text style={styles.inputHint}>
                Wird allen Zahlungsanfragen vorangestellt. Max. 140 Zeichen.
              </Text>
              <Text style={styles.characterCount}>
                {defaultMessage.length}/140 Zeichen
              </Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Anzeigename</Text>
              <TextInput
                style={styles.input}
                value={merchantName}
                onChangeText={setMerchantName}
                placeholder="Ihr Name"
                maxLength={50}
              />
              <Text style={styles.inputHint}>
                Wird in der App als Admin angezeigt.
              </Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Standard-Nachricht</Text>
              <TextInput
                style={styles.input}
                value={defaultMessage}
                onChangeText={setDefaultMessage}
                placeholder="Getränke Tracker"
                maxLength={140}
              />
              <Text style={styles.inputHint}>
                Wird allen Zahlungsanfragen vorangestellt. Max. 140 Zeichen.
              </Text>
              <Text style={styles.characterCount}>
                {defaultMessage.length}/140 Zeichen
              </Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Anzeigename</Text>
              <TextInput
                style={styles.input}
                value={merchantName}
                onChangeText={setMerchantName}
                placeholder="Ihr Name"
                maxLength={50}
              />
              <Text style={styles.inputHint}>
                Wird in der App als Admin angezeigt.
              </Text>
            </View>

            <View style={styles.infoContainer}>
              <MaterialIcons name="info" size={20} color="#007AFF" />
              <Text style={styles.infoText}>
                Diese Daten werden nur lokal auf Ihrem Gerät gespeichert und für TWINT-Zahlungsanfragen verwendet.
              </Text>
            </View>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <MaterialIcons name="refresh" size={20} color="#FF3B30" />
              <Text style={styles.resetButtonText}>Zurücksetzen</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Abbrechen</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.saveButton, isLoading && styles.saveButtonDisabled]} 
              onPress={handleSave}
              disabled={isLoading}
            >
              <MaterialIcons name="save" size={20} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>
                {isLoading ? 'Speichern...' : 'Speichern'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 500,
    height: '90%',
    zIndex: 1001,
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
  scrollContent: {
    flex: 1,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 20,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 20,
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
  inputHint: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
    lineHeight: 16,
  },
  characterCount: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'right',
    marginTop: 4,
  },
  infoContainer: {
    flexDirection: 'row',
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  infoText: {
    fontSize: 12,
    color: '#007AFF',
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE5E5',
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  resetButtonText: {
    color: '#FF3B30',
    fontWeight: '600',
    fontSize: 14,
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
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00D4AA',
    padding: 16,
    borderRadius: 8,
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});
