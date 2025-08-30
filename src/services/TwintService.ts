// TWINT-Service für Zahlungsanfragen
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface TwintAdminConfig {
  iban?: string;
  phoneNumber?: string;
  defaultMessage?: string;
  merchantName?: string;
}

export class TwintService {
  private static instance: TwintService;
  private adminConfig: TwintAdminConfig = {};

  private constructor() {
    this.loadAdminConfig();
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
      const config = await AsyncStorage.getItem('twint_admin_config');
      if (config) {
        this.adminConfig = JSON.parse(config);
      }
    } catch (error) {
      console.error('Fehler beim Laden der TWINT-Admin-Konfiguration:', error);
    }
  }

  // Admin-Konfiguration speichern
  async saveAdminConfig(config: TwintAdminConfig): Promise<void> {
    try {
      this.adminConfig = config;
      await AsyncStorage.setItem('twint_admin_config', JSON.stringify(config));
    } catch (error) {
      console.error('Fehler beim Speichern der TWINT-Admin-Konfiguration:', error);
      throw error;
    }
  }

  // Admin-Konfiguration abrufen
  getAdminConfig(): TwintAdminConfig {
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
      const paymentUrl = this.generatePaymentRequest(amount, message, iban);
      
      // Prüfen ob TWINT-App installiert ist
      const canOpen = await Linking.canOpenURL(paymentUrl);
      
      if (canOpen) {
        // TWINT-App öffnen
        await Linking.openURL(paymentUrl);
        return true;
      } else {
        // Fallback: TWINT im Browser öffnen
        const webUrl = `https://www.twint.ch/pay?amount=${amount.toFixed(2)}&message=${encodeURIComponent(message)}`;
        await Linking.openURL(webUrl);
        return true;
      }
    } catch (error) {
      console.error('Fehler beim Öffnen der TWINT-App:', error);
      return false;
    }
  }

  // Prüfen, ob TWINT-App installiert ist
  async canOpenTwintApp(): Promise<boolean> {
    try {
      const testUrl = 'twint://pay?amount=1.00&message=test';
      return await Linking.canOpenURL(testUrl);
    } catch (error) {
      console.error('Fehler beim Prüfen der TWINT-App:', error);
      return false;
    }
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
    const deepLinkUrl = `bierlounge-tracker://payment-return?userId=${userId}&amount=${amount}&status=pending`;
    
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
    return `bierlounge-tracker://payment-return?userId=${userId}&amount=${amount}&status=${status}`;
  }

  // Zahlungsstatus aus Deep Link extrahieren
  parsePaymentReturnLink(url: string): { userId?: string; amount?: number; status?: string } | null {
    try {
      const parsed = Linking.parse(url);
      if (parsed.scheme === 'bierlounge-tracker' && parsed.hostname === 'payment-return') {
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
}
