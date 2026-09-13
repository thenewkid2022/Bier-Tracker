// TWINT-Service für Zahlungsanfragen
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { DatabaseService } from './DatabaseService';

interface TwintAdminConfig {
  iban?: string;
  phoneNumber?: string;
  defaultMessage?: string;
  merchantName?: string;
}

const APP_SCHEME = 'getraenke-tracker';
const TWINT_CONFIG_KEY = 'twint_admin_config';
const TWINT_IBAN_KEY = 'twint_admin_iban';

export class TwintService {
  private static instance: TwintService;
  private adminConfig: TwintAdminConfig = {};
  private readonly dbService = DatabaseService.getInstance();
  private readonly ready: Promise<void>;

  private constructor() {
    this.ready = this.loadAdminConfig();
  }

  public static getInstance(): TwintService {
    if (!TwintService.instance) {
      TwintService.instance = new TwintService();
    }
    return TwintService.instance;
  }

  // Admin-Konfiguration laden
  private async loadAdminConfig() {
    try {
      const [config, iban] = await Promise.all([
        AsyncStorage.getItem(TWINT_CONFIG_KEY),
        SecureStore.getItemAsync(TWINT_IBAN_KEY),
      ]);
      if (config) {
        this.adminConfig = { ...JSON.parse(config), iban: iban ?? undefined };
      } else if (iban) {
        this.adminConfig = { iban };
      }
    } catch (error) {
      console.error('Fehler beim Laden der TWINT-Admin-Konfiguration:', error);
    }
  }

  // Admin-Konfiguration speichern
  async saveAdminConfig(config: TwintAdminConfig): Promise<void> {
    try {
      await this.ready;
      this.adminConfig = config;
      const storagePayload = {
        phoneNumber: config.phoneNumber,
        defaultMessage: config.defaultMessage,
        merchantName: config.merchantName,
      };
      await Promise.all([
        AsyncStorage.setItem(TWINT_CONFIG_KEY, JSON.stringify(storagePayload)),
        config.iban
          ? SecureStore.setItemAsync(TWINT_IBAN_KEY, config.iban)
          : SecureStore.deleteItemAsync(TWINT_IBAN_KEY),
      ]);
    } catch (error) {
      console.error('Fehler beim Speichern der TWINT-Admin-Konfiguration:', error);
      throw error;
    }
  }

  // Admin-Konfiguration abrufen
  async getAdminConfig(): Promise<TwintAdminConfig> {
    await this.ready;
    return { ...this.adminConfig };
  }

  // TWINT-Zahlungsanfrage generieren (mit Admin-Daten)
  generatePaymentRequest(amount: number, message: string = '', iban?: string): string {
    // Verwende Admin-IBAN falls verfügbar, sonst übergebene IBAN
    const useIban = iban || this.adminConfig.iban;
    
    // TWINT-Format: twint://pay?amount=XX.XX&message=XXX&iban=XXX
    let twintUrl = `twint://pay?amount=${amount.toFixed(2)}&message=${encodeURIComponent(message)}`;
    
    if (useIban) {
      twintUrl += `&iban=${encodeURIComponent(useIban)}`;
    }
    
    return twintUrl;
  }

  // TWINT-QR-Code für Zahlungsanfrage generieren
  generatePaymentQRCode(amount: number, message: string = '', iban?: string): string {
    const paymentUrl = this.generatePaymentRequest(amount, message, iban);
    return paymentUrl;
  }

  // TWINT-App öffnen (falls installiert)
  async openTwintApp(amount: number, message: string = '', iban?: string): Promise<boolean> {
    try {
      // Verschiedene TWINT-URL-Formate versuchen
      const twintUrls = [
        // Standard TWINT-Format
        `twint://pay?amount=${amount.toFixed(2)}&message=${encodeURIComponent(message)}`,
        // Alternative Formate
        `twint://pay?amount=${amount.toFixed(2)}&msg=${encodeURIComponent(message)}`,
        `twint://pay?amount=${amount.toFixed(2)}&text=${encodeURIComponent(message)}`,
        // Mit IBAN falls verfügbar
        `twint://pay?amount=${amount.toFixed(2)}&message=${encodeURIComponent(message)}&iban=${encodeURIComponent(iban || this.adminConfig.iban || '')}`,
        // Einfaches Format
        `twint://pay?amount=${amount.toFixed(2)}`
      ];
      
      // IBAN hinzufügen falls verfügbar
      const useIban = iban || this.adminConfig.iban;
      if (useIban) {
        twintUrls.push(`twint://pay?amount=${amount.toFixed(2)}&message=${encodeURIComponent(message)}&iban=${encodeURIComponent(useIban)}`);
      }
      
      // Verschiedene URLs versuchen
      for (const url of twintUrls) {
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
          return true;
        }
      }
      
      throw new Error('Keine TWINT-URL funktioniert');
    } catch (error) {
      console.error('Fehler beim Öffnen der TWINT-App:', error);
      return false;
    }
  }

  // Prüfen, ob TWINT-App installiert ist (vereinfacht)
  async canOpenTwintApp(): Promise<boolean> {
    return Linking.canOpenURL('twint://');
  }

  // Zahlungsanfrage für einen Benutzer generieren (mit Admin-Daten)
  generateUserPaymentRequest(userId: string, amount: number, description: string = ''): {
    paymentUrl: string;
    qrCodeData: string;
    message: string;
    deepLinkUrl: string;
    adminInfo: string;
  } {
    // Verwende Admin-Standard-Nachricht falls verfügbar
    const defaultMessage = this.adminConfig.defaultMessage || 'Getränke Tracker';
    const message = `${defaultMessage} - ${description}`.trim();
    
    const paymentUrl = this.generatePaymentRequest(amount, message);
    const deepLinkUrl = `${APP_SCHEME}://payment-return?userId=${userId}&amount=${amount}&status=pending`;
    
    // Admin-Informationen für Anzeige
    const adminInfo = this.adminConfig.merchantName || 'Admin';
    
    return {
      paymentUrl,
      qrCodeData: paymentUrl,
      message: `Zahlungsanfrage für ${amount.toFixed(2)} CHF`,
      deepLinkUrl,
      adminInfo
    };
  }

  // TWINT-Format validieren
  validateAmount(amount: number): boolean {
    return amount > 0 && amount <= 999999.99; // TWINT-Limits
  }

  // Nachricht validieren
  validateMessage(message: string): boolean {
    return message.length <= 140; // TWINT-Nachrichtenlimit
  }

  // IBAN validieren (einfache Format-Prüfung)
  validateIBAN(iban: string): boolean {
    // Einfache IBAN-Validierung für CH
    const chIbanPattern = /^CH[0-9]{2}[0-9]{5}[A-Z0-9]{12}$/;
    return chIbanPattern.test(iban.replace(/\s/g, ''));
  }

  // Telefonnummer validieren
  validatePhoneNumber(phone: string): boolean {
    // Einfache CH-Telefonnummer-Validierung
    const phonePattern = /^(\+41|0)[0-9]{9}$/;
    return phonePattern.test(phone.replace(/\s/g, ''));
  }

  // Deep Link für Zahlungsrückkehr generieren
  generatePaymentReturnLink(userId: string, amount: number, status: 'pending' | 'completed' | 'failed' = 'pending'): string {
    return `${APP_SCHEME}://payment-return?userId=${userId}&amount=${amount}&status=${status}`;
  }

  // Zahlungsstatus aus Deep Link extrahieren
  parsePaymentReturnLink(url: string): { userId?: string; amount?: number; status?: string } | null {
    try {
      const parsed = Linking.parse(url);
      if (parsed.scheme === APP_SCHEME && parsed.hostname === 'payment-return') {
        const queryParams = parsed.queryParams;
        return {
          userId: queryParams?.userId ? String(queryParams.userId) : undefined,
          amount: queryParams?.amount ? parseFloat(String(queryParams.amount)) : undefined,
          status: queryParams?.status ? String(queryParams.status) as 'pending' | 'completed' | 'failed' : undefined
        };
      }
      return null;
    } catch (error) {
      console.error('Fehler beim Parsen des Deep Links:', error);
      return null;
    }
  }

  async handleCompletedPayment(userId: string, amount: number): Promise<void> {
    if (!userId || !this.validateAmount(amount)) {
      return;
    }
    await this.dbService.applyPayment(userId, amount);
  }
}
