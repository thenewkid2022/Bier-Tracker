import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DatabaseService as DatabaseServiceType } from '../services/DatabaseService';

/**
 * DatabaseService ist ein Singleton. Pro Test wird die Modul-Registry zurückgesetzt,
 * damit jeder Test eine frische Instanz mit leerem AsyncStorage bekommt.
 * SQLite ist in Jest gemockt und schlägt fehl -> AsyncStorage-Fallback wird getestet.
 */
async function freshDb(): Promise<DatabaseServiceType> {
  jest.resetModules();
  const mod: typeof import('../services/DatabaseService') = require('../services/DatabaseService');
  return mod.DatabaseService.getInstance();
}

async function emptyDb(): Promise<DatabaseServiceType> {
  const db = await freshDb();
  await db.clearAllData();
  return db;
}

// Fixtures als Konstanten – der Service darf sie nicht mutieren (wird unten explizit getestet).
const user = Object.freeze({ id: 'u1', name: 'Anna', email: 'anna@example.com', balance: 0, monthlyCount: 0 });
const beer = Object.freeze({ id: 'd1', name: 'Bier', price: 3.5, stock: 10, iconKey: 'beer' });

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('DatabaseService – Initialisierung', () => {
  it('legt beim ersten Start Demo-Daten an', async () => {
    const db = await freshDb();
    const status = await db.getDatabaseStatus();
    expect(status.isInitialized).toBe(true);
    expect(status.tableCounts.users).toBe(3);
    expect(status.tableCounts.drinks).toBe(6);
    expect(status.tableCounts.consumptions).toBe(3);
  });

  it('seedet Demo-Daten nach clearAllData nicht erneut', async () => {
    const db = await emptyDb();
    const again = await freshDb();
    expect((await again.getAllUserProfiles()).length).toBe(0);
    expect(db).not.toBe(again);
  });
});

describe('DatabaseService – Persistenz (AsyncStorage-Fallback)', () => {
  it('überlebt einen Neustart der Instanz', async () => {
    const db = await emptyDb();
    await db.saveUserProfile(user);
    await db.saveDrink(beer);

    const reloaded = await freshDb();
    expect(await reloaded.getUserProfile('u1')).toEqual(user);
    expect(await reloaded.getDrink('d1')).toEqual(beer);
  });

  it('migriert alte ISO-Zeitstempel zu Unix-Millisekunden', async () => {
    const iso = '2024-05-01T10:00:00.000Z';
    await AsyncStorage.setItem('users', JSON.stringify([user]));
    await AsyncStorage.setItem('drinks', JSON.stringify([beer]));
    await AsyncStorage.setItem(
      'consumptions',
      JSON.stringify([{ id: 'c1', userId: 'u1', drinkId: 'd1', timestamp: iso, price: 3.5, quantity: 1 }])
    );
    await AsyncStorage.setItem('demo_seeded_v1', '1');

    const db = await freshDb();
    const consumptions = await db.getConsumptionsByUser('u1');
    expect(consumptions).toHaveLength(1);
    expect(consumptions[0]?.timestamp).toBe(Date.parse(iso));
  });

  it('verwirft korrupte Datensätze statt abzustürzen', async () => {
    await AsyncStorage.setItem('users', JSON.stringify([user, { id: 'broken', balance: 'x' }]));
    await AsyncStorage.setItem('demo_seeded_v1', '1');

    const db = await freshDb();
    const users = await db.getAllUserProfiles();
    expect(users).toHaveLength(1);
    expect(users[0]?.id).toBe('u1');
  });
});

describe('DatabaseService – recordPurchase', () => {
  it('bucht Kauf atomar: Balance sinkt, Bestand sinkt, Konsum wird angelegt', async () => {
    const db = await emptyDb();
    await db.saveUserProfile(user);
    await db.saveDrink(beer);

    const result = await db.recordPurchase({ userId: 'u1', drinkId: 'd1', quantity: 2 });

    expect(result.finalQuantity).toBe(2);
    expect(result.totalPrice).toBe(7);
    expect(result.updatedUser.balance).toBe(-7);
    expect(result.updatedUser.monthlyCount).toBe(2);
    expect(result.updatedDrink.stock).toBe(8);

    const consumptions = await db.getConsumptionsWithDrinkInfo('u1');
    expect(consumptions).toHaveLength(1);
    expect(consumptions[0]).toMatchObject({ drinkId: 'd1', price: 7, quantity: 2, drinkName: 'Bier', iconKey: 'beer' });
  });

  it('begrenzt die Menge auf Bestand und maximal 10', async () => {
    const db = await emptyDb();
    await db.saveUserProfile(user);
    await db.saveDrink({ ...beer, stock: 3 });

    const capped = await db.recordPurchase({ userId: 'u1', drinkId: 'd1', quantity: 99 });
    expect(capped.finalQuantity).toBe(3);
    expect(capped.updatedDrink.stock).toBe(0);

    await db.saveDrink({ ...beer, id: 'd2', stock: 50 });
    const maxTen = await db.recordPurchase({ userId: 'u1', drinkId: 'd2', quantity: 99 });
    expect(maxTen.finalQuantity).toBe(10);
  });

  it('mutiert weder übergebene noch zurückgegebene Objekte des Aufrufers', async () => {
    const db = await emptyDb();
    await db.saveUserProfile(user);
    await db.saveDrink(beer);

    const before = await db.getDrink('d1');
    await db.recordPurchase({ userId: 'u1', drinkId: 'd1', quantity: 1 });

    expect(beer.stock).toBe(10);
    expect(before?.stock).toBe(10);
    expect((await db.getDrink('d1'))?.stock).toBe(9);
  });

  it('wirft bei ausverkauftem Getränk oder unbekannten IDs', async () => {
    const db = await emptyDb();
    await db.saveUserProfile(user);
    await db.saveDrink({ ...beer, stock: 0 });

    await expect(db.recordPurchase({ userId: 'u1', drinkId: 'd1', quantity: 1 })).rejects.toThrow('Ausverkauft');
    await expect(db.recordPurchase({ userId: 'nope', drinkId: 'd1', quantity: 1 })).rejects.toThrow();
  });
});

describe('DatabaseService – Rollbacks beim Löschen', () => {
  it('deleteConsumption stellt Balance, Monatszähler und Bestand wieder her', async () => {
    const db = await emptyDb();
    await db.saveUserProfile(user);
    await db.saveDrink(beer);
    await db.recordPurchase({ userId: 'u1', drinkId: 'd1', quantity: 2 });
    const [consumption] = await db.getConsumptionsByUser('u1');

    await db.deleteConsumption(consumption!.id);

    expect(await db.getUserProfile('u1')).toMatchObject({ balance: 0, monthlyCount: 0 });
    expect((await db.getDrink('d1'))?.stock).toBe(10);
    expect(await db.getConsumptionsByUser('u1')).toHaveLength(0);
  });

  it('deleteUser gibt den Bestand der Käufe zurück', async () => {
    const db = await emptyDb();
    await db.saveUserProfile(user);
    await db.saveDrink(beer);
    await db.recordPurchase({ userId: 'u1', drinkId: 'd1', quantity: 4 });

    await db.deleteUser('u1');

    expect(await db.getUserProfile('u1')).toBeNull();
    expect((await db.getDrink('d1'))?.stock).toBe(10);
  });

  it('deleteDrink korrigiert Balance und Monatszähler betroffener Benutzer', async () => {
    const db = await emptyDb();
    await db.saveUserProfile(user);
    await db.saveDrink(beer);
    await db.recordPurchase({ userId: 'u1', drinkId: 'd1', quantity: 3 });

    await db.deleteDrink('d1');

    expect(await db.getDrink('d1')).toBeNull();
    expect(await db.getUserProfile('u1')).toMatchObject({ balance: 0, monthlyCount: 0 });
  });
});

describe('DatabaseService – applyPayment', () => {
  it('reduziert Schulden und deckelt bei 0', async () => {
    const db = await emptyDb();
    await db.saveUserProfile({ ...user, balance: -20 });

    await db.applyPayment('u1', 5);
    expect((await db.getUserProfile('u1'))?.balance).toBe(-15);

    await db.applyPayment('u1', 100);
    expect((await db.getUserProfile('u1'))?.balance).toBe(0);
  });
});
