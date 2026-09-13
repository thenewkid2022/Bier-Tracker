import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TwintService as TwintServiceType } from '../services/TwintService';

async function freshTwint(): Promise<TwintServiceType> {
  jest.resetModules();
  await AsyncStorage.clear();
  await AsyncStorage.setItem('demo_seeded_v1', '1');
  const mod: typeof import('../services/TwintService') = require('../services/TwintService');
  return mod.TwintService.getInstance();
}

describe('TwintService – Validierung', () => {
  it('validiert Schweizer IBANs (mit und ohne Leerzeichen)', async () => {
    const twint = await freshTwint();
    expect(twint.validateIBAN('CH93 0076 2011 6238 5295 7')).toBe(true);
    expect(twint.validateIBAN('CH9300762011623852957')).toBe(true);
    expect(twint.validateIBAN('DE89370400440532013000')).toBe(false);
    expect(twint.validateIBAN('CH93')).toBe(false);
  });

  it('validiert Schweizer Telefonnummern', async () => {
    const twint = await freshTwint();
    expect(twint.validatePhoneNumber('+41 79 123 45 67')).toBe(true);
    expect(twint.validatePhoneNumber('079 123 45 67')).toBe(true);
    expect(twint.validatePhoneNumber('12345')).toBe(false);
  });

  it('prüft TWINT-Limits für Betrag und Nachricht', async () => {
    const twint = await freshTwint();
    expect(twint.validateAmount(0)).toBe(false);
    expect(twint.validateAmount(0.01)).toBe(true);
    expect(twint.validateAmount(999999.99)).toBe(true);
    expect(twint.validateAmount(1_000_000)).toBe(false);
    expect(twint.validateMessage('x'.repeat(140))).toBe(true);
    expect(twint.validateMessage('x'.repeat(141))).toBe(false);
  });
});

describe('TwintService – Zahlungsanfragen', () => {
  it('erzeugt eine TWINT-URL mit Betrag, Nachricht und IBAN', async () => {
    const twint = await freshTwint();
    const url = twint.generatePaymentRequest(12.5, 'Bier & Wein', 'CH9300762011623852957');
    expect(url).toBe('twint://pay?amount=12.50&message=Bier%20%26%20Wein&iban=CH9300762011623852957');
  });

  it('nutzt Admin-Konfiguration für Standard-Nachricht und Anzeigename', async () => {
    const twint = await freshTwint();
    await twint.saveAdminConfig({ defaultMessage: 'Vereinskasse', merchantName: 'Kassier' });

    const request = twint.generateUserPaymentRequest('u1', 7, 'Offene Rechnung');
    expect(request.adminInfo).toBe('Kassier');
    expect(request.paymentUrl).toContain(encodeURIComponent('Vereinskasse - Offene Rechnung'));
    expect(request.deepLinkUrl).toBe('getraenke-tracker://payment-return?userId=u1&amount=7&status=pending');
  });

  it('speichert IBAN im SecureStore, nicht im AsyncStorage', async () => {
    const twint = await freshTwint();
    await twint.saveAdminConfig({ iban: 'CH9300762011623852957', merchantName: 'Kassier' });

    const raw = await AsyncStorage.getItem('twint_admin_config');
    expect(raw).not.toBeNull();
    expect(raw).not.toContain('CH9300762011623852957');
    expect((await twint.getAdminConfig()).iban).toBe('CH9300762011623852957');
  });
});

describe('TwintService – Deep Links', () => {
  it('parst den Payment-Return-Link der App', async () => {
    const twint = await freshTwint();
    const parsed = twint.parsePaymentReturnLink(
      'getraenke-tracker://payment-return?userId=u1&amount=25.5&status=completed'
    );
    expect(parsed).toEqual({ userId: 'u1', amount: 25.5, status: 'completed' });
  });

  it('ignoriert fremde Links', async () => {
    const twint = await freshTwint();
    expect(twint.parsePaymentReturnLink('https://example.com/?userId=u1')).toBeNull();
    expect(twint.parsePaymentReturnLink('getraenke-tracker://other')).toBeNull();
  });

  it('handleCompletedPayment verbucht die Zahlung auf dem Benutzer', async () => {
    const twint = await freshTwint();
    const dbModule: typeof import('../services/DatabaseService') = require('../services/DatabaseService');
    const db = dbModule.DatabaseService.getInstance();
    await db.clearAllData();
    await db.saveUserProfile({ id: 'u1', name: 'Anna', balance: -30, monthlyCount: 0 });

    await twint.handleCompletedPayment('u1', 10);
    expect((await db.getUserProfile('u1'))?.balance).toBe(-20);

    // Ungültiger Betrag wird ignoriert
    await twint.handleCompletedPayment('u1', 0);
    expect((await db.getUserProfile('u1'))?.balance).toBe(-20);
  });
});
